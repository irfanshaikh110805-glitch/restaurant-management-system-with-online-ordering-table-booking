#!/usr/bin/env node

/**
 * Image Optimization Script
 * Compresses and optimizes images in the public and src/assets directories
 * 
 * Usage: node scripts/optimize-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🖼️  Image Optimization Script');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Directories to scan
const directories = [
  path.join(path.dirname(__dirname), 'public'),
  path.join(path.dirname(__dirname), 'src', 'assets')
];

// Image extensions to check
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

let totalImages = 0;
let totalSize = 0;

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const size = getFileSize(filePath);
        totalImages++;
        totalSize += size;

        const relativePath = path.relative(path.dirname(__dirname), filePath);
        const sizeFormatted = formatBytes(size);

        // Warn about large images
        if (size > 500 * 1024) { // > 500KB
          console.log(`⚠️  LARGE: ${relativePath} (${sizeFormatted})`);
        } else if (size > 200 * 1024) { // > 200KB
          console.log(`⚡ MEDIUM: ${relativePath} (${sizeFormatted})`);
        } else {
          console.log(`✅ GOOD: ${relativePath} (${sizeFormatted})`);
        }
      }
    }
  });
}

console.log('📊 Scanning images...\n');

directories.forEach(dir => {
  scanDirectory(dir);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📈 Summary:`);
console.log(`   Total Images: ${totalImages}`);
console.log(`   Total Size: ${formatBytes(totalSize)}`);
console.log(`   Average Size: ${formatBytes(totalSize / totalImages)}`);

console.log('\n💡 Recommendations:');
console.log('   1. Compress images > 200KB using tools like TinyPNG or ImageOptim');
console.log('   2. Convert large JPG/PNG to WebP format for better compression');
console.log('   3. Use responsive images with srcset for different screen sizes');
console.log('   4. Lazy load images below the fold');
console.log('   5. Use CSS for decorative images when possible\n');

// Check for hero images
const heroImages = ['hero-bg.jpg', 'hero-bg.png', 'og-image.jpg'];
heroImages.forEach(heroImage => {
  const heroPath = path.join(path.dirname(__dirname), 'src', 'assets', heroImage);
  const publicHeroPath = path.join(path.dirname(__dirname), 'public', heroImage);
  
  if (fs.existsSync(heroPath)) {
    const size = getFileSize(heroPath);
    if (size > 100 * 1024) {
      console.log(`⚠️  Hero image ${heroImage} is ${formatBytes(size)} - should be < 100KB`);
    }
  }
  
  if (fs.existsSync(publicHeroPath)) {
    const size = getFileSize(publicHeroPath);
    if (size > 100 * 1024) {
      console.log(`⚠️  Hero image ${heroImage} is ${formatBytes(size)} - should be < 100KB`);
    }
  }
});

console.log('\n✨ Image optimization scan complete!\n');
