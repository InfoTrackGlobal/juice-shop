# CWE-327 Vulnerability Implementation

## Overview
This implementation adds a new vulnerability to the OWASP Juice Shop based on **CWE-327: Use of a Broken or Risky Cryptographic Algorithm**.

## Challenge Details
- **Name**: Broken Crypto Engine
- **Category**: Cryptographic Issues
- **Difficulty**: 3 stars (Medium)
- **Key**: `weakCryptoChallenge`

## Description
The challenge demonstrates the danger of using weak encryption algorithms to protect sensitive data. The application uses ROT13 (a simple letter substitution cipher) to "encrypt" sensitive tokens, which can be trivially broken.

## Implementation Details

### 1. Challenge Definition (`data/static/challenges.yml`)
Added a new challenge entry that defines the vulnerability details, hints, and mitigation links.

### 2. Weak Encryption Functions (`lib/insecurity.ts`)
Implemented two functions:
- `weakEncrypt(data)`: Encrypts data using ROT13
- `weakDecrypt(data)`: Decrypts ROT13-encrypted data

ROT13 is a Caesar cipher that shifts each letter by 13 positions. It's demonstrably weak because:
- It's reversible with the same function (ROT13 is its own inverse)
- No key management is required
- It can be broken in seconds manually or instantly with tools
- Provides zero actual security

### 3. API Endpoints (`routes/weakCrypto.ts`)
Created two REST endpoints:

#### GET `/rest/encryption-keys`
Returns weakly encrypted sensitive data:
```json
{
  "encrypted": "FrpergGbxra12345",
  "hint": "This data is protected with industry-standard encryption"
}
```

#### POST `/rest/encryption-keys/decrypt`
Accepts encrypted data and returns the decrypted result. Solves the challenge when:
- User successfully decrypts the secret token
- Submitted data is the encrypted version (not plain text)

### 4. Route Registration (`server.ts`)
Registered the new endpoints in the Express application:
```javascript
app.get('/rest/encryption-keys', weakCrypto.getEncryptedData())
app.post('/rest/encryption-keys/decrypt', weakCrypto.decryptData())
```

## Security Implications
This vulnerability demonstrates:
1. **Inadequate Cryptography**: Using algorithms not designed for security
2. **False Sense of Security**: The API claims "industry-standard encryption"
3. **Data Exposure**: Sensitive tokens can be easily extracted
4. **Compliance Violations**: Fails to meet security standards (FIPS, PCI-DSS, etc.)

## Exploitation
To exploit this vulnerability:
1. Access `/rest/encryption-keys` to get encrypted data
2. Recognize the pattern or identify it as ROT13
3. Decrypt using ROT13: `FrpergGbxra12345` → `SecretToken12345`
4. Submit the encrypted data to `/rest/encryption-keys/decrypt` endpoint

## Mitigation
Real applications should:
- Use strong, modern encryption algorithms (AES-256, ChaCha20)
- Implement proper key management
- Use authenticated encryption (GCM mode)
- Follow cryptographic best practices (OWASP Cryptographic Storage Cheat Sheet)
- Never implement custom encryption algorithms
- Use well-tested cryptographic libraries

## Testing
Unit tests (`test/server/weakCryptoSpec.ts`) verify:
- Encryption/decryption functionality
- Challenge solving logic
- API endpoint behavior
- Error handling

E2E tests (`test/cypress/e2e/weakCrypto.spec.ts`) verify:
- Complete user flow
- Challenge completion

## Files Modified/Created
1. `data/static/challenges.yml` - Challenge definition
2. `lib/insecurity.ts` - Weak crypto functions
3. `routes/weakCrypto.ts` - API endpoints (new file)
4. `server.ts` - Route registration
5. `test/server/weakCryptoSpec.ts` - Unit tests (new file)
6. `test/cypress/e2e/weakCrypto.spec.ts` - E2E tests (new file)

## References
- [CWE-327](https://cwe.mitre.org/data/definitions/327.html)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
