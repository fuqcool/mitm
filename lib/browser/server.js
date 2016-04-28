'use strict'

import {HttpProxyServer, HttpsProxyServer} from '../proxy/proxy'
import {ProxyRule} from '../proxy/rule'
import store from './store'
import {addProxy} from './actions'

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

let counter = 0
const logProxy = new ProxyRule('**')

logProxy.on('response', (response, request) => {
  store.dispatch(addProxy({response, request, id: ++counter}))
})

const noCache = new ProxyRule('**')

noCache.on('request', (request) => {
  delete request.headers['if-modified-since']
  delete request.headers['if-none-match']
})

const server = new HttpProxyServer()

server.use(logProxy)
server.use(noCache)

server.listen(8001, 'localhost', () => {
  console.log('Server listenning...')
})

const sserver = new HttpsProxyServer()

sserver.use(logProxy)
sserver.use(noCache)

sserver.listen(8002, 'localhost', () => {
  console.log('Mitm server listenning...')
})
