/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import challengeUtils = require('../lib/challengeUtils')

const challenges = require('../data/datacache').challenges

// vuln-code-snippet start hardcodedCredentialsChallenge
// TODO: Move this API key to environment variables or secrets manager
// DEVELOPER_API_KEY: For internal use only - grants access to debug endpoints
const HARDCODED_API_KEY = 'dev_api_key_2024_DO_NOT_COMMIT' // vuln-code-snippet vuln-line hardcodedCredentialsChallenge

module.exports.getDeveloperInfo = function getDeveloperInfo () {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey

    // Vulnerable: Using hard-coded API key for authentication
    if (apiKey === HARDCODED_API_KEY) { // vuln-code-snippet vuln-line hardcodedCredentialsChallenge
      challengeUtils.solveIf(challenges.hardcodedCredentialsChallenge, () => { return true })
      
      res.json({
        success: true,
        message: 'Developer API access granted',
        data: {
          serverVersion: '4.0.0-beta',
          databaseType: 'SQLite',
          debugMode: true,
          internalEndpoints: [
            '/rest/admin/application-configuration',
            '/rest/admin/application-version',
            '/metrics'
          ],
          warning: 'This endpoint should not be accessible in production!'
        }
      })
    } else {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid API key required. Contact development team for access.',
        hint: 'API keys are typically found in configuration files or source code...'
      })
    }
  }
}
// vuln-code-snippet end hardcodedCredentialsChallenge
