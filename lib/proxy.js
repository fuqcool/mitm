'use strict'

const http = require('http')
const https = require('https')
const net = require('net')
const url = require('url')
const fs = require('fs')
const path = require('path')
const request = require('request')
const tls = require('tls')
const CertFactory = require('./cert')
const Rule = require('./rule')

const PROXY_PORT = 8001
const MITM_PORT = 8002

let certFactory = new CertFactory(
  fs.readFileSync(path.join(__dirname, '../cert/rootCA.key')),
  fs.readFileSync(path.join(__dirname, '../cert/rootCA.crt'))
)

let rules = []

function handler(protocol) {
  return (req, res) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk 
    })

    let target = protocol + '://' + req.headers.host + url.parse(req.url).path

    req.on('end', () => {
      console.log(req.method, target)

      let options = {
        url: target,
        method: req.method,
        headers: req.headers,
        gzip: true,
        body
      }

      let rule = rules.find((r) => { 
        return r.match(options.url) 
      })
      rule && rule.requestHandler(options)

      proxyRequest(options, res)
    })
  }
}

function proxyRequest(options, res) {
  request(options, (err, proxyRes, body) => {
    if (err) {
      console.log(err)
      return res.end()
    }

    delete proxyRes.headers['content-encoding']

    let rule = rules.find((r) => {
      return r.match(options.url)
    })

    let resObj = {
      status: proxyRes.statusCode,
      headers: proxyRes.headers,
      body
    }
    rule && rule.responseHandler(resObj)

    res.writeHead(resObj.status, resObj.headers)
    res.write(resObj.body)
    res.end()
  })
}

let server = http.createServer(handler('http'))
let mitm = https.createServer({
  // dynamically issue certificates
  SNICallback: (host, cb) => {
    certFactory.issue(host).then((c) => {
      cb(null, tls.createSecureContext(c))
    })
  }
}, handler('https'))

server.addListener('connect', (req, socket) => {
  let proxy = net.createConnection(MITM_PORT, 'localhost')

  proxy.on('connect', () => {
    socket.write('HTTP/1.0 200 Connection established\r\n\r\n')
  })

  proxy.on('data', (data) => socket.write(data))
  socket.on('data', (data) => proxy.write(data))

  proxy.on('end', () => socket.end())
  socket.on('end', () => proxy.end())

  proxy.on('close', () => socket.end())
  socket.on('close', () => proxy.end())

  proxy.on('error', () => socket.end())
  socket.on('error', () => proxy.end())
})

server.addListener('error', (err) => console.log(err))

server.listen(PROXY_PORT, 'localhost', () => {
  console.log('server listenning...')
})

mitm.listen(MITM_PORT, 'localhost', () => {
  console.log('mitm server listenning...')
})

