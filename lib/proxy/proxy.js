'use strict'

import http from 'http'
import {parse as parseUrl} from 'url'
import https from 'https'
import net from 'net'
import fs from 'fs'
import path from 'path'
import tls from 'tls'
import {EventEmitter} from 'events'

import {ProxyRuleCollection} from './rule'

import CertFactory from './cert'

function handler(req, res) {
	debugger
  let reqBody = ''

  req.on('data', (chunk) => {
    reqBody += chunk
  })

	req.on('end', () => {
		const reqOptions = {
			url: req.url,
			method: req.method,
			headers: req.headers,
			body: reqBody
		}

		this.rules.exec(req.url, 'request', reqOptions).then(() => {
			const {hostname, port, pathname} = parseUrl(reqOptions.url)

			Object.assign(reqOptions, {hostname, port, path: pathname})

			const proxyReq = http.request(reqOptions, (proxyRes) => {
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

					this.rules.exec(req.url, 'response', resOptions).then(() => {
						// reset body length
						resOptions.headers['content-length'] = resOptions.body.length

						res.writeHead(resOptions.statusCode, resOptions.headers)
						res.write(resOptions.body)
						res.end()
					})
				})
			})
			proxyReq.on('error', (e) => console.dir(e))
			proxyReq.write(reqOptions.body)
			proxyReq.end()
		})
	})
}

class BaseProxyServer extends EventEmitter {
	constructor() {
		super()
		this.rules = new ProxyRuleCollection()
	}

	use(rule) {
		this.rules.add(rule)
	}
}

class HttpProxyServer extends BaseProxyServer {

	constructor() {
		super()

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

	constructor(httpServer) {
		super()

		this.server = https.createServer({
			// dynamically issue certificates
			SNICallback: (host, cb) => {
				debugger
				certFactory.issue(host).then((c) => {
					cb(null, tls.createSecureContext(c))
				})
			}
		}, handler.bind(this))

		this.httpServer = httpServer
	}

	listen() {
		this.server.listen.apply(this.server, arguments)
	}

	close() {
		this.server.close.apply(this.server, arguments)
	}

}

module.exports = {
	HttpProxyServer,
	HttpsProxyServer
}
