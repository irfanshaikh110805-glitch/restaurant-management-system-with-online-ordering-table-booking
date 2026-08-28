#!/usr/bin/env node

/**
 * Deployment Configuration Check
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('  🚀 DEPLOYMENT & NETLIFY CONFIGURATION CHECK');
console.log('======================================================\n');

let issues = 0;

function assert(title, condition, hint = '') {
  if (condition) {
    console.log(`  ✅ [OK] ${title}`);
  } else {
    issues++;
    console.error(`  ❌ [ISSUE] ${title}`);
    if (hint) console.error(`     ↳ Hint: ${hint}`);
  }
}

// 1. Check netlify.toml
const netlifyTomlExists = fs.existsSync(path.join(rootDir, 'netlify.toml'));
assert('netlify.toml exists', netlifyTomlExists);

if (netlifyTomlExists) {
  const content = fs.readFileSync(path.join(rootDir, 'netlify.toml'), 'utf8');
  assert('Build command is "npm run build"', content.includes('command = "npm run build"'));
  assert('Publish directory is "dist"', content.includes('publish = "dist"'));
  assert('SPA redirect rule (/* -> /index.html) configured', content.includes('to = "/index.html"'));
  assert('Security headers configured', content.includes('X-Frame-Options') && content.includes('X-Content-Type-Options'));
}

// 2. Check public directory & PWA assets
assert('public/robots.txt exists', fs.existsSync(path.join(rootDir, 'public/robots.txt')) || fs.existsSync(path.join(rootDir, 'robots.txt')));
assert('public/manifest.json exists', fs.existsSync(path.join(rootDir, 'public/manifest.json')));
assert('public/offline.html exists', fs.existsSync(path.join(rootDir, 'public/offline.html')));

console.log(`\nDeployment check complete with ${issues} issues found.\n`);
process.exit(issues === 0 ? 0 : 1);
