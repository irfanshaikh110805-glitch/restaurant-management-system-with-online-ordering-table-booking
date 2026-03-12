import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const { scrollY } = useScroll({ layoutEffect: false })

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ 
        y: 0,
        background: isScrolled ? "rgba(17, 24, 39, 0.98)" : "rgba(17, 24, 39, 0.95)",
        boxShadow: isScrolled ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "none"
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
            <motion.span 
              className="logo-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🌶️
            </motion.span>
            <span className="logo-text">Hotel Everest Family Restaurant</span>
          </Link>

          <div className="navbar-menu">
            {['Home', 'Menu', 'About', 'Gallery', 'Contact', 'Book Table'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={item === 'Book Table' ? '/booking' : item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                  className="nav-link"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/admin" className="nav-link">Admin</Link>
              </motion.div>
            )}
          </div>

          <div className="navbar-actions">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to="/cart" className="cart-button" aria-label={`Shopping cart with ${itemCount} items`}>
                <FiShoppingCart size={20} />
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
            </motion.div>

            {user ? (
              <div className="user-menu">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/profile" className="btn btn-secondary btn-sm">
                    <FiUser size={16} />
                    <span>Profile</span>
                  </Link>
                </motion.div>
                <motion.button 
                  onClick={handleSignOut} 
                  className="btn btn-secondary btn-sm"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <FiLogOut size={16} />
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
              </motion.div>
            )}

            {/* Mobile Toggle */}
            <motion.button 
              className="mobile-toggle" 
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle mobile menu"
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiX size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMenu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {['Home', 'Menu', 'About', 'Gallery', 'Contact', 'Book Table'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={item === 'Book Table' ? '/booking' : item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                    className="mobile-link" 
                    onClick={() => setIsOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/admin" className="mobile-link" onClick={() => setIsOpen(false)}>
                    Admin
                  </Link>
                </motion.div>
              )}
              {user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link to="/profile" className="mobile-link" onClick={() => setIsOpen(false)}>
                    Profile
                  </Link>
                </motion.div>
              )}
              {user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.40 }}
                >
                  <button
                    className="mobile-link mobile-sign-out"
                    onClick={handleSignOut}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--error)' }}
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link to="/login" className="mobile-link mobile-login-link" onClick={() => setIsOpen(false)}>
                    🔐 Login / Register
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
