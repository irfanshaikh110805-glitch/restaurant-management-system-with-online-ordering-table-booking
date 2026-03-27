import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiStar, FiMapPin, FiClock, FiPhone, FiAward, FiHeart, FiTruck, FiGift } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import './Home.css'

export default function HomeOptimized() {
  const [featuredItems, setFeaturedItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, reviewsRes] = await Promise.all([
        supabase.from('menu_items').select('*').eq('is_featured', true).limit(6),
        supabase
          .from('reviews')
          .select('*, profiles(full_name)')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6)
      ])

      if (itemsRes.data) setFeaturedItems(itemsRes.data)
      if (reviewsRes.data) setReviews(reviewsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load homepage data')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { 
      icon: FiAward, 
      title: '20+ Years of Hospitality', 
      description: 'Serving authentic Indian cuisine with passion and dedication since 2003',
      color: '#f59e0b'
    },
    { 
      icon: FiHeart, 
      title: 'Loved by Locals & Travelers', 
      description: 'Trusted by thousands of satisfied customers from around the world',
      color: '#ef4444'
    },
    { 
      icon: FiStar, 
      title: 'Top-Rated Indian Cuisine', 
      description: 'Award-winning dishes crafted with authentic spices and fresh ingredients',
      color: '#d97706'
    },
    { 
      icon: FiTruck, 
      title: 'Fast & Fresh Delivery', 
      description: 'Hot meals delivered to your doorstep within 30 minutes',
      color: '#10b981'
    }
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background" />
        <div className="hero-content container">
          <h1 className="hero-title">
            An Unforgettable <span className="text-primary gradient-text">Culinary Journey</span>
          </h1>
          <p className="hero-subtitle">
            Immerse yourself in the opulent heritage of Indian fine dining, where timeless recipes meet modern elegance.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-primary btn-lg">
              <span>View Menu</span>
            </Link>
            <Link to="/booking" className="btn btn-secondary btn-lg">
              <span>Book Table</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">Experience excellence in every aspect of dining</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">
                  <div 
                    className="feature-icon"
                    style={{ background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)` }}
                  >
                    <feature.icon size={32} style={{ color: feature.color }} />
                  </div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef's Signature Section */}
      <section className="section signature-section" style={{ background: 'var(--bg-dark)', paddingBottom: '0' }}>
        <div className="container">
          <div className="about-grid" style={{ alignItems: 'center' }}>
            <div className="signature-image-wrapper" style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl), 0 0 50px rgba(212, 168, 83, 0.15)' }}>
              <img src="/premium_chef_special.png" alt="Chef's Signature Dish" style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.02)' }} loading="lazy" />
              <div className="badge badge-gold" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem 1rem', backdropFilter: 'blur(10px)', background: 'rgba(20,20,20,0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}>
                <FiAward size={18} /> Chef's Masterpiece
              </div>
            </div>
            <div className="signature-content about-content">
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem', marginTop: 0 }}>The Royal Tandoori Experience</h2>
              <p className="section-subtitle" style={{ marginLeft: 0, marginTop: 0, marginBottom: '2rem' }}>A majestic symphony of spices and flavors</p>
              <p>
                Indulge in our exquisite tasting experience, curated by our Head Chef. We carefully prepare the finest ingredients using authentic clay ovens to capture the true essence of royal Indian banquets. Every morsel tells a story of culinary heritage and unbridled passion.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem', margin: '1.5rem 0 2.5rem 0' }}>
                {['24-Hour Secret Marination', 'Premium Organic Spices', 'Authentic Clay Oven Cooking'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--gold-light)' }}>
                    <FiStar size={20} /> <span style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/menu" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start' }}>
                <span>Taste The Magic</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Dishes</h2>
            <p className="section-subtitle">Handpicked favorites that keep our customers coming back</p>
          </div>
          
          {loading ? (
            <div className="grid grid-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredItems.length > 0 ? (
            <div className="grid grid-3">
              {featuredItems.map((item, index) => (
                <div key={item.id} className="featured-card card">
                  {item.image_url && (
                    <div className="featured-image">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        width="400"
                        height="300"
                      />
                      <div className="featured-badge">
                        <FiAward size={16} />
                      </div>
                    </div>
                  )}
                  <div className="featured-content">
                    <h3>{item.name}</h3>
                    <p className="text-secondary">{item.description}</p>
                    <div className="featured-footer">
                      <span className="price">₹{item.price}</span>
                      <Link to="/menu" className="btn btn-primary btn-sm">
                        <span>Order Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured items available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="section about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                Our Story
              </h2>
              <p>
                Hotel Everest Family Restaurant is known for its warm hospitality and hearty,
                flavor-packed dishes on MG Road in Vijayapura. We bring together crowd-favorite
                recipes and a comfortable family dining atmosphere.
              </p>
              <p>
                From aromatic biryanis to sizzling tandoori platters, every dish is prepared with
                care so you can enjoy a relaxed meal with friends and family.
              </p>
              <Link to="/menu" className="btn btn-primary">
                <span>Explore Our Menu</span>
              </Link>
            </div>
            <div className="about-stats">
              {[
                { number: '20+', label: 'Years Experience', icon: FiAward },
                { number: '50+', label: 'Menu Items', icon: FiStar },
                { number: '10k+', label: 'Happy Customers', icon: FiHeart }
              ].map((stat, index) => (
                <div key={index} className="stat-card card">
                  <stat.icon size={24} className="stat-icon-svg" />
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real reviews from real food lovers</p>
          </div>
          
          {loading ? (
            <div className="grid grid-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-3">
              {reviews.map((review) => (
                <div key={review.id} className="testimonial-card card">
                  <div className="rating">
                    {[...Array(review.rating)].map((_, i) => (
                      <FiStar key={i} fill="var(--primary)" color="var(--primary)" />
                    ))}
                  </div>
                  <p className="testimonial-text">"{review.comment}"</p>
                  <div className="testimonial-author">
                    <strong>{review.profiles?.full_name || 'Happy Customer'}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No reviews available yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <FiGift size={48} className="cta-icon" />
            <h2>Join Our Loyalty Program</h2>
            <p>Earn points with every order and unlock exclusive rewards, discounts, and special offers</p>
            <div className="cta-actions">
              <Link to="/loyalty" className="btn btn-primary btn-lg">
                <span>Learn More</span>
              </Link>
              <Link to="/promotions" className="btn btn-secondary btn-lg">
                <span>View Offers</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact-section">
        <div className="container">
          <h2 className="section-title">Visit Us</h2>
          <div className="contact-grid">
            <div className="contact-info">
              {[
                { icon: FiMapPin, title: 'Location', content: 'MG Road, Vijayapura, Karnataka 586101' },
                { icon: FiPhone, title: 'Phone', content: '+91 98765 43210' },
                { icon: FiClock, title: 'Hours', content: ['Mon-Fri: 11:00 AM - 11:00 PM', 'Sat-Sun: 10:00 AM - 12:00 AM'] }
              ].map((item, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-icon">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4>{item.title}</h4>
                    {Array.isArray(item.content) ? (
                      item.content.map((line, i) => <p key={i}>{line}</p>)
                    ) : (
                      <p>{item.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="map-container">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=75.6900%2C16.8100%2C75.7300%2C16.8400&layer=mapnik&marker=16.8251,75.7100"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                loading="lazy"
                title="Restaurant Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
