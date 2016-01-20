'use strict'

function dummy() {}

class ProxyRule {
  constructor(url) {
    this.url = url
    this.requestHandler = dummy
    this.responseHandler = dummy
  }

  match(targetUrl) {
    console.log(targetUrl, 'matches', targetUrl.indexOf(this.url))
    return targetUrl.indexOf(this.url) !== -1
  }

  request(cb) {
    this.requestHandler = cb
    return this
  }

  response(cb) {
    this.responseHandler = cb
    return this
  }
}

module.exports = ProxyRule
