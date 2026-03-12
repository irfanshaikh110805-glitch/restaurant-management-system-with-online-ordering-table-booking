import { useState, useEffect, useRef } from 'react';
import './OptimizedImage.css';

/**
 * Optimized Image Component with:
 * - Lazy loading
 * - Blur-up placeholder
 * - Intersection Observer
 * - Error handling
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  onLoad,
  onError,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) return; // Skip observer for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  return (
    <div 
      ref={imgRef}
      className={`optimized-image-wrapper ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!hasError ? (
        <>
          {/* Placeholder blur */}
          {!isLoaded && (
            <div className="image-placeholder" />
          )}
          
          {/* Actual image */}
          {isInView && (
            <img
              src={src}
              alt={alt}
              className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={handleLoad}
              onError={handleError}
              {...props}
            />
          )}
        </>
      ) : (
        <div className="image-error">
          <span>🖼️</span>
          <p>Image unavailable</p>
        </div>
      )}
    </div>
  );
}
