#!/usr/bin/env node

/**
 * Automated ESLint Fix Script
 * Fixes all ESLint warnings and errors systematically
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // Fix unused React imports
  {
    file: 'src/components/ErrorBoundary.jsx',
    find: /import React, { Component }/,
    replace: 'import { Component }'
  },
  {
    file: 'src/components/Modal.jsx',
    find: /import React from 'react';\n/,
    replace: ''
  },
  
  // Fix unused error parameter
  {
    file: 'src/components/ErrorBoundary.jsx',
    find: /static getDerivedStateFromError\(error\)/,
    replace: 'static getDerivedStateFromError(_error)'
  },
  
  // Fix unused sizes parameter
  {
    file: 'src/components/ResponsiveImage.jsx',
    find: /  sizes = '100vw',/,
    replace: '  sizes: _sizes = \'100vw\','
  },
  
  // Fix unused webVitalsMonitor
  {
    file: 'src/main.jsx',
    find: /import\('\.\/utils\/webVitals'\)\.then\(\({ webVitalsMonitor }\) => {/,
    replace: 'import(\'./utils/webVitals\').then(({ webVitalsMonitor: _webVitalsMonitor }) => {'
  },
  
  // Fix console.log in App.jsx
  {
    file: 'src/App.jsx',
    find: /    console\.log\('🔐 Security features initialized'\);/,
    replace: '    // Security features initialized'
  },
  
  // Fix console.log in main.jsx
  {
    file: 'src/main.jsx',
    find: /        console\.log\('📊 Web Vitals monitoring initialized'\);/,
    replace: '        // Web Vitals monitoring initialized'
  }
];

console.log('🔧 Starting ESLint fixes...\n');

let fixedCount = 0;
let errorCount = 0;

fixes.forEach(({ file, find, replace }) => {
  try {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      errorCount++;
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (find.test(content)) {
      content = content.replace(find, replace);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`⏭️  Skipped (already fixed or pattern not found): ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixedCount}`);
console.log(`   Errors: ${errorCount}`);
console.log(`\n✨ Run 'npx eslint src --ext .js,.jsx --fix' to auto-fix remaining issues`);
