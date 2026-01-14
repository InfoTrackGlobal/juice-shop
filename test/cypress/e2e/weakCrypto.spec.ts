describe('/rest/encryption-keys', () => {
  describe('challenge "weakCryptoChallenge"', () => {
    it('should be able to decrypt the weakly encrypted data', () => {
      cy.window().then(async () => {
        // First, get the encrypted data
        const getResponse = await fetch(
          `${Cypress.config('baseUrl')}/rest/encryption-keys`,
          {
            method: 'GET',
            cache: 'no-cache'
          }
        )
        
        expect(getResponse.status).to.equal(200)
        const getData = await getResponse.json()
        expect(getData).to.have.property('encrypted')
        expect(getData.encrypted).to.equal('FrpergGbxra12345')
        
        // Now decrypt it (ROT13: each letter shifted by 13 positions)
        const decryptedValue = getData.encrypted.replace(/[a-zA-Z]/g, (char) => {
          const start = char <= 'Z' ? 65 : 97
          return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start)
        })
        
        expect(decryptedValue).to.equal('SecretToken12345')
        
        // Submit the decrypted data
        const postResponse = await fetch(
          `${Cypress.config('baseUrl')}/rest/encryption-keys/decrypt`,
          {
            method: 'POST',
            cache: 'no-cache',
            headers: {
              'Content-type': 'application/json'
            },
            body: JSON.stringify({
              data: getData.encrypted
            })
          }
        )
        
        expect(postResponse.status).to.equal(200)
        const postData = await postResponse.json()
        expect(postData.success).to.equal(true)
        expect(postData.decrypted).to.equal('SecretToken12345')
      })

      cy.expectChallengeSolved({ challenge: 'Broken Crypto Engine' })
    })
  })
})
