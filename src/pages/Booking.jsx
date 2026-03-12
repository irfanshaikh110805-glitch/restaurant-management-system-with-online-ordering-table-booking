import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCalendar, FiClock, FiUsers, FiMessageSquare, FiCheckCircle, FiAlertCircle, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import { createBooking } from '../utils/backendHelpers'
import { sanitizeString, sanitizeEmail, sanitizePhone } from '../utils/inputSanitizer'
import { useAuth } from '../context/AuthContext'
import { pageTransition, fadeInUp, staggerContainer } from '../utils/animations'
import './Booking.css'

const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
]

const OCCASIONS = [
  { value: '', label: 'Regular Dining' },
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'anniversary', label: '💑 Anniversary' },
  { value: 'business', label: '💼 Business Meeting' },
  { value: 'date', label: '❤️ Romantic Date' },
  { value: 'family', label: '👨‍👩‍👧‍👦 Family Gathering' },
  { value: 'other', label: '🎉 Other Celebration' }
]

const TABLE_PREFERENCES = [
  { value: '', label: 'No Preference' },
  { value: 'window', label: '🪟 Window Seat' },
  { value: 'outdoor', label: '🌳 Outdoor/Patio' },
  { value: 'quiet', label: '🤫 Quiet Corner' },
  { value: 'booth', label: '🛋️ Booth' }
]

