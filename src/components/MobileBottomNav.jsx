import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiShoppingCart, FiCalendar, FiUser, FiGrid } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './MobileBottomNav.css'

const navItems = [
  { icon: FiHome, label: 'Home', path: '/' },
  { icon: FiGrid, label: 'Menu', path: '/menu' },
  { icon: FiShoppingCart, label: 'Cart', path: '/cart', showBadge: true },
  { icon: FiCalendar, label: 'Book', path: '/booking' },
  { icon: FiUser, label: 'Profile', path: '/profile', requiresAuth: true, loginPath: '/login' },
]

export default function MobileBottomNav() {
  const location = useLocation()
  const { itemCount } = useCart()
  const { user } = useAuth()

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
      {navItems.map(({ icon: Icon, label, path, showBadge, requiresAuth, loginPath }) => {
        const href = requiresAuth && !user ? loginPath : path
        const isActive = location.pathname === href || location.pathname === path
        return (
          <Link
            key={label}
            to={href}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">
              <Icon size={22} />
              {showBadge && itemCount > 0 && (
                <span className="bottom-nav-badge" aria-label={`${itemCount} items in cart`}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </span>
            <span className="bottom-nav-label">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
