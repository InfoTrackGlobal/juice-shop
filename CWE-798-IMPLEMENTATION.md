# CWE-798 Vulnerability Implementation

## Overview
This implementation adds a vulnerability based on **CWE-798: Use of Hard-coded Credentials** to demonstrate the security risks of embedding credentials directly in source code.

## Challenge Details
- **Name**: Hard-coded Secrets
- **Category**: Sensitive Data Exposure
- **Difficulty**: 2 stars (Easy)
- **Key**: `hardcodedCredentialsChallenge`

## Description
The challenge exposes a common developer mistake: hard-coding API keys, passwords, or other credentials directly in source code. The application contains a developer API endpoint protected by a hard-coded API key that can be found by examining the source code.

## Implementation Details

### 1. Challenge Definition (`data/static/challenges.yml`)
Added challenge entry with:
- Clear description of the vulnerability
- Hints pointing to source code examination
- Links to mitigation resources

### 2. Developer API Endpoint (`routes/hardcodedCredentials.ts`)
Created a "developer-only" endpoint that:
- Uses a hard-coded API key: `dev_api_key_2024_DO_NOT_COMMIT`
- Includes revealing comments like "TODO: Move this to environment variables"
- Accepts the key via header (`x-api-key`) or query parameter (`apiKey`)
- Returns sensitive internal information when authenticated
- Solves the challenge upon successful authentication

```javascript
const HARDCODED_API_KEY = 'dev_api_key_2024_DO_NOT_COMMIT'
```

### 3. Route Registration (`server.ts`)
Registered the endpoint:
```javascript
app.get('/rest/developer/api-info', hardcodedCredentials.getDeveloperInfo())
```

### 4. Response Data
When successfully authenticated, the endpoint reveals:
- Server version information
- Database type
- Debug mode status
- Internal endpoint paths
- Warning about production exposure

## Security Implications
This vulnerability demonstrates:

1. **Credential Exposure**: Secrets committed to version control are permanently accessible
2. **Git History**: Even if removed, credentials remain in repository history
3. **Public Repositories**: If code is open source, credentials are immediately compromised
4. **Insider Threats**: Any developer with code access can extract credentials
5. **CI/CD Risks**: Build logs may expose hard-coded secrets
6. **Compliance Violations**: Fails PCI-DSS, SOC 2, and other security standards

## Exploitation
To exploit this vulnerability:

1. **Discover the Endpoint**
   ```bash
   # Browse to the developer API endpoint
   GET /rest/developer/api-info
   ```

2. **Examine Source Code**
   - Check `routes/hardcodedCredentials.ts`
   - Find the hard-coded API key in the constant declaration
   - Note the revealing TODO comment

3. **Use the Credential**
   ```bash
   # Via header
   curl -H "x-api-key: dev_api_key_2024_DO_NOT_COMMIT" \
        http://localhost:3000/rest/developer/api-info
   
   # Via query parameter
   curl http://localhost:3000/rest/developer/api-info?apiKey=dev_api_key_2024_DO_NOT_COMMIT
   ```

4. **Access Sensitive Information**
   - Receive internal server details
   - Learn about other protected endpoints
   - Challenge solved!

## Real-World Examples
This vulnerability mirrors real incidents:
- **Uber (2016)**: AWS keys in GitHub led to data breach
- **Toyota (2022)**: Access key exposed in public repository for 5 years
- **Codecov (2021)**: Docker credentials hard-coded in source
- **Samsung (2019)**: GitLab tokens and AWS keys exposed

## Mitigation

### Immediate Actions
1. **Remove Hard-coded Credentials**
   - Extract all secrets from source code
   - Use environment variables or secrets managers
   
2. **Rotate Compromised Credentials**
   - Assume all committed secrets are compromised
   - Generate new credentials immediately

3. **Clean Git History**
   - Use tools like `git-filter-repo` or `BFG Repo-Cleaner`
   - Force push to remove secrets from history

### Best Practices
1. **Secrets Management**
   - Use environment variables for configuration
   - Implement secrets managers (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault)
   - Use .env files (never commit them!)

2. **Pre-commit Hooks**
   - Install tools like `git-secrets` or `detect-secrets`
   - Scan for patterns matching API keys/passwords
   - Block commits containing secrets

3. **Code Review**
   - Train developers on secure credential handling
   - Implement mandatory code reviews
   - Use automated scanning in CI/CD

4. **Monitoring**
   - Scan public repositories for leaked credentials
   - Use services like GitHub Secret Scanning
   - Monitor for unauthorized API usage

### Configuration Example
```javascript
// Bad - Hard-coded
const API_KEY = 'secret123'

// Good - Environment variable
const API_KEY = process.env.API_KEY

// Better - Secrets manager
const API_KEY = await secretsManager.getSecret('api-key')
```

## Testing
Unit tests (`test/server/hardcodedCredentialsSpec.ts`) verify:
- Unauthorized access returns 401
- Correct API key grants access
- Both header and query parameter methods work
- Challenge solving logic
- Response structure

E2E tests (`test/cypress/e2e/hardcodedCredentials.spec.ts`) verify:
- End-to-end authentication flow
- Challenge completion
- Error handling

## Files Modified/Created
1. `data/static/challenges.yml` - Challenge definition
2. `routes/hardcodedCredentials.ts` - Vulnerable endpoint (new file)
3. `server.ts` - Route registration
4. `test/server/hardcodedCredentialsSpec.ts` - Unit tests (new file)
5. `test/cypress/e2e/hardcodedCredentials.spec.ts` - E2E tests (new file)

## Detection Tools
Security scanners that can detect this:
- **TruffleHog**: Searches for high entropy strings and patterns
- **GitGuardian**: Monitors repositories for secrets
- **Gitleaks**: Fast secret scanner for git repositories
- **AWS CodeGuru**: Detects hard-coded credentials
- **SonarQube**: Static code analysis including secret detection

## References
- [CWE-798](https://cwe.mitre.org/data/definitions/798.html)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
