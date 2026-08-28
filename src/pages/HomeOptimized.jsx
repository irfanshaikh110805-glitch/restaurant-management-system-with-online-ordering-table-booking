import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiPlus, FiStar, FiCalendar, FiClock, FiUsers, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import useSEO from '../hooks/useSEO'
import './Home.css'

const HERO_SLIDES = [
  {
    id: 1,
    titleLine1: 'Experience',
    titleLine2: 'Fine Dining',
    subtitle: 'Where timeless royal recipes meet modern culinary mastercraft in an atmosphere of refined elegance.',
    image: '/luxury_hero_plated.jpg',
    tag: 'CHEF\'S DEGUSTATION'
  },
  {
    id: 2,
    titleLine1: 'Royal Tandoor',
    titleLine2: 'Masterpieces',
    subtitle: 'Slow-marinated organic meats and artisan paneer fired to smoky perfection in traditional clay ovens.',
    image: '/luxury_banquet_spread.jpg',
    tag: 'HERITAGE TRADITION'
  },
  {
    id: 3,
    titleLine1: 'Artisan Flavors',
    titleLine2: '& Sweet Alchemy',
    subtitle: 'Handcrafted desserts with 24k edible gold and hand-ground single-origin saffron essences.',
    image: '/pedestal_dish_3.jpg',
    tag: 'SWEET REVELATIONS'
  }
]

const SIGNATURE_PEDESTAL_DISHES = [
  {
    id: 'biryani-special',
    name: 'Hyderabadi Dum Biryani (Chicken)',
    category: 'Mains',
    price: 360,
    image: '/pedestal_dish_1.jpg',
    description: 'Slow-cooked fragrant basmati rice with marinated chicken, saffron, and whole royal spices.',
    calories: '480 kcal',
    tag: 'Chef Choice'
  },
  {
    id: 'butter-chicken-special',
    name: 'Butter Chicken Everest Special',
    category: 'Mains',
    price: 370,
    image: '/pedestal_dish_2.jpg',
    description: 'Tender tandoori chicken simmered in rich creamy tomato cashew gravy with fresh fenugreek.',
    calories: '510 kcal',
    tag: 'Signature'
  },
  {
    id: 'garlic-naan-special',
    name: 'Garlic Butter Naan',
    category: 'Breads',
    price: 70,
    image: '/pedestal_dish_3.jpg',
    description: 'Freshly baked clay oven flatbread brushed with golden butter, roasted garlic, and coriander.',
    calories: '190 kcal',
    tag: 'Artisan'
  }
]

