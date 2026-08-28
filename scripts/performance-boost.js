#!/usr/bin/env node

/**
 * Performance Boost & Optimization Verifier
 */

import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Running automated performance check...');
const auditProcess = spawn('node', [path.join(__dirname, 'performance-audit.js')], {
  stdio: 'inherit'
});

auditProcess.on('close', (code) => {
  process.exit(code);
});
