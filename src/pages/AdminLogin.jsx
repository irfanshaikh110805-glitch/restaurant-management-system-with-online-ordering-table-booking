import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await signIn({ email, password })

    if (error) {
      toast.error(error)
      setLoading(false)
      return
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        toast.error('This account is not an admin')
        setLoading(false)
        return
      }

      toast.success('Welcome, admin!')
      navigate('/admin')
    } catch (err) {
      console.error('Admin login error:', err)
      toast.error('Failed to verify admin access')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <h1>Admin Login</h1>
            <p className="text-secondary">Sign in with an admin account</p>
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
                  placeholder="admin@email.com"
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
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20 }}></div>
              ) : (
                <span>Sign In as Admin</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
