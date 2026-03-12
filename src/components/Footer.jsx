import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="logo-icon">🌶️</span>
              Hotel Everest Family Restaurant
            </h3>
            <p className="footer-text">
              Enjoy family-style dining with a wide selection of flavorful Indian and
              North Indian dishes, from hearty biryanis to tandoori specialties.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow us on Facebook">
                <FiFacebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow us on Instagram">
                <FiInstagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Follow us on Twitter">
                <FiTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/booking">Book Table</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-title">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <FiMapPin size={16} />
                <span>MG Road, Vijayapura, Karnataka 586101</span>
              </li>
              <li>
                <FiPhone size={16} />
                <a href="tel:+919876543210" style={{ color: 'inherit' }}>
                  +91 98765 43210
                </a>
              </li>
              <li>
                <FiMail size={16} />
                <a href="mailto:hello@hoteleverestfamilyrestaurant.com" style={{ color: 'inherit' }}>
                  hello@hoteleverestfamilyrestaurant.com
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="footer-section">
            <h4 className="footer-title">Opening Hours</h4>
            <ul className="footer-hours">
              <li>
                <span>Monday - Friday</span>
                <span>11:00 AM - 11:00 PM</span>
              </li>
              <li>
                <span>Saturday - Sunday</span>
                <span>10:00 AM - 12:00 AM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Hotel Everest Family Restaurant. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms-of-service">Terms of Service</Link>
            <span>•</span>
            <Link to="/refund-policy">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
