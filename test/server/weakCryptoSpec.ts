/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('weakCrypto', () => {
  const weakCrypto = require('../../routes/weakCrypto')
  const security = require('../../lib/insecurity')
  const challenges = require('../../data/datacache').challenges
  let req: any
  let res: any
  let next: any
  let save: any

  beforeEach(() => {
    req = { body: {} }
    res = {
      json: sinon.spy(),
      status: sinon.stub().returns({ json: sinon.spy() })
    }
    next = sinon.spy()
    save = () => ({
      then () {}
    })
  })

  describe('getEncryptedData', () => {
    it('returns encrypted data using weak encryption', () => {
      weakCrypto.getEncryptedData()(req, res)

      expect(res.json).to.have.been.calledWith(
        sinon.match({ encrypted: 'FrpergGbxra12345', hint: sinon.match.string })
      )
    })
  })

  describe('decryptData', () => {
    beforeEach(() => {
      challenges.weakCryptoChallenge = { solved: false, save }
    })

    it('should decrypt ROT13 encrypted data', () => {
      req.body.data = 'FrpergGbxra12345'

      weakCrypto.decryptData()(req, res, next)

      expect(res.json).to.have.been.calledWith(
        sinon.match({ success: true, decrypted: 'SecretToken12345' })
      )
    })

    it('solves weakCryptoChallenge when decrypting the secret token', () => {
      challenges.weakCryptoChallenge = { solved: false, save }
      req.body.data = 'FrpergGbxra12345'

      weakCrypto.decryptData()(req, res, next)

      expect(challenges.weakCryptoChallenge.solved).to.equal(true)
    })

    it('does not solve weakCryptoChallenge when submitting unencrypted data', () => {
      challenges.weakCryptoChallenge = { solved: false, save }
      req.body.data = 'SecretToken12345'

      weakCrypto.decryptData()(req, res, next)

      expect(challenges.weakCryptoChallenge.solved).to.equal(false)
    })

    it('returns error when no data is provided', () => {
      weakCrypto.decryptData()(req, res, next)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.status().json).to.have.been.calledWith(
        sinon.match({ error: 'Missing encrypted data' })
      )
    })
  })

  describe('security.weakEncrypt and security.weakDecrypt', () => {
    it('encrypts text using ROT13', () => {
      expect(security.weakEncrypt('SecretToken12345')).to.equal('FrpergGbxra12345')
    })

    it('decrypts ROT13 encrypted text', () => {
      expect(security.weakDecrypt('FrpergGbxra12345')).to.equal('SecretToken12345')
    })

    it('is its own inverse', () => {
      const original = 'TestMessage'
      const encrypted = security.weakEncrypt(original)
      const decrypted = security.weakDecrypt(encrypted)
      expect(decrypted).to.equal(original)
    })

    it('only affects alphabetic characters', () => {
      expect(security.weakEncrypt('Test123!@#')).to.equal('Grfg123!@#')
    })
  })
})
