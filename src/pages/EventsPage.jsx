import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FiCalendar, FiUsers, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Events.css';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showCateringForm, setShowCateringForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Catering form state
  const [cateringData, setCateringData] = useState({
    event_type: '',
    guest_count: '',
    event_date: '',
    event_time: '',
    venue_address: '',
    contact_phone: '',
    budget_range: '',
    special_requests: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCateringSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit catering request');
      return;
    }

    try {
      const { error } = await supabase
        .from('catering_requests')
        .insert({
          user_id: user.id,
          ...cateringData,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Catering request submitted! We\'ll contact you soon.');
      setShowCateringForm(false);
      setCateringData({
        event_type: '',
        guest_count: '',
        event_date: '',
        event_time: '',
        venue_address: '',
        contact_phone: '',
        budget_range: '',
        special_requests: ''
      });
    } catch (error) {
      console.error('Error submitting catering request:', error);
      toast.error('Failed to submit request');
    }
  };

  const handleInputChange = (e) => {
    setCateringData({
      ...cateringData,
      [e.target.name]: e.target.value
    });
  };

  const handleEventRegister = async (event) => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: user.id
        });
      if (error) {
        if (error.code === '23505') {
          toast.error('You are already registered for this event');
        } else {
          throw error;
        }
      } else {
        toast.success(`Registered for "${event.title}"! 🎉`);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register. Please try again.');
    }
  };

  const eventTypes = [
    'Wedding', 'Birthday Party', 'Corporate Event', 
    'Festival Celebration', 'Anniversary', 'Other'
  ];

  const budgetRanges = [
    '₹10,000 - ₹25,000',
    '₹25,000 - ₹50,000',
    '₹50,000 - ₹1,00,000',
    '₹1,00,000+'
  ];

  return (
    <div className="events-page">
      <div className="container">
        <div className="events-header">
          <h1><FiCalendar /> Events & Catering</h1>
          <p>Make your special occasions memorable with us</p>
        </div>

        {/* Catering CTA */}
        <div className="catering-cta">
          <div className="cta-content">
            <h2>🎉 Planning an Event?</h2>
            <p>Let us take care of the food while you enjoy your special day!</p>
            <ul className="cta-features">
              <li>✓ Custom menu planning</li>
              <li>✓ Professional service staff</li>
              <li>✓ Flexible packages</li>
              <li>✓ On-site cooking available</li>
            </ul>
          </div>
          <button 
            onClick={() => setShowCateringForm(!showCateringForm)}
            className="btn-primary btn-lg"
          >
            Request Catering Service
          </button>
        </div>

        {/* Catering Request Form */}
        {showCateringForm && (
          <div className="catering-form-card">
            <h3>Catering Request Form</h3>
            <form onSubmit={handleCateringSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select
                    name="event_type"
                    value={cateringData.event_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Guests *</label>
                  <input
                    type="number"
                    name="guest_count"
                    value={cateringData.guest_count}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    min="10"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    name="event_date"
                    value={cateringData.event_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Event Time *</label>
                  <input
                    type="time"
                    name="event_time"
                    value={cateringData.event_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Venue Address *</label>
                <textarea
                  name="venue_address"
                  value={cateringData.venue_address}
                  onChange={handleInputChange}
                  placeholder="Full venue address"
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={cateringData.contact_phone}
                    onChange={handleInputChange}
                    placeholder="Your contact number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Budget Range *</label>
                  <select
                    name="budget_range"
                    value={cateringData.budget_range}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Special Requests</label>
                <textarea
                  name="special_requests"
                  value={cateringData.special_requests}
                  onChange={handleInputChange}
                  placeholder="Dietary restrictions, special menu items, decoration preferences, etc."
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCateringForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Events */}
        <section className="events-section">
          <h2>Upcoming Events at Our Restaurant</h2>
          
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <FiCalendar className="empty-icon" />
              <h3>No upcoming events</h3>
              <p>Check back soon for exciting events and celebrations!</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  {event.image_url && (
                    <div className="event-image">
                      <img src={event.image_url} alt={event.title} />
                      <div className="event-date-badge">
                        <div className="badge-day">
                          {new Date(event.event_date).getDate()}
                        </div>
                        <div className="badge-month">
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>

                    <div className="event-details">
                      <div className="event-detail">
                        <FiCalendar />
                        <span>
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {event.event_time && (
                        <div className="event-detail">
                          <FiClock />
                          <span>{event.event_time}</span>
                        </div>
                      )}

                      {event.max_participants && (
                        <div className="event-detail">
                          <FiUsers />
                          <span>
                            {event.current_participants || 0} / {event.max_participants} participants
                          </span>
                        </div>
                      )}

                      {event.location && (
                        <div className="event-detail">
                          <FiMapPin />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.registration_required && (
                      <button
                        className="btn-primary btn-block"
                        onClick={() => handleEventRegister(event)}
                      >
                        Register for Event
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Why Choose Us */}
        <section className="why-choose-us">
          <h2>Why Choose Our Catering Service?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h4>Expert Chefs</h4>
              <p>20+ years of experience in Indian & International cuisine</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h4>Quality Ingredients</h4>
              <p>Fresh, locally-sourced ingredients for authentic flavors</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h4>Professional Service</h4>
              <p>Trained staff ensuring smooth event execution</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h4>Flexible Packages</h4>
              <p>Customizable menus to fit any budget</p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <div className="contact-info-card">
          <h3>Have Questions?</h3>
          <p>Our event planning team is here to help!</p>
          <div className="contact-methods">
            <a href="tel:+919876543210" className="contact-method">
              <FiPhone />
              <span>+91 98765 43210</span>
            </a>
            <a href="mailto:events@restaurant.com" className="contact-method">
              <FiMail />
              <span>events@restaurant.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
