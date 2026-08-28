import { Link, useLocation } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin, FiNavigation } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  const location = useLocation()

  // Do not show public footer inside admin dashboard routes
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="luxury-footer" role="contentinfo" aria-label="Site footer">
      <div className="luxury-container">
        <div className="footer-grid-4col">
          {/* Column 1: Brand & Philosophy */}
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-logo-brand" aria-label="Hotel Everest Home">
              <div className="footer-crest-svg">
                <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="22" r="20" stroke="#8C7A5B" strokeWidth="1.5" />
                  <path d="M15 15V29M15 22H24M24 15V29" stroke="#8C7A5B" strokeWidth="1.75" strokeLinecap="round" />
                  <path d="M28 15H35M28 22H33M28 29H35" stroke="#8C7A5B" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </div>
              <div className="footer-brand-names">
                <span className="footer-brand-title">HOTEL EVEREST</span>
                <span className="footer-brand-tagline">FINE DINING &bull; EST. 2003</span>
              </div>
            </Link>
            <p className="footer-philosophy">
              Centuries-old Indian gastronomy with stone-ground spices and exceptional hospitality.
            </p>
            <div className="footer-social-strip">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                <FiInstagram size={15} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
                <FiFacebook size={15} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Twitter">
                <FiTwitter size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links (2-col grid on mobile) */}
          <div className="footer-col footer-col-explore">
            <h4 className="footer-col-heading">EXPLORE</h4>
            <ul className="footer-nav-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Curated Menu</Link></li>
              <li><Link to="/booking">Table Booking</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/loyalty">VIP Club</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Hours */}
          <div className="footer-col footer-col-visit">
            <h4 className="footer-col-heading">VISIT &amp; HOURS</h4>
            <div className="footer-info-block">
              <div className="info-entry">
                <FiMapPin size={14} className="info-icon" />
                <span>MG Road, Vijayapura, Karnataka</span>
              </div>
              <div className="info-entry">
                <FiPhone size={14} className="info-icon" />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
              <div className="info-entry">
                <FiMail size={14} className="info-icon" />
                <a href="mailto:concierge@hoteleverest.com">concierge@hoteleverest.com</a>
              </div>
            </div>

            <div className="footer-hours-box">
              <span className="hours-label">HOURS OF SERVICE</span>
              <p>Mon &ndash; Sun: 11:00 AM &ndash; 11:30 PM</p>
              <a 
                href="https://maps.google.com/?q=MG+Road+Vijayapura" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-mobile-directions-link"
              >
                <FiNavigation size={12} /> Get Directions
              </a>
            </div>
          </div>

          {/* Column 4: Embedded Map Container Card (Hidden on mobile for sleek performance) */}
          <div className="footer-col footer-col-map">
            <h4 className="footer-col-heading">LOCATION</h4>
            <div className="footer-map-card">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=75.6900%2C16.8100%2C75.7300%2C16.8400&layer=mapnik&marker=16.8251,75.7100"
                width="100%"
                height="130"
                style={{ border: 0, borderRadius: '14px' }}
                loading="lazy"
                title="Restaurant Location Map"
              />
              <div className="map-card-footer">
                <span>MG Road, Vijayapura</span>
                <a 
                  href="https://maps.google.com/?q=MG+Road+Vijayapura" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-directions-link"
                >
                  <FiNavigation size={12} /> Directions
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Developer Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copy-text">
            <p>&copy; {new Date().getFullYear()} Hotel Everest. All rights reserved.</p>
            <p className="dev-credit">
              Crafted by <strong>Irfan Shaikh</strong> &bull; <a href="tel:+919964264412">📞 +91 99642 64412</a>
            </p>
          </div>
          <div className="footer-legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span className="bullet-sep">&bull;</span>
            <Link to="/terms-of-service">Terms of Service</Link>
            <span className="bullet-sep">&bull;</span>
            <Link to="/refund-policy">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
