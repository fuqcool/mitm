'use strict'

import zlib from 'zlib'
import {HttpProxyServer, HttpsProxyServer} from '../proxy/proxy'
import {ProxyRule} from '../proxy/rule'

let rule = new ProxyRule('**')

rule.set('request', (req) => {
	console.log(req.url)
})

rule.set('response', (res) => {
	return new Promise((resolve) => {
		const encoding = res.headers['content-encoding']
		if (encoding === 'gzip') {
			zlib.gunzip(res.body, (err, decoded) => {
				if (err) throw err

				res.body = decoded.toString()
				delete res.headers['content-encoding']

				resolve()
			})
			return
		}

		resolve()
	})
})

const server = new HttpProxyServer()
server.use(rule)

server.server.addListener('connect', (req, socket) => {
	debugger
	const proxy = net.createConnection(this.server.address().port, this.server.address().address)

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

// server.server.addListener('connect', (req, socket) => {
	// debugger
	// const proxy = net.createConnection(this.server.address().port, this.server.address().address)

	// proxy.on('connect', () => {
	// 	socket.write('HTTP/1.0 200 Connection established\r\n\r\n')
	// })

	// proxy.on('data', (data) => socket.write(data))
	// socket.on('data', (data) => proxy.write(data))

	// proxy.on('end', () => socket.end())
	// socket.on('end', () => proxy.end())

	// proxy.on('close', () => socket.end())
	// socket.on('close', () => proxy.end())

	// proxy.on('error', () => socket.end())
	// socket.on('error', () => proxy.end())
// })

server.listen(8001, 'localhost', () => {
	console.log('Server listenning...')
})

const sserver = new HttpsProxyServer(server)

// sserver.use(rule)

sserver.listen(8002, 'localhost', () => {
	console.log('Mitm server listenning...')
})

// module.exports = server
