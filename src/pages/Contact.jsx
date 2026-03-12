import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi'
import './Home.css'

export default function Contact() {
  return (
    <div className="contact-page">
      <section className="section">
        <div className="container">
          <h1 className="section-title">Contact & Location</h1>
          <p className="text-secondary">
            We are located in the heart of Vijayapura on MG Road. Reach out to us for reservations,
            private events, or any special requests.
          </p>

          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <FiMapPin size={24} />
                </div>
                <div>
                  <h4>Address</h4>
                  <p>Hotel Everest Family Restaurant, MG Road, Vijayapura, Karnataka 586101, India</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <FiPhone size={24} />
                </div>
                <div>
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <FiMail size={24} />
                </div>
                <div>
                  <h4>Email</h4>
                  <p>hello@hoteleverestfamilyrestaurant.com</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <FiClock size={24} />
                </div>
                <div>
                  <h4>Opening Hours</h4>
                  <p>Monday – Friday: 11:00 AM – 11:00 PM</p>
                  <p>Saturday – Sunday: 10:00 AM – 12:00 AM</p>
                </div>
              </div>
            </div>

            <div className="map-container">
              <iframe
                src="https://www.google.com/maps?q=16.8251,75.7100&z=16&output=embed"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Everest Family Restaurant Location on Google Maps"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
