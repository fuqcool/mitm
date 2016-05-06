'use strict'

import http from 'http'
import {parse as parseUrl} from 'url'
import https from 'https'
import net from 'net'
import fs from 'fs'
import path from 'path'
import tls from 'tls'
import {EventEmitter} from 'events'

import {ProxyRule, ProxyRuleCollection} from './rule'

import GunzipRule from './rules/gunzip'

import CertFactory from './cert'

function handler(req, res) {
  let reqBody = ''

  req.on('data', (chunk) => {
    reqBody += chunk
  })

  req.on('end', () => {
    const reqUrl = `${this.protocol}://${req.headers.host}${parseUrl(req.url).path}`

    const reqOptions = {
      url: reqUrl,
      method: req.method,
      headers: req.headers,
      body: reqBody
    }

    this.rules.exec(reqOptions.url, 'request', reqOptions).then(() => {
      const {hostname, port, path: urlPath} = parseUrl(reqOptions.url)

      Object.assign(reqOptions, {hostname, port, path: urlPath})

      let client = null

      if (this.protocol === 'http') {
        client = http
      } else if (this.protocol === 'https') {
        client = https
      }

      const proxyReq = client.request(reqOptions, (proxyRes) => {
        const chunks = []
        proxyRes.on('data', (chunk) => {
          chunks.push(chunk)
        })

        proxyRes.on('end', () => {
          const buf = Buffer.concat(chunks)

          const resOptions = {
            statusCode: proxyRes.statusCode,
            statusMessage: proxyRes.statusMessage,
            headers: proxyRes.headers,
            body: buf
          }

          this.rules.exec(reqOptions.url, 'response', resOptions, reqOptions).then(() => {
            res.writeHead(resOptions.statusCode, resOptions.headers)
            res.write(resOptions.body)
            res.end()
          }).catch((err) => {
            throw err
          })
        })
      })

      proxyReq.on('error', (e) => console.dir(e))
      proxyReq.write(reqOptions.body)
      proxyReq.end()
    }).catch((err) => {
      throw err
    })
  })
}

class BaseProxyServer extends EventEmitter {
  constructor() {
    super()
    this.rules = new ProxyRuleCollection()
    this.rules.add(GunzipRule)
  }

  use(r) {
    this.rules.add(r)
  }

  rule(pattern, cb) {
    const r = new ProxyRule(pattern)
    cb(r)
    this.rules.add(r)
  }
}

class HttpProxyServer extends BaseProxyServer {

  constructor() {
    super()

    this.protocol = 'http'
    this.server = http.createServer(handler.bind(this))
    this.server.addListener('error', (err) => console.log(err))
  }

  listen() {
    this.server.listen.apply(this.server, arguments)
  }

  close() {
    this.server.close.apply(this.server, arguments)
  }

}


const certFactory = new CertFactory(
  fs.readFileSync(path.join(__dirname, '../../cert/rootCA.key')),
  fs.readFileSync(path.join(__dirname, '../../cert/rootCA.crt'))
)

class HttpsProxyServer extends BaseProxyServer {

  constructor() {
    super()

    this.protocol = 'https'

    this.socketAddress = '/tmp/https.sock'

    this.redirect = http.createServer()

    this.server = https.createServer({
      // dynamically issue certificates
      SNICallback: (host, cb) => {
        console.log('issue certificate', host)

        certFactory.issue(host).then((c) => {
          cb(null, tls.createSecureContext(c))
        })
      }
    }, handler.bind(this))
  }

  listen() {
    try {
      fs.unlinkSync(this.socketAddress)
    } catch (e) {}

    this.redirect.addListener('connect', (req, socket) => {
      const proxy = net.createConnection(this.socketAddress)

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

    this.redirect.listen.apply(this.redirect, arguments)
    this.server.listen(this.socketAddress)
  }

  close() {
    this.server.close.apply(this.server, arguments)
    this.redirect.close.apply(this.redirect, arguments)
  }

}

export {HttpProxyServer, HttpsProxyServer}
