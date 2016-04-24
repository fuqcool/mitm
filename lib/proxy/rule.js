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

	set(name, cb) {
		this.handlers[name] = cb
	}

	get(name) {
		return this.handlers[name]
	}
}

class ProxyRuleCollection {
	constructor() {
		this.rules = []
	}

	add(r) {
		this.rules.push(r)
	}

	exec(pattern, name) {
		const args = Array.from(arguments).slice(2)

		return this.rules
			.filter((r) => r.match(pattern))
			.reduce((promise, r) => {
			return promise.then(() => {
				const handler = r.get(name)
				if (handler != null) {
					return handler.apply(r, args)
				}
			})
		}, new Promise((resolve) => resolve()))
	}
}

module.exports = {
	ProxyRule,
	ProxyRuleCollection
}