export default function HomeOptimized() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [pedestalDishes, setPedestalDishes] = useState(SIGNATURE_PEDESTAL_DISHES)
  const [quickItem, setQuickItem] = useState(null)
  const [quickDate, setQuickDate] = useState('')
  const [quickTime, setQuickTime] = useState('19:30')
  const [quickGuests, setQuickGuests] = useState(2)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useSEO({
    title: 'Experience Fine Dining — Hotel Everest',
    description: 'Luxury Indian Fine Dining Restaurant in Vijayapura. Indulge in royal biryanis, slow-fired tandoor specialties, and exquisite artisan creations.',
    canonical: 'https://hoteleverestfamilyrestaurant.netlify.app/'
  })

  // Auto slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  // Fetch real menu items with real UUIDs from Supabase
  useEffect(() => {
    const fetchSignatureDishes = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .limit(3)

        if (!error && data && data.length >= 3) {
          setPedestalDishes(data.map((dish, idx) => ({
            id: dish.id,
            name: dish.name,
            category: dish.category_id || 'Signature',
            price: Number(dish.price),
            image: dish.image_url || SIGNATURE_PEDESTAL_DISHES[idx]?.image || `/pedestal_dish_${idx + 1}.jpg`,
            description: dish.description || SIGNATURE_PEDESTAL_DISHES[idx]?.description,
            calories: dish.calories || '350 kcal',
            tag: idx === 0 ? 'Chef Choice' : idx === 1 ? 'Signature' : 'Artisan'
          })))
        }
      } catch (err) {
        console.warn('Using default pedestal items:', err)
      }
    }
    fetchSignatureDishes()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  const handleQuickAddToCart = (e, dish) => {
    e.stopPropagation()
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image,
      category: dish.category
    })
    toast.success(`${dish.name} added to cart`, {
      icon: '✨',
      style: {
        background: '#1C1917',
        color: '#FAF7F2',
        border: '1px solid rgba(197, 154, 69, 0.4)',
        fontSize: '0.875rem',
        fontWeight: 600
      }
    })
  }

  const handleReserveQuick = (e) => {
    e.preventDefault()
    navigate(`/booking?date=${quickDate || new Date().toISOString().split('T')[0]}&time=${quickTime}&guests=${quickGuests}`)
  }

  return (
    <div className="luxury-home-page">
      <div className="luxury-container">
        {/* =========================================================
            HERO SECTION: Large rounded banner with swash typography
            ========================================================= */}
        <section className="luxury-hero-section">
          {/* Left / Right Carousel Controls */}
          <button 
            className="hero-arrow-btn hero-arrow-left" 
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <FiChevronLeft size={22} />
          </button>

          <button 
            className="hero-arrow-btn hero-arrow-right" 
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <FiChevronRight size={22} />
          </button>

          {/* Hero Banner Container */}
          <div className="hero-banner-card">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                className="hero-slide-bg"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
              />
            </AnimatePresence>

            <div className="hero-banner-overlay" />

            <div className="hero-banner-content">
              <motion.span 
                className="hero-pill-tag"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`tag-${currentSlide}`}
                transition={{ delay: 0.2 }}
              >
                ✦ {HERO_SLIDES[currentSlide].tag} ✦
              </motion.span>

              <motion.h1 
                className="hero-swash-title"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={`title-${currentSlide}`}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <span className="swash-line-1">{HERO_SLIDES[currentSlide].titleLine1}</span>
                <span className="swash-line-2">{HERO_SLIDES[currentSlide].titleLine2}</span>
              </motion.h1>

              <motion.p 
                className="hero-banner-subtext"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={`sub-${currentSlide}`}
                transition={{ delay: 0.4 }}
              >
                {HERO_SLIDES[currentSlide].subtitle}
              </motion.p>

              <motion.div 
                className="hero-banner-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/menu" className="btn-pill btn-pill-sand hero-cta-btn">
                  EXPLORE MENU
                </Link>
                <Link to="/booking" className="btn-pill btn-pill-outline-light hero-cta-btn">
                  RESERVE TABLE
                </Link>
              </motion.div>
            </div>

            {/* Slide Indicator Dots */}
            <div className="hero-dots-indicator">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            QUICK TABLE RESERVATION BAR
            ========================================================= */}
        <section className="reservation-quick-strip">
          <form className="reservation-strip-card" onSubmit={handleReserveQuick}>
            <div className="strip-field">
              <label><FiCalendar size={14} /> Date</label>
              <input 
                type="date" 
                value={quickDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setQuickDate(e.target.value)}
                className="strip-input"
              />
            </div>

            <div className="strip-divider" />

            <div className="strip-field">
              <label><FiClock size={14} /> Time Slot</label>
              <select 
                value={quickTime} 
                onChange={(e) => setQuickTime(e.target.value)}
                className="strip-input"
              >
                <option value="12:30">12:30 PM — Lunch</option>
                <option value="13:30">01:30 PM — Lunch</option>
                <option value="19:00">07:00 PM — Dinner</option>
                <option value="19:30">07:30 PM — Prime Dinner</option>
                <option value="20:30">08:30 PM — Gala Dinner</option>
                <option value="21:30">09:30 PM — Late Supper</option>
              </select>
            </div>

            <div className="strip-divider" />

            <div className="strip-field">
              <label><FiUsers size={14} /> Guests</label>
              <select 
                value={quickGuests} 
                onChange={(e) => setQuickGuests(Number(e.target.value))}
                className="strip-input"
              >
                <option value={2}>2 Guests (Intimate Table)</option>
                <option value={4}>4 Guests (Family Booth)</option>
                <option value={6}>6 Guests (Royal Pavilion)</option>
                <option value={8}>8+ Guests (Banquet Suite)</option>
              </select>
            </div>

            <button type="submit" className="btn-pill btn-pill-dark strip-submit-btn">
              <span>FIND A TABLE</span>
            </button>
          </form>
        </section>

        {/* =========================================================
            MAIN EDITORIAL ASYMMETRIC GRID
            ========================================================= */}
        <section className="editorial-main-grid">
          {/* ---------------- LEFT COLUMN ---------------- */}
          <div className="editorial-col editorial-col-left">
            
            {/* "Our Menu" Header */}
            <div className="section-title-wrap">
              <h2 className="editorial-serif-title">Our Menu</h2>
              <span className="editorial-title-badge">CRAFTED DAILY</span>
            </div>

            {/* 3D Floating Pedestal Dish #1 */}
            <div 
              className="pedestal-feature-block"
              onClick={() => setQuickItem(pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0])}
            >
              <div className="pedestal-isometric-stage">
                <div className="pedestal-dish-plate">
                  <img 
                    src={(pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0]).image} 
                    alt={(pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0]).name}
                    className="dish-top-image"
                    loading="lazy"
                  />
                  <button 
                    className="pedestal-add-badge"
                    onClick={(e) => handleQuickAddToCart(e, pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0])}
                    title="Add to cart"
                    aria-label={`Add ${(pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0]).name} to order`}
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
                {/* 3D Isometric Pedestal Block */}
                <div className="pedestal-3d-box">
                  <div className="pedestal-face pedestal-top" />
                  <div className="pedestal-face pedestal-front" />
                  <div className="pedestal-face pedestal-side" />
                </div>
              </div>

              <div className="pedestal-info-card">
                <div className="pedestal-info-header">
                  <h3>{(pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0]).name}</h3>
                  <span className="pedestal-price">₹{(pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0]).price}</span>
                </div>
                <p>{(pedestalDishes[0] || SIGNATURE_PEDESTAL_DISHES[0]).description}</p>
              </div>
            </div>

            {/* Story / Signature Text Block */}
            <div className="editorial-story-block">
              <h3 className="story-serif-heading">Treasured Flavors</h3>
              <p className="story-body-text">
                Every recipe is an homage to royal Nizami and Mughlai gastronomy. We grind whole spices daily in stone pestles and slow-simmer gravies in sealed handis to capture every fragrant note.
              </p>
            </div>

            {/* 3D Floating Pedestal Dish #2 */}
            <div 
              className="pedestal-feature-block"
              onClick={() => setQuickItem(pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1])}
            >
              <div className="pedestal-isometric-stage">
                <div className="pedestal-dish-plate">
                  <img 
                    src={(pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1]).image} 
                    alt={(pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1]).name}
                    className="dish-top-image"
                    loading="lazy"
                  />
                  <button 
                    className="pedestal-add-badge"
                    onClick={(e) => handleQuickAddToCart(e, pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1])}
                    title="Add to cart"
                    aria-label={`Add ${(pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1]).name} to order`}
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
                {/* 3D Isometric Pedestal Block */}
                <div className="pedestal-3d-box">
                  <div className="pedestal-face pedestal-top" />
                  <div className="pedestal-face pedestal-front" />
                  <div className="pedestal-face pedestal-side" />
                </div>
              </div>

              <div className="pedestal-info-card">
                <div className="pedestal-info-header">
                  <h3>{(pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1]).name}</h3>
                  <span className="pedestal-price">₹{(pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1]).price}</span>
                </div>
                <p>{(pedestalDishes[1] || SIGNATURE_PEDESTAL_DISHES[1]).description}</p>
              </div>
            </div>

            {/* Dual Bento Pair #1 */}
            <div className="bento-dual-pair">
              {/* Heritage Story Bento */}
              <div className="bento-card bento-taupe bento-text-card">
                <span className="bento-mini-label">SINCE 2003</span>
                <h3 className="bento-title">Heritage</h3>
                <p className="bento-desc">
                  Two decades of culinary reverence. Hand-selected organic produce, artisanal clarified butter, and aged basmati.
                </p>
                <Link to="/menu" className="btn-pill btn-pill-dark bento-action-btn">
                  EXPLORE MENU
                </Link>
              </div>

              {/* Dark Rich Dish Photo Bento */}
              <div className="bento-card bento-photo-card">
                <img 
                  src="/luxury_bento_dark_dish.jpg" 
                  alt="Slow-cooked Dum Curry with saffron and hand-pressed butter"
                  className="bento-img-cover"
                  loading="lazy"
                />
                <div className="bento-photo-overlay">
                  <span className="photo-tag">Dum Handi Favourites</span>
                </div>
              </div>
            </div>

          </div>

          {/* ---------------- RIGHT COLUMN ---------------- */}
          <div className="editorial-col editorial-col-right">
            
            {/* "About Us" Executive Chef Bento Card */}
            <div className="bento-card bento-chef-card">
              <img 
                src="/luxury_chef_portrait.jpg" 
                alt="Executive Chef preparing culinary art"
                className="chef-bg-image"
                loading="lazy"
              />
              <div className="chef-card-overlay">
                <div className="chef-header-content">
                  <h2 className="chef-serif-title">About Us</h2>
                  <p className="chef-subtext">
                    Curated by Head Chefs with over two decades of fine dining artistry. Where royal culinary heritage meets modern elegance.
                  </p>
                  <Link to="/about" className="btn-pill btn-pill-outline-light chef-cta-btn">
                    DISCOVER OUR STORY
                  </Link>
                </div>
              </div>
            </div>

            {/* 3D Floating Pedestal Dish #3 */}
            <div 
              className="pedestal-feature-block"
              onClick={() => setQuickItem(pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2])}
            >
              <div className="pedestal-isometric-stage">
                <div className="pedestal-dish-plate">
                  <img 
                    src={(pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2]).image} 
                    alt={(pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2]).name}
                    className="dish-top-image"
                    loading="lazy"
                  />
                  <button 
                    className="pedestal-add-badge"
                    onClick={(e) => handleQuickAddToCart(e, pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2])}
                    title="Add to cart"
                    aria-label={`Add ${(pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2]).name} to order`}
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
                {/* 3D Isometric Pedestal Block */}
                <div className="pedestal-3d-box">
                  <div className="pedestal-face pedestal-top" />
                  <div className="pedestal-face pedestal-front" />
                  <div className="pedestal-face pedestal-side" />
                </div>
              </div>

              <div className="pedestal-info-card">
                <div className="pedestal-info-header">
                  <h3>{(pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2]).name}</h3>
                  <span className="pedestal-price">₹{(pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2]).price}</span>
                </div>
                <p>{(pedestalDishes[2] || SIGNATURE_PEDESTAL_DISHES[2]).description}</p>
              </div>
            </div>

            {/* Customer Reviews Bento Card */}
            <div className="bento-card bento-taupe bento-review-card">
              <div className="review-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} fill="#C59A45" color="#C59A45" size={16} />
                ))}
                <span className="rating-num">5.0 EXCELLENCE</span>
              </div>
              <h3 className="bento-title">Customer Reviews</h3>
              <p className="bento-quote">
                "An unforgettable culinary soiree. The royal tandoori platter and the saffron biryani are without doubt the finest gastronomic experiences in Karnataka."
              </p>
              <div className="review-author-meta">
                <strong>Anand &amp; Sunita Varma</strong>
                <span>Verified Gourmet Diners</span>
              </div>
              <Link to="/reviews" className="btn-pill btn-pill-sand bento-action-btn">
                READ ALL REVIEWS
              </Link>
            </div>

            {/* Dual Bento Pair #2 */}
            <div className="bento-dual-pair">
              {/* Gallery Text Bento */}
              <div className="bento-card bento-taupe bento-text-card">
                <span className="bento-mini-label">ATMOSPHERE</span>
                <h3 className="bento-title">Gallery</h3>
                <p className="bento-desc">
                  Step inside our opulent dining halls, ambient private candlelit alcoves, and live show kitchen.
                </p>
                <Link to="/gallery" className="btn-pill btn-pill-dark bento-action-btn">
                  VIEW GALLERY
                </Link>
              </div>

              {/* Banquet Spread Photo Bento */}
              <div className="bento-card bento-photo-card">
                <img 
                  src="/luxury_banquet_spread.jpg" 
                  alt="Royal Indian fine dining banquet table spread"
                  className="bento-img-cover"
                  loading="lazy"
                />
                <div className="bento-photo-overlay">
                  <span className="photo-tag">Private Banquets</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            VIP PRIVILEGES & LOYALTY CLUB STRIP
            ========================================================= */}
        <section className="luxury-vip-strip">
          <div className="vip-strip-card">
            <div className="vip-strip-content">
              <span className="vip-badge">HOTEL EVEREST PRIVILEGE CLUB</span>
              <h2 className="vip-title">Join Our Exclusive Gastronomic Circle</h2>
              <p className="vip-text">
                Complimentary dessert on your anniversary, priority table booking, chef's seasonal tasting invites, and reward points with every dine-in &amp; delivery order.
              </p>
            </div>
            <div className="vip-strip-actions">
              <Link to="/loyalty" className="btn-pill btn-pill-dark">
                JOIN PRIVILEGE CLUB
              </Link>
              <Link to="/promotions" className="btn-pill btn-pill-outline">
                VIEW OFFERS
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          QUICK VIEW MODAL FOR DISHES
          ========================================================= */}
      <AnimatePresence>
        {quickItem && (
          <div className="quickview-modal-backdrop" onClick={() => setQuickItem(null)}>
            <motion.div 
              className="quickview-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                className="quickview-close-btn"
                onClick={() => setQuickItem(null)}
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>

              <div className="quickview-image-side">
                <img src={quickItem.image} alt={quickItem.name} />
                <span className="quickview-tag">{quickItem.tag}</span>
              </div>

              <div className="quickview-details-side">
                <span className="quickview-category">{quickItem.category} &bull; {quickItem.calories}</span>
                <h3 className="quickview-title">{quickItem.name}</h3>
                <p className="quickview-desc">{quickItem.description}</p>
                
                <div className="quickview-price-row">
                  <span className="quickview-price">₹{quickItem.price}</span>
                  <span className="quickview-tax">Inclusive of all taxes</span>
                </div>

                <div className="quickview-action-row">
                  <button 
                    className="btn-pill btn-pill-dark btn-full-width"
                    onClick={(e) => {
                      handleQuickAddToCart(e, quickItem)
                      setQuickItem(null)
                    }}
                  >
                    <FiPlus size={16} /> ADD TO ORDER
                  </button>
                  <Link 
                    to="/menu" 
                    className="btn-pill btn-pill-outline btn-full-width"
                    onClick={() => setQuickItem(null)}
                  >
                    EXPLORE FULL MENU
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
