describe('/rest/developer/api-info', () => {
  describe('challenge "hardcodedCredentialsChallenge"', () => {
    it('should return 401 when no API key is provided', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.config('baseUrl')}/rest/developer/api-info`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
        expect(response.body.error).to.equal('Unauthorized')
      })
    })

    it('should return 401 when invalid API key is provided', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.config('baseUrl')}/rest/developer/api-info`,
        headers: {
          'x-api-key': 'invalid_key'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
      })
    })

    it('should grant access with hard-coded API key from source code', () => {
      // The hard-coded API key found in routes/hardcodedCredentials.ts
      const hardcodedApiKey = 'dev_api_key_2024_DO_NOT_COMMIT'

      cy.request({
        method: 'GET',
        url: `${Cypress.config('baseUrl')}/rest/developer/api-info`,
        headers: {
          'x-api-key': hardcodedApiKey
        }
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.success).to.equal(true)
        expect(response.body.message).to.equal('Developer API access granted')
        expect(response.body.data).to.have.property('serverVersion')
        expect(response.body.data).to.have.property('debugMode')
        expect(response.body.data.debugMode).to.equal(true)
      })

      cy.expectChallengeSolved({ challenge: 'Hard-coded Secrets' })
    })

    it('should accept API key as query parameter', () => {
      const hardcodedApiKey = 'dev_api_key_2024_DO_NOT_COMMIT'

      cy.request({
        method: 'GET',
        url: `${Cypress.config('baseUrl')}/rest/developer/api-info?apiKey=${hardcodedApiKey}`
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.success).to.equal(true)
      })
    })
  })
})
