import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import useSEO from '../hooks/useSEO'
import './Auth.css'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useSEO({
    title: 'Sign Up',
    description: 'Create an account at Hotel Everest Family Restaurant to book tables, order online, and manage your preferences.',
    canonical: 'https://hoteleverestfamilyrestaurant.netlify.app/register'
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data: _data, error } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone
      })

      if (error) {
        toast.error(error, {
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#374151',
            color: '#F9FAFB',
          },
        })
      } else {
        toast.success('Account created! Please check your email to verify.', {
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#374151',
            color: '#F9FAFB',
          },
        })
        navigate('/login')
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p className="text-secondary">Join us and start ordering</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <span>Create Account</span>}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link-text">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
