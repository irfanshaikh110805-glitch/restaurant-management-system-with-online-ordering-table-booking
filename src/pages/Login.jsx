import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import useSEO from '../hooks/useSEO'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  useSEO({
    title: 'Login',
    description: 'Log in to your Hotel Everest Family Restaurant account to manage your reservations and view your order history.',
    canonical: 'https://hoteleverestfamilyrestaurant.netlify.app/login'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic client-side validation
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data: _data, error } = await signIn({ email, password })

      if (error) {
        // Show more helpful error message
        if (error.includes('Invalid email or password')) {
          toast.error('Invalid email or password. Please check your credentials or create a new account.', {
            duration: 5000,
            style: {
              borderRadius: '10px',
              background: '#374151',
              color: '#F9FAFB',
            },
          })
        } else {
          toast.error(error, {
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#374151',
              color: '#F9FAFB',
            },
          })
        }
      } else {
        toast.success('Welcome back!', {
          style: {
            borderRadius: '10px',
            background: '#374151',
            color: '#F9FAFB',
          },
        })
        navigate('/')
      }
    } catch (err) {
      console.error('Login error:', err)
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
            <h1>Welcome Back</h1>
            <p className="text-secondary">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <span>Sign In</span>}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link-text">Sign up</Link></p>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="btn btn-secondary w-full"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
