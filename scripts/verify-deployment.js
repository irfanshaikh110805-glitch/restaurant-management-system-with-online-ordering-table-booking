#!/usr/bin/env node

/**
 * Verify Deployment Script
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checkProcess = spawn('node', [path.join(__dirname, 'check-deployment.js')], {
  stdio: 'inherit'
});

checkProcess.on('close', (code) => {
  process.exit(code);
});
