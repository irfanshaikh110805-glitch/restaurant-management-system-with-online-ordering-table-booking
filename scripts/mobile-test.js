#!/usr/bin/env node

/**
 * Mobile Responsiveness & Viewport Verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('  📱 HOTEL EVEREST RESTAURANT - MOBILE AUDIT');
console.log('======================================================\n');

let checksPassed = 0;
let totalChecks = 0;

function check(title, condition, detail = '') {
  totalChecks++;
  if (condition) {
    checksPassed++;
    console.log(`  ✅ [PASS] ${title}`);
  } else {
    console.error(`  ❌ [FAIL] ${title} - ${detail}`);
  }
}

// 1. Viewport Meta in index.html
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
check('Viewport meta tag present in index.html', indexHtml.includes('name="viewport"'));
check('PWA manifest linked in index.html', indexHtml.includes('rel="manifest"') || indexHtml.includes('manifest.json'));
check('Theme color meta tag configured', indexHtml.includes('name="theme-color"'));

// 2. Mobile Bottom Navigation Component
const mobileNavExists = fs.existsSync(path.join(rootDir, 'src/components/MobileBottomNav.jsx'));
check('MobileBottomNav component present', mobileNavExists);

// 3. Responsive Stylesheet imports in index.css
const indexCss = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');
check('Responsive styles imported in index.css', indexCss.includes('responsive.css'));
check('Mobile optimizations imported in index.css', indexCss.includes('mobile-optimizations.css'));
check('Mobile fixes stylesheet imported in index.css', indexCss.includes('mobile-fixes.css'));

// 4. Touch target considerations in mobile-optimizations.css
const mobileOptPath = path.join(rootDir, 'src/styles/mobile-optimizations.css');
if (fs.existsSync(mobileOptPath)) {
  const mobileOptContent = fs.readFileSync(mobileOptPath, 'utf8');
  check('Touch target size optimizations present', mobileOptContent.includes('min-height') || mobileOptContent.includes('touch'));
}

console.log(`\n📊 Mobile Audit Summary: ${checksPassed}/${totalChecks} Passed (${Math.round((checksPassed/totalChecks)*100)}%)\n`);
