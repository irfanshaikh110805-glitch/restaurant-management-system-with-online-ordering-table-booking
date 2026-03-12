import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from 'vite-plugin-compression2';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    }),
    // Gzip compression for production
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 512, // Compress files > 512 bytes
      deleteOriginalAssets: false
    }),
    // Brotli compression for production (better compression)
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 512,
      deleteOriginalAssets: false
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Performance optimizations
    target: 'es2020', // Modern browsers for smaller bundles
    minify: 'esbuild', // Use esbuild for fast minification
    esbuildOptions: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true
    },
    // Code splitting - more granular chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('@stripe')) {
              return 'stripe';
            }
            if (id.includes('leaflet')) {
              return 'leaflet';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('swiper')) {
              return 'swiper';
            }
            if (id.includes('date-fns')) {
              return 'date-fns';
            }
            // Other node_modules
            return 'vendor';
          }
          // Admin pages in separate chunk
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          // Context providers
          if (id.includes('/context/')) {
            return 'context';
          }
        },
        // Optimize chunk naming with content hash
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/img/[name].[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name].[hash][extname]`;
          } else if (/css/i.test(ext)) {
            return `assets/css/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 300, // Stricter limit for better performance
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps disabled for production
    sourcemap: false,
    // Asset inlining threshold (1kb - smaller for better caching)
    assetsInlineLimit: 1024,
    // Report compressed size
    reportCompressedSize: true,
    // Minify CSS
    cssMinify: 'esbuild',
    // Module preload polyfill
    modulePreload: {
      polyfill: true
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'react-hot-toast',
      'date-fns',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    exclude: ['@supabase/supabase-js'],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  },
  // CSS preprocessing
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
  // Enable experimental features
  experimental: {
    renderBuiltUrl(filename) {
      // Use relative URLs for better CDN compatibility
      return { relative: true };
    }
  }
}));
