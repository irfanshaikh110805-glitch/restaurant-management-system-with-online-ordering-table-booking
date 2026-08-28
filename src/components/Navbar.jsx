import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import NotificationBell from './NotificationBell'
import './Navbar.css'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { scrollY } = useScroll({ layoutEffect: false })

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'MENU', path: '/menu' },
    { name: 'ABOUT', path: '/about' },
    { name: 'RESERVATION', path: '/booking' },
    { name: 'GALLERY', path: '/gallery' },
    { name: 'CONTACT', path: '/contact' }
  ]

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav
        className="navbar"
        aria-label="Main navigation"
      >
        <div className="container navbar-container">
          {/* Luxury Monogram Crest Logo */}
          <Link to="/" className="navbar-logo" aria-label="Hotel Everest — Fine Dining Homepage">
            <div className="logo-crest">
              <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
                <circle cx="22" cy="22" r="20" stroke="url(#goldGrad)" strokeWidth="1.5" />
                <circle cx="22" cy="22" r="17" stroke="url(#goldGrad)" strokeWidth="0.75" strokeDasharray="2 2" />
                <path d="M15 15V29M15 22H24M24 15V29" stroke="url(#goldGrad)" strokeWidth="1.75" strokeLinecap="round" />
                <path d="M28 15H35M28 22H33M28 29H35" stroke="url(#goldGrad)" strokeWidth="1.75" strokeLinecap="round" />
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#DFBF77" />
                    <stop offset="50%" stopColor="#C59A45" />
                    <stop offset="100%" stopColor="#8E6A23" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text-group">
              <span className="logo-text-title">HOTEL EVEREST</span>
              <span className="logo-text-sub">FINE DINING &bull; EST. 2003</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="navbar-menu" aria-label="Site pages">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.name}
                  {isActive && <span className="nav-link-dot" />}
                </Link>
              )
            })}
            {isAdmin && (
              <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                ADMIN
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="navbar-actions">
            {user && <NotificationBell />}

            <Link to="/cart" className="cart-button" aria-label={`Shopping cart with ${itemCount} items`}>
              <FiShoppingCart size={18} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span 
                    className="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={itemCount}
                    aria-label={`${itemCount} items in cart`}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Desktop Book Table Pill Button (Only shown in customer views, not in Admin) */}
            {!location.pathname.startsWith('/admin') && (
              <Link to="/booking" className="navbar-reserve-pill">
                <span>BOOK A TABLE</span>
              </Link>
            )}

            {user ? (
              <div className="user-menu">
                <Link to="/profile" className="btn-profile-pill" title="My Profile">
                  <FiUser size={14} />
                  <span>PROFILE</span>
                </Link>
                <button 
                  onClick={handleSignOut} 
                  className="btn-icon-logout"
                  aria-label="Sign out of your account"
                  title="Sign Out"
                >
                  <FiLogOut size={15} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="navbar-login-link">
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
