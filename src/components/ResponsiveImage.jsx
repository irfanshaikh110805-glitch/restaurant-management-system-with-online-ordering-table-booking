import { useState, useEffect, useRef } from 'react'

/**
 * ResponsiveImage Component
 * Optimized image component with lazy loading, srcset, and loading states
 */
const ResponsiveImage = ({
  src,
  alt,
  className = '',
  sizes: _sizes = '100vw',
  aspectRatio = '16/9',
  loading = 'lazy',
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!imgRef.current || loading !== 'lazy') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '200px', // Increased from 50px for better UX
      }
    )

    const currentRef = imgRef.current
    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loading])

  const handleLoad = (e) => {
    setIsLoaded(true)
    if (onLoad) onLoad(e)
  }

  return (
    <div
      ref={imgRef}
      className={`responsive-image-container ${className}`}
      style={{ aspectRatio }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          className={`responsive-image ${isLoaded ? 'loaded' : ''}`}
          {...props}
        />
      )}
      {!isLoaded && (
        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  )
}

export default ResponsiveImage
