/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import challengeUtils = require('../lib/challengeUtils')

const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

// vuln-code-snippet start weakCryptoChallenge
module.exports.getEncryptedData = function getEncryptedData () {
  return (req: Request, res: Response) => {
    // Vulnerable: Using weak encryption (ROT13) to protect sensitive data
    const sensitiveData = 'SecretToken12345'
    const encryptedData = security.weakEncrypt(sensitiveData) // vuln-code-snippet vuln-line weakCryptoChallenge
    res.json({
      encrypted: encryptedData,
      hint: 'This data is protected with industry-standard encryption'
    })
  }
}

module.exports.decryptData = function decryptData () {
  return (req: Request, res: Response, next: NextFunction) => {
    const encryptedInput = req.body.data
    
    if (!encryptedInput) {
      res.status(400).json({ error: 'Missing encrypted data' })
      return
    }

    try {
      // Check if user successfully decrypted the secret token
      const decrypted = security.weakDecrypt(encryptedInput)
      
      challengeUtils.solveIf(challenges.weakCryptoChallenge, () => {
        return decrypted === 'SecretToken12345' && encryptedInput !== 'SecretToken12345'
      })
      
      res.json({
        success: true,
        decrypted: decrypted
      })
    } catch (error) {
      next(error)
    }
  }
}
// vuln-code-snippet end weakCryptoChallenge
