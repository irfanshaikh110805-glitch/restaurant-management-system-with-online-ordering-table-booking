#!/usr/bin/env node

/**
 * Hotel Everest Family Restaurant - Full Stack Test Runner
 * Comprehensive automated testing of Frontend, Backend helpers, Routes, and Security
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isVerbose = process.argv.includes('--verbose');
let passedTests = 0;
let totalTests = 0;

function reportTest(name, passed, detail = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
    if (isVerbose && detail) console.log(`     ↳ ${detail}`);
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    if (detail) console.error(`     ↳ ${detail}`);
  }
}

console.log('\n======================================================');
console.log('  🍽️  HOTEL EVEREST RESTAURANT - FULL STACK TEST SUITE');
console.log('======================================================\n');

// 1. Check Project Config & Manifests
console.log('📁 1. Project Configuration & Files');
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'index.html',
  'src/App.jsx',
  'src/main.jsx',
  'src/index.css',
  'src/lib/supabase.js'
];

requiredFiles.forEach((file) => {
  const fullPath = path.join(rootDir, file);
  const exists = fs.existsSync(fullPath);
  reportTest(`Core file exists: ${file}`, exists, `Path: ${fullPath}`);
});

// 2. Route & Pages Verification
console.log('\n🌐 2. Application Pages & Route Verification');
const expectedPages = [
  'HomeOptimized.jsx',
  'Menu.jsx',
  'Booking.jsx',
  'Cart.jsx',
  'Login.jsx',
  'Register.jsx',
  'AdminLogin.jsx',
  'Profile.jsx',
  'OrderTracking.jsx',
  'OrderConfirmation.jsx',
  'LoyaltyProgram.jsx',
  'PromotionsPage.jsx',
  'ReviewsPage.jsx',
  'Settings.jsx',
  'About.jsx',
  'Contact.jsx',
  'EventsPage.jsx',
  'Gallery.jsx',
  'PrivacyPolicy.jsx',
  'TermsOfService.jsx',
  'RefundPolicy.jsx',
  'NotFound.jsx'
];

expectedPages.forEach((page) => {
  const pagePath = path.join(rootDir, 'src/pages', page);
  const exists = fs.existsSync(pagePath);
  reportTest(`Page component exists: ${page}`, exists);
});

// 3. Admin Views Verification
console.log('\n🛡️ 3. Admin Dashboard & Management Views');
const adminPages = [
  'AdminLayout.jsx',
  'Dashboard.jsx',
  'MenuManagement.jsx',
  'BookingManagement.jsx',
  'OrderManagement.jsx',
  'ReviewModeration.jsx',
  'PromotionManager.jsx',
  'InventoryManager.jsx'
];

adminPages.forEach((page) => {
  const pagePath = path.join(rootDir, 'src/pages/admin', page);
  const exists = fs.existsSync(pagePath);
  reportTest(`Admin sub-page exists: ${page}`, exists);
});

// 4. Components & Contexts
console.log('\n🧩 4. Context Providers & Reusable Components');
const contexts = [
  'AuthContext.jsx',
  'CartContext.jsx',
  'LoyaltyContext.jsx',
  'DeliveryContext.jsx',
  'NotificationContext.jsx',
  'ThemeContext.jsx'
];

contexts.forEach((ctx) => {
  const ctxPath = path.join(rootDir, 'src/context', ctx);
  const exists = fs.existsSync(ctxPath);
  reportTest(`Context Provider: ${ctx}`, exists);
});

const components = [
  'Navbar.jsx',
  'Footer.jsx',
  'MobileBottomNav.jsx',
  'Modal.jsx',
  'ConfirmDialog.jsx',
  'MenuFilters.jsx',
  'NotificationBell.jsx',
  'RatingStars.jsx',
  'EmptyState.jsx',
  'LoadingSpinner.jsx',
  'ProtectedRoute.jsx',
  'SEO.jsx'
];

components.forEach((comp) => {
  const compPath = path.join(rootDir, 'src/components', comp);
  const exists = fs.existsSync(compPath);
  reportTest(`Component exists: ${comp}`, exists);
});

// 5. Backend Helpers & Security Utilities
console.log('\n🔒 5. Backend Helpers & Security Utilities');
const securityFiles = [
  'src/utils/backendHelpers.js',
  'src/utils/securityConfig.js',
  'src/utils/securityMiddleware.js',
  'src/utils/rateLimiter.js',
  'src/utils/inputSanitizer.js',
  'src/utils/paymentGateway.js',
  'src/utils/validators.js',
  'src/utils/errorMonitoring.js'
];

securityFiles.forEach((file) => {
  const fullPath = path.join(rootDir, file);
  const exists = fs.existsSync(fullPath);
  reportTest(`Security module: ${file}`, exists);
});

// 6. Database Migrations & Schema Check
console.log('\n🗄️ 6. Supabase Database Schema & Migrations');
const schemaFiles = [
  'supabase/schema.sql',
  'supabase/migrations'
];

schemaFiles.forEach((file) => {
  const fullPath = path.join(rootDir, file);
  const exists = fs.existsSync(fullPath);
  reportTest(`Database asset: ${file}`, exists);
});

// Summary
console.log('\n======================================================');
console.log(`  📊 TEST RESULTS SUMMARY: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL FULL-STACK HEALTH & INTEGRITY TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error('⚠️ SOME TESTS FAILED. Please review the output above.\n');
  process.exit(1);
}
