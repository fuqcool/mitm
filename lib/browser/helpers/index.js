import jade from 'jade'
import fs from 'fs'

export function proxyFile(uri) {
  return (rule) => {
    rule.on('response', (res) => {
      return new Promise((resolve) => {
        fs.readFile(uri, (err, data) => {
          res.body = data
          res.headers['content-length'] = res.body.length
          resolve()
        })
      })
    })
  }
}

export function proxyJade(uri) {
  return (rule) => {
    rule.on('response', (res) => {
      return new Promise((resolve) => {
        const html = jade.renderFile(uri)
        res.body = html
        res.headers['content-length'] = res.body.length
        resolve()
      })
    })
  }
}