export default function Booking() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [guests, setGuests] = useState(2)
  const [specialRequests, setSpecialRequests] = useState('')
  const [occasionType, setOccasionType] = useState('')
  const [tablePreference, setTablePreference] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availableSlots, setAvailableSlots] = useState(TIME_SLOTS)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || '')
    }
  }, [user])

  const minDate = format(new Date(), 'yyyy-MM-dd')
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd')

  const handleDateChange = async (date) => {
    setSelectedDate(date)
    setSelectedTime('')
    setCheckingAvailability(true)

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_time')
        .eq('booking_date', date)
        .neq('status', 'cancelled')

      if (error) throw error

      if (data) {
        const bookedTimes = data.map(b => b.booking_time.substring(0, 5))
        setAvailableSlots(TIME_SLOTS.filter(slot => !bookedTimes.includes(slot)))
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Failed to check availability')
      setAvailableSlots(TIME_SLOTS)
    } finally {
      setCheckingAvailability(false)
    }
  }

  const validateStep1 = () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return false
    }
    if (!selectedTime) {
      toast.error('Please select a time slot')
      return false
    }
    if (!guests || guests < 1) {
      toast.error('Please select number of guests')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name')
      return false
    }
    if (!customerPhone.trim()) {
      toast.error('Please enter your phone number')
      return false
    }
    if (!/^\d{10}$/.test(customerPhone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number')
      return false
    }
    if (!customerEmail.trim()) {
      toast.error('Please enter your email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    if (!user) {
      toast.error('Please login to create a booking')
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      // Sanitize all inputs
      const sanitizedName = sanitizeString(customerName, { maxLength: 100 });
      const sanitizedPhone = sanitizePhone(customerPhone);
      const sanitizedEmail = sanitizeEmail(customerEmail);
      const sanitizedRequests = sanitizeString(specialRequests, { maxLength: 1000 });

      if (!sanitizedName || sanitizedName.length < 2) {
        toast.error('Please enter a valid name');
        setLoading(false);
        return;
      }

      if (!sanitizedPhone) {
        toast.error('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      if (!sanitizedEmail) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const result = await createBooking({
        userId: user.id,
        date: selectedDate,
        time: selectedTime,
        guests,
        specialRequests: sanitizedRequests,
        occasionType: occasionType || null,
        tablePreference: tablePreference || null,
        customerName: sanitizedName,
        customerPhone: sanitizedPhone,
        customerEmail: sanitizedEmail
      }, user.id)

      if (result.success) {
        toast.success('Booking confirmed! Check your email for details.', {
          icon: '🎉',
          duration: 5000
        })
        setTimeout(() => navigate('/profile'), 2000)
      } else if (result.error === 'Slot unavailable') {
        setAvailableSlots(prev => prev.filter(slot => slot !== selectedTime))
        setStep(1)
        toast.error('This time slot is no longer available. Please select another.')
      } else if (result.error?.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error(result.error.message)
      } else {
        toast.error('Failed to create booking. Please try again.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error(error.message)
      } else if (error.code === 'VALIDATION_FAILED') {
        toast.error('Please check your booking details')
      } else {
        toast.error('Failed to create booking')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      className="booking-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="container">
        <motion.div 
          className="booking-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Reserve a Table</h1>
          <p className="text-secondary">Book your spot for an unforgettable dining experience</p>
          
          {/* Progress Steps */}
          <div className="booking-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">
                {step > 1 ? <FiCheckCircle /> : '1'}
              </div>
              <span>Date & Time</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Your Details</span>
            </div>
          </div>
        </motion.div>

        <div className="booking-container">
          <motion.form 
            onSubmit={handleSubmit} 
            className="booking-form card"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="form-section-title">
                    <FiCalendar /> Select Date & Time
                  </h3>

                  <div className="form-row">
                    <motion.div className="form-group" variants={fadeInUp}>
                      <label className="form-label">
                        <FiCalendar /> Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={minDate}
                        max={maxDate}
                      />
                    </motion.div>

                    <motion.div className="form-group" variants={fadeInUp}>
                      <label className="form-label">
                        <FiUsers /> Number of Guests
                      </label>
                      <select
                        className="form-control"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      >
                        {[...Array(20)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  </div>

                  {selectedDate && (
                    <motion.div 
                      className="form-group"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="form-label">
                        <FiClock /> Select Time Slot
                      </label>
                      {checkingAvailability ? (
                        <div className="checking-availability">
                          <div className="spinner"></div>
                          <span>Checking availability...</span>
                        </div>
                      ) : (
                        <>
                          <div className="time-slots">
                            {availableSlots.map((slot, index) => (
                              <motion.button
                                key={slot}
                                type="button"
                                className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                                onClick={() => setSelectedTime(slot)}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {slot}
                              </motion.button>
                            ))}
                          </div>
                          {availableSlots.length === 0 && (
                            <motion.div 
                              className="no-slots-message"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <FiAlertCircle />
                              <span>No slots available for this date. Please select another date.</span>
                            </motion.div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}

                  <motion.div className="form-group" variants={fadeInUp}>
                    <label className="form-label">Occasion (Optional)</label>
                    <select
                      className="form-control"
                      value={occasionType}
                      onChange={(e) => setOccasionType(e.target.value)}
                    >
                      {OCCASIONS.map(occasion => (
                        <option key={occasion.value} value={occasion.value}>
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div className="form-group" variants={fadeInUp}>
                    <label className="form-label">Table Preference (Optional)</label>
                    <select
                      className="form-control"
                      value={tablePreference}
                      onChange={(e) => setTablePreference(e.target.value)}
                    >
                      {TABLE_PREFERENCES.map(pref => (
                        <option key={pref.value} value={pref.value}>
                          {pref.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.button
                    type="button"
                    className="btn btn-primary w-full"
                    onClick={handleNextStep}
                    disabled={!selectedDate || !selectedTime || availableSlots.length === 0}
                    whileHover={!selectedDate || !selectedTime || availableSlots.length === 0 ? {} : { scale: 1.02 }}
                    whileTap={!selectedDate || !selectedTime || availableSlots.length === 0 ? {} : { scale: 0.98 }}
                  >
                    Continue to Details →
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="form-section-title">
                    <FiMessageSquare /> Your Contact Details
                  </h3>

                  {/* Booking Summary */}
                  <motion.div 
                    className="booking-summary"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="summary-item">
                      <FiCalendar />
                      <span>{format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="summary-item">
                      <FiClock />
                      <span>{selectedTime}</span>
                    </div>
                    <div className="summary-item">
                      <FiUsers />
                      <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                    </div>
                  </motion.div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiUsers /> Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiPhone /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiMail /> Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiMessageSquare /> Special Requests (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Dietary requirements, allergies, special arrangements..."
                      rows="3"
                    />
                  </div>

                  <div className="form-actions">
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handlePrevStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>
                          <div className="spinner" style={{ width: 20, height: 20 }}></div>
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <FiCheckCircle />
                          <span>Confirm Booking</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          <motion.div 
            className="booking-sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="booking-info card">
              <h3>📋 Booking Information</h3>
              <ul>
                <li>
                  <FiCheckCircle className="info-icon" />
                  <span>Reservations up to 30 days in advance</span>
                </li>
                <li>
                  <FiClock className="info-icon" />
                  <span>30-minute time slots available</span>
                </li>
                <li>
                  <FiUsers className="info-icon" />
                  <span>Maximum 20 guests per booking</span>
                </li>
                <li>
                  <FiMail className="info-icon" />
                  <span>Email confirmation sent instantly</span>
                </li>
                <li>
                  <FiMapPin className="info-icon" />
                  <span>View bookings in your Profile</span>
                </li>
              </ul>
            </div>

            <motion.div 
              className="contact-card card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3>📞 Need Help?</h3>
              <p className="text-secondary">Contact us for special arrangements or large groups</p>
              <div className="contact-info">
                <div className="contact-item">
                  <FiPhone />
                  <span>+91 1234567890</span>
                </div>
                <div className="contact-item">
                  <FiMail />
                  <span>reservations@restaurant.com</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
