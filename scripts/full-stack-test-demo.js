#!/usr/bin/env node

/**
 * Demo test script for quick presentation verification
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testProcess = spawn('node', [path.join(__dirname, 'full-stack-test.js'), '--verbose'], {
  stdio: 'inherit'
});

testProcess.on('close', (code) => {
  process.exit(code);
});
