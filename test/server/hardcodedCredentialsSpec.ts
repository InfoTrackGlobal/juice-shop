/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('hardcodedCredentials', () => {
  const hardcodedCredentials = require('../../routes/hardcodedCredentials')
  const challenges = require('../../data/datacache').challenges
  let req: any
  let res: any
  let next: any
  let save: any

  beforeEach(() => {
    req = {
      headers: {},
      query: {}
    }
    res = {
      json: sinon.spy(),
      status: sinon.stub().returns({ json: sinon.spy() })
    }
    next = sinon.spy()
    save = () => ({
      then () {}
    })
  })

  describe('getDeveloperInfo', () => {
    beforeEach(() => {
      challenges.hardcodedCredentialsChallenge = { solved: false, save }
    })

    it('returns 401 when no API key is provided', () => {
      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(res.status).to.have.been.calledWith(401)
      expect(res.status().json).to.have.been.calledWith(
        sinon.match({ error: 'Unauthorized' })
      )
    })

    it('returns 401 when invalid API key is provided in header', () => {
      req.headers['x-api-key'] = 'invalid_key'

      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(res.status).to.have.been.calledWith(401)
    })

    it('returns 401 when invalid API key is provided in query', () => {
      req.query.apiKey = 'wrong_key'

      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(res.status).to.have.been.calledWith(401)
    })

    it('grants access when correct API key is provided in header', () => {
      req.headers['x-api-key'] = 'dev_api_key_2024_DO_NOT_COMMIT'

      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(res.json).to.have.been.calledWith(
        sinon.match({
          success: true,
          message: 'Developer API access granted'
        })
      )
    })

    it('grants access when correct API key is provided in query parameter', () => {
      req.query.apiKey = 'dev_api_key_2024_DO_NOT_COMMIT'

      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(res.json).to.have.been.calledWith(
        sinon.match({ success: true })
      )
    })

    it('solves hardcodedCredentialsChallenge when correct API key is used', () => {
      req.headers['x-api-key'] = 'dev_api_key_2024_DO_NOT_COMMIT'

      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(challenges.hardcodedCredentialsChallenge.solved).to.equal(true)
    })

    it('returns developer information when authenticated', () => {
      req.headers['x-api-key'] = 'dev_api_key_2024_DO_NOT_COMMIT'

      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(res.json).to.have.been.calledWith(
        sinon.match({
          data: sinon.match({
            serverVersion: sinon.match.string,
            databaseType: sinon.match.string,
            debugMode: true,
            internalEndpoints: sinon.match.array
          })
        })
      )
    })

    it('header API key takes precedence over query parameter', () => {
      req.headers['x-api-key'] = 'dev_api_key_2024_DO_NOT_COMMIT'
      req.query.apiKey = 'wrong_key'

      hardcodedCredentials.getDeveloperInfo()(req, res, next)

      expect(res.json).to.have.been.calledWith(
        sinon.match({ success: true })
      )
    })
  })
})
