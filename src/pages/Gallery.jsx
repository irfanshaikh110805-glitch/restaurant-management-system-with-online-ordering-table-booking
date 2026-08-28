import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import useSEO from '../hooks/useSEO'
import './Gallery.css'

const galleryItems = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Elegant restaurant interior with warm lighting',
    category: 'Ambiance'
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Indian curry served in traditional copper bowls',
    category: 'Curries'
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Tandoori platter with assorted grilled kebabs',
    category: 'Tandoor'
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Rich Indian curries arranged on a wooden table',
    category: 'Signature'
  },
  {
    id: 5,
    src: '/gallery_spicy_dishes.webp',
    srcSmall: '/gallery_spicy_dishes.webp',
    srcMedium: '/gallery_spicy_dishes.webp',
    alt: 'Selection of spicy Indian dishes and naan bread',
    category: 'Specialties'
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?auto=compress&cs=tinysrgb&w=1200',
    srcSmall: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?auto=compress&cs=tinysrgb&w=600',
    srcMedium: 'https://images.pexels.com/photos/6419720/pexels-photo-6419720.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Freshly baked bread and snacks platter',
    category: 'Breads & Starters'
  },
]

export default function Gallery() {
  const [activeItem, setActiveItem] = useState(null)

  useSEO({
    title: 'Gallery',
    description: 'View photos of Hotel Everest Family Restaurant. Experience the premium ambiance and authentic Indian dishes we offer in Vijayapura.',
    canonical: 'https://hoteleverestfamilyrestaurant.netlify.app/gallery'
  })

  const handleNext = (e) => {
    if (e) e.stopPropagation()
    const curr = galleryItems.findIndex(i => i.id === activeItem.id)
    const next = galleryItems[(curr + 1) % galleryItems.length]
    setActiveItem(next)
  }

  const handlePrev = (e) => {
    if (e) e.stopPropagation()
    const curr = galleryItems.findIndex(i => i.id === activeItem.id)
    const prev = galleryItems[(curr - 1 + galleryItems.length) % galleryItems.length]
    setActiveItem(prev)
  }

  useEffect(() => {
    if (!activeItem) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveItem(null)
      if (event.key === 'ArrowRight') handleNext()
      if (event.key === 'ArrowLeft') handlePrev()
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
          <p className="text-secondary section-subtitle">
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
                <div className="gallery-card-caption">
                  <p>{item.alt}</p>
                </div>
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
              {/* Previous Button */}
              <button
                type="button"
                className="gallery-lightbox-nav prev"
                onClick={handlePrev}
                aria-label="Previous image"
              >
                <FiChevronLeft size={28} />
              </button>

              {/* Lightbox Content Container */}
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
                  <FiX size={22} />
                </button>

                <div className="gallery-lightbox-image-wrap">
                  <img
                    src={activeItem.src}
                    alt={activeItem.alt}
                    loading="eager"
                  />
                </div>

                <div className="gallery-lightbox-caption">
                  {activeItem.category && (
                    <span className="gallery-lightbox-badge">{activeItem.category}</span>
                  )}
                  <h3>{activeItem.alt}</h3>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                className="gallery-lightbox-nav next"
                onClick={handleNext}
                aria-label="Next image"
              >
                <FiChevronRight size={28} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
