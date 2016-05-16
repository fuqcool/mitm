'use strict'

import minimatch from 'minimatch'

function strMatch(str) {
  return (target) => {
    return minimatch(target, str)
  }
}

function reMatch(re) {
  return (target) => {
    return re.test(target)
  }
}

class ProxyRule {
  constructor(pattern) {
    if (typeof pattern === 'string') {
      this.match = strMatch(pattern)
    } else if (pattern instanceof RegExp) {
      this.match = reMatch(pattern)
    } else if (typeof pattern === 'function') {
      this.match = pattern
    }

    this.handlers = {}
  }

  on(name, cb) {
    this.handlers[name] = cb
  }

  get(name) {
    return this.handlers[name] || function () {}
  }
}

class ProxyRuleCollection {
  constructor() {
    this.rules = []
  }

  add(r) {
    this.rules.push(r)
  }

  exec(pattern, name, ...args) {
    return this.rules
      .filter((rule) => rule.match(pattern))
      .reduce((promise, rule) => {
        return promise.then(() => {
          return rule.get(name).apply(rule, args)
        })
      }, new Promise((resolve) => resolve()))
  }
}

module.exports = {
  ProxyRule,
  ProxyRuleCollection
}
