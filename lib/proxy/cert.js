'use strict'

import forge from 'node-forge'

class CertFactory {
  constructor(rootKeyPem, rootCertPem) {
    this.rootCert = forge.pki.certificateFromPem(rootCertPem)
    this.rootKey = forge.pki.privateKeyFromPem(rootKeyPem)
    this.certs = new Map()
    this._snMaker = this._serialNumber()
  }

  issue(host) {
    return new Promise((resolve) => {
      let commonName = this._getCommonName(host)
      if (this.certs.get(commonName))
        return resolve(this.certs.get(commonName))

      this._makeCsr(commonName).then((csr) => {
        let cert = this._signCert(csr.csr, this.rootCert, this.rootKey)
        this.certs.set(commonName, {
          key: forge.pki.privateKeyToPem(csr.keys.privateKey),
          cert: forge.pki.certificateToPem(cert)
        })
        resolve(this.certs.get(commonName))
      }, (err) => {
        console.log(err)
      })
    })
  }

  _signCert(csr, issuer, privateKey) {
    let cert = forge.pki.createCertificate()

    cert.serialNumber = this._snMaker.next().value

    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

    cert.setSubject(csr.subject.attributes)
    cert.setIssuer(issuer.subject.attributes)

    cert.publicKey = csr.publicKey
    cert.sign(privateKey)

    return cert
  }

  _makeCsr(commonName) {
    return new Promise((resolve) => {
      // use 1024 bits here because 2048 bits is too slow
      let keys = forge.pki.rsa.generateKeyPair(1024)
      let csr = forge.pki.createCertificationRequest()

      csr.publicKey = keys.publicKey
      csr.setSubject([
        {shortName: 'CN', value: commonName},
        {shortName: 'C', value: 'US'},
        {shortName: 'ST', value: 'MA'},
        {shortName: 'L', value: 'Boston'},
        {shortName: 'O', value: 'Proxy'},
        {shortName: 'OU', value: '0000'}
      ])
      csr.sign(keys.privateKey)
      resolve({csr, keys})
    })
  }

  _getCommonName(host) {
    let parts = host.split('.')

    if (parts.length > 2) {
      parts.shift()
      parts.unshift('*')
    }
    return parts.join('.')
  }

  *_serialNumber() {
    let index = 0
    while (true) yield String(index++)
  }
}

module.exports = CertFactory
