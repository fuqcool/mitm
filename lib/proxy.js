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

let rootCertPem = fs.readFileSync(path.join(__dirname, '../cert/rootCA.crt'))
let rootKeyPem = fs.readFileSync(path.join(__dirname, '../cert/rootCA.key'))

let certFactory = new CertFactory(rootKeyPem, rootCertPem)

let cert = {
  key: rootKeyPem,
  cert: rootCertPem,
  SNICallback: (host, cb) => {
    certFactory.issue(host).then((c) => {
      cb(null, tls.createSecureContext(c))
    })
  }
}

let handler = (protocol) => {
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
        body
      }

      request(options).on('error', (err) => {
        console.log(err)
        res.end()
      }).pipe(res)
    })
  }
}

let server = http.createServer(handler('http'))
let mitm = https.createServer(cert, handler('https'))

server.addListener('connect', (req, socket) => {
  let proxy = net.createConnection(8002, 'localhost')

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

server.addListener('error', () => {
  console.log('error', arguments)
})

server.listen(8001, 'localhost', () => {
  console.log('server listenning...')
})

mitm.listen(8002, 'localhost', () => {
  console.log('mitm server listenning...')
})

