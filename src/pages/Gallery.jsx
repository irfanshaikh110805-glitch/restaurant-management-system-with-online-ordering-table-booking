import { useEffect, useState } from 'react'
import './Gallery.css'

const galleryItems = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Elegant restaurant interior with warm lighting',
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Indian curry served in traditional copper bowls',
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Tandoori platter with assorted grilled kebabs',
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Rich Indian curries arranged on a wooden table',
  },
  {
    id: 5,
    src: '/gallery_spicy_dishes.png',
    srcSmall: '/gallery_spicy_dishes.png',
    srcMedium: '/gallery_spicy_dishes.png',
    alt: 'Selection of spicy Indian dishes and naan bread',
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Freshly baked bread and snacks platter',
  },
]

export default function Gallery() {
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    if (!activeItem) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveItem(null)
      if (event.key === 'ArrowRight') {
        const curr = galleryItems.findIndex(i => i.id === activeItem.id)
        const next = galleryItems[(curr + 1) % galleryItems.length]
        setActiveItem(next)
      }
      if (event.key === 'ArrowLeft') {
        const curr = galleryItems.findIndex(i => i.id === activeItem.id)
        const prev = galleryItems[(curr - 1 + galleryItems.length) % galleryItems.length]
        setActiveItem(prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = activeItem ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeItem])

  return (
    <div className="gallery-page">
      <section className="section">
        <div className="container">
          <h1 className="section-title">Photo Gallery</h1>
          <p className="text-secondary" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            Take a visual tour of Hotel Everest Family Restaurant&apos;s warm interiors and signature
            dishes before you visit us in person.
          </p>

          <div className="gallery-grid">
            {galleryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="gallery-card"
                onClick={() => setActiveItem(item)}
                aria-label={`View full image: ${item.alt}`}
              >
                <div className="featured-image">
                  <img
                    src={item.srcSmall}
                    srcSet={`${item.srcSmall} 600w, ${item.srcMedium} 900w, ${item.src} 1200w`}
                    sizes="(max-width: 480px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    alt={item.alt}
                    loading={item.id <= 3 ? 'eager' : 'lazy'}
                  />
                </div>
                <p>{item.alt}</p>
              </button>
            ))}
          </div>

          {activeItem && (
            <div
              className="gallery-lightbox-backdrop"
              onClick={() => setActiveItem(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Image viewer"
            >
              <div
                className="gallery-lightbox-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="gallery-lightbox-close"
                  onClick={() => setActiveItem(null)}
                  aria-label="Close image"
                >
                  ×
                </button>
                <img
                  src={activeItem.src}
                  alt={activeItem.alt}
                  loading="eager"
                />
                <p className="text-secondary" style={{ textAlign: 'center', marginBottom: 0 }}>
                  {activeItem.alt}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
