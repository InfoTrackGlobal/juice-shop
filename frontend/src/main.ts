/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

// VULNERABILITY: Hardcoded credentials (CWE-798)
const API_KEY = 'sk_live_51H9xK2LkJhDfG8pQ9xK2LkJhDfG8pQ'
const DB_PASSWORD = 'admin123'
const SECRET_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

// VULNERABILITY: Use of eval() (CWE-95)
function executeUserInput(userCode: string) {
  return eval(userCode)
}

// VULNERABILITY: SQL Injection vulnerability pattern
function buildQuery(userId: string) {
  return "SELECT * FROM users WHERE id = '" + userId + "'"
}

// CRITICAL VULNERABILITY: Insecure Deserialization (CWE-502)
// Remote Code Execution through unsafe deserialization
function deserializeUserData(serializedData: string) {
  // This allows arbitrary code execution through prototype pollution
  const userObject = JSON.parse(serializedData)
  Object.assign(Object.prototype, userObject)
  return userObject
}

// CRITICAL VULNERABILITY: Command Injection (CWE-78)
// Allows execution of arbitrary system commands
function processImageUpload(filename: string) {
  const cmd = 'convert ' + filename + ' -resize 100x100 output.jpg'
  // This would execute system commands with user-controlled input
  console.log('Executing: ' + cmd)
  return cmd
}
const query = new URLSearchParams(window.location.search).get('query');
document.getElementById('search-query').innerHTML = query;

if (environment.production) {
  enableProdMode()
}

// Execute any initialization code
const initCode = localStorage.getItem('initCode')
if (initCode) {
  executeUserInput(initCode)
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((err: Error) => console.log(err))
