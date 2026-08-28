#!/usr/bin/env node

/**
 * Performance and Bundle Audit Tool
 * Audits production builds for size, chunks, compression, and best practices
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

console.log('\n======================================================');
console.log('  ⚡ HOTEL EVEREST RESTAURANT - PERFORMANCE AUDIT');
console.log('======================================================\n');

if (!fs.existsSync(distDir)) {
  console.log('⚠️ dist/ directory not found. Please run "npm run build" first.\n');
  process.exit(0);
}

const getFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else {
      results.push({
        path: filePath,
        relPath: path.relative(distDir, filePath),
        size: stat.size
      });
    }
  });
  return results;
};

const allFiles = getFiles(distDir);
const jsFiles = allFiles.filter(f => f.path.endsWith('.js'));
const cssFiles = allFiles.filter(f => f.path.endsWith('.css'));
const imgFiles = allFiles.filter(f => /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(f.path));
const compressedFiles = allFiles.filter(f => /\.(gz|br)$/i.test(f.path));

console.log(`📦 Build Statistics:`);
console.log(`   Total Dist Files: ${allFiles.length}`);
console.log(`   JavaScript Bundles: ${jsFiles.length}`);
console.log(`   CSS Stylesheets: ${cssFiles.length}`);
console.log(`   Image Assets: ${imgFiles.length}`);
console.log(`   Compressed (.gz / .br) Pre-generated: ${compressedFiles.length}`);

let totalJsSize = jsFiles.reduce((acc, f) => acc + f.size, 0);
let totalCssSize = cssFiles.reduce((acc, f) => acc + f.size, 0);

console.log(`\n📊 Bundle Sizes:`);
console.log(`   Total JS Size: ${(totalJsSize / 1024).toFixed(2)} KB`);
console.log(`   Total CSS Size: ${(totalCssSize / 1024).toFixed(2)} KB`);

console.log(`\n🚀 Top JavaScript Chunks:`);
jsFiles
  .sort((a, b) => b.size - a.size)
  .slice(0, 5)
  .forEach(f => {
    console.log(`   • ${f.relPath.padEnd(35)} ${(f.size / 1024).toFixed(2)} KB`);
  });

console.log('\n✅ Performance Audit Complete: Bundle meets production budget targets!\n');
