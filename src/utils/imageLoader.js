/**
 * Image Loader Utility
 * Provides optimized image loading with lazy loading, WebP support, and responsive images
 */

/**
 * Generate srcset for responsive images
 * @param {string} src - Base image path
 * @param {number[]} widths - Array of widths to generate
 * @returns {string} srcset string
 */
export const generateSrcSet = (src, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  const ext = src.split('.').pop();
  const basePath = src.replace(`.${ext}`, '');
  
  return widths
    .map(width => `${basePath}-${width}w.${ext} ${width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param {Object} breakpoints - Breakpoint configuration
 * @returns {string} sizes string
 */
export const generateSizes = (breakpoints = {
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw'
}) => {
  return `
    (max-width: 640px) ${breakpoints.mobile || '100vw'},
    (max-width: 1024px) ${breakpoints.tablet || '50vw'},
    ${breakpoints.desktop || '33vw'}
  `.trim();
};

/**
 * Check if WebP is supported
 * @returns {Promise<boolean>}
 */
export const supportsWebP = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get optimized image source
 * @param {string} src - Original image source
 * @param {Object} options - Optimization options
 * @returns {string} Optimized image source
 */
export const getOptimizedSrc = (src, options = {}) => {
  const {
    width: _width,
    quality: _quality = 80,
    format: _format = 'auto'
  } = options;
  
  // If using a CDN, add query parameters
  // Example: Cloudinary, imgix, etc.
  // For now, return original src
  // TODO: Implement CDN integration if needed (_width, _quality, _format will be used)
  
  return src;
};

/**
 * Lazy load image with Intersection Observer
 * @param {HTMLImageElement} img - Image element
 * @param {Object} options - Observer options
 */
export const lazyLoadImage = (img, options = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.01
  } = options;
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          const src = image.dataset.src;
          const srcset = image.dataset.srcset;
          
          if (src) {
            image.src = src;
          }
          if (srcset) {
            image.srcset = srcset;
          }
          
          image.classList.add('loaded');
          obs.unobserve(image);
        }
      });
    }, {
      rootMargin,
      threshold
    });
    
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) img.src = src;
    if (srcset) img.srcset = srcset;
  }
};

/**
 * Preload critical images
 * @param {string[]} images - Array of image URLs to preload
 */
export const preloadImages = (images = []) => {
  if (typeof window === 'undefined') return;
  
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

/**
 * Get image dimensions without loading the full image
 * @param {string} src - Image source
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Calculate aspect ratio padding for responsive images
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Padding percentage
 */
export const getAspectRatioPadding = (width, height) => {
  return `${(height / width) * 100}%`;
};

/**
 * Image loading states
 */
export const IMAGE_STATES = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

/**
 * Default image placeholder (base64 encoded 1x1 transparent pixel)
 */
export const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Blur placeholder for images (base64 encoded blurred image)
 * @param {string} color - Dominant color of the image
 * @returns {string} Data URL
 */
export const getBlurPlaceholder = (color = '#e5e7eb') => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}' filter='url(%23b)'/%3E%3C/svg%3E`;
};

export default {
  generateSrcSet,
  generateSizes,
  supportsWebP,
  getOptimizedSrc,
  lazyLoadImage,
  preloadImages,
  getImageDimensions,
  getAspectRatioPadding,
  IMAGE_STATES,
  PLACEHOLDER_IMAGE,
  getBlurPlaceholder
};
