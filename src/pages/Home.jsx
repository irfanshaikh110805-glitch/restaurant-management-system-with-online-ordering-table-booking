import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiStar, FiMapPin, FiClock, FiPhone, FiAward, FiHeart, FiTruck, FiGift } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { pageTransition, staggerContainer, fadeInUp, scaleIn, reveal, cardHover } from '../utils/animations'
import './Home.css'

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  useEffect(() => {
    fetchData()
    
    // Subscribe to real-time updates for featured items and reviews
    const itemsSub = supabase
      .channel('featured-items')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'menu_items',
        filter: 'is_featured=eq.true'
      }, handleFeaturedItemsUpdate)
      .subscribe()

    const reviewsSub = supabase
      .channel('featured-reviews')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reviews',
        filter: 'is_featured=eq.true'
      }, handleNewReview)
      .subscribe()

    return () => {
      itemsSub.unsubscribe()
      reviewsSub.unsubscribe()
    }
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

  const handleFeaturedItemsUpdate = (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      fetchData() // Refresh featured items
    }
  }

  const handleNewReview = (payload) => {
    setReviews(prev => [payload.new, ...prev.slice(0, 5)])
    toast('New review posted!', { icon: '⭐' })
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
    <motion.div 
      className="home"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <motion.div 
          className="hero-background"
          style={{ y: heroY, opacity: heroOpacity }}
        />
        <div className="hero-content container">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Experience Authentic <span className="text-primary gradient-text">Indian Flavors</span>
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            From traditional biryani to exotic kebabs, discover the rich culinary heritage of India
          </motion.p>
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/menu" className="btn btn-primary btn-lg">
                <span>View Menu</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/booking" className="btn btn-secondary btn-lg">
                <span>Book Table</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">Experience excellence in every aspect of dining</p>
          </motion.div>
          
          <motion.div 
            className="features-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                variants={fadeInUp}
                whileHover={{ y: -12, scale: 1.03 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="feature-icon-wrapper"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.2 + index * 0.1, 
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  <motion.div 
                    className="feature-icon"
                    style={{ background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)` }}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon size={32} style={{ color: feature.color }} />
                  </motion.div>
                  <motion.div 
                    className="feature-icon-bg"
                    style={{ background: `${feature.color}10` }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {feature.title}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {feature.description}
                </motion.p>
                
                <motion.div 
                  className="feature-shine"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="section featured-section">
        <div className="container">
          <motion.div className="section-header" {...reveal}>
            <h2 className="section-title">Featured Dishes</h2>
            <p className="section-subtitle">Handpicked favorites that keep our customers coming back</p>
          </motion.div>
          
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
            <motion.div 
              className="grid grid-3"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  whileHover="hover"
                  initial="rest"
                  className="featured-card card"
                >
                  <motion.div variants={cardHover}>
                    {item.image_url && (
                      <div className="featured-image">
                        <motion.img
                          src={item.image_url}
                          alt={item.name}
                          loading={index < 3 ? 'eager' : 'lazy'}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <motion.div 
                          className="featured-badge"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <FiAward size={16} />
                        </motion.div>
                      </div>
                    )}
                    <div className="featured-content">
                      <h3>{item.name}</h3>
                      <p className="text-secondary">{item.description}</p>
                      <div className="featured-footer">
                        <span className="price">₹{item.price}</span>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link to="/menu" className="btn btn-primary btn-sm">
                            <span>Order Now</span>
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
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
            <motion.div 
              className="about-content"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/menu" className="btn btn-primary">
                  <span>Explore Our Menu</span>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="about-stats"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { number: '20+', label: 'Years Experience', icon: FiAward },
                { number: '50+', label: 'Menu Items', icon: FiStar },
                { number: '10k+', label: 'Happy Customers', icon: FiHeart }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="stat-card card"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  >
                    <stat.icon size={24} className="stat-icon-svg" />
                  </motion.div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <motion.div className="section-header" {...reveal}>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real reviews from real food lovers</p>
          </motion.div>
          
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
            <motion.div 
              className="grid grid-3"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {reviews.map((review, index) => (
                <motion.div 
                  key={review.id} 
                  className="testimonial-card card"
                  variants={fadeInUp}
                  whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="rating"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {[...Array(review.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                      >
                        <FiStar fill="var(--primary)" color="var(--primary)" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="testimonial-text">"{review.comment}"</p>
                  <div className="testimonial-author">
                    <strong>{review.profiles?.full_name || 'Happy Customer'}</strong>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <FiGift size={48} className="cta-icon" />
            </motion.div>
            <h2>Join Our Loyalty Program</h2>
            <p>Earn points with every order and unlock exclusive rewards, discounts, and special offers</p>
            <motion.div 
              className="cta-actions"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/loyalty" className="btn btn-primary btn-lg">
                  <span>Learn More</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/promotions" className="btn btn-secondary btn-lg">
                  <span>View Offers</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            {...reveal}
          >
            Visit Us
          </motion.h2>
          <div className="contact-grid">
            <motion.div 
              className="contact-info"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { icon: FiMapPin, title: 'Location', content: 'MG Road, Vijayapura, Karnataka 586101' },
                { icon: FiPhone, title: 'Phone', content: '+91 98765 43210' },
                { icon: FiClock, title: 'Hours', content: ['Mon-Fri: 11:00 AM - 11:00 PM', 'Sat-Sun: 10:00 AM - 12:00 AM'] }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="contact-item"
                  variants={fadeInUp}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="contact-icon"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon size={24} />
                  </motion.div>
                  <div>
                    <h4>{item.title}</h4>
                    {Array.isArray(item.content) ? (
                      item.content.map((line, i) => <p key={i}>{line}</p>)
                    ) : (
                      <p>{item.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div 
              className="map-container"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=75.6900%2C16.8100%2C75.7300%2C16.8400&layer=mapnik&marker=16.8251,75.7100"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                loading="lazy"
                title="Restaurant Location"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
