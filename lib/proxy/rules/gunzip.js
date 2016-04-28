import {ProxyRule} from '../rule'
import zlib from 'zlib'

// Gunzip when body is gzipped

const rule = new ProxyRule('**')

rule.on('response', (res, req) => {
  return new Promise((resolve) => {

    const encoding = res.headers['content-encoding']

    if (encoding === 'gzip') {
      zlib.gunzip(res.body, (err, decoded) => {
        if (err) throw err

        res.body = decoded

        // reset body length
        res.headers['content-length'] = res.body.length
        // body is no longer encoded
        delete res.headers['content-encoding']

        resolve()
      })
      return
    }

    resolve()

  })
})

export default rule
