import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import rateLimiter from '../utils/rateLimiter'
import { sanitizeEmail, sanitizeString, sanitizePhone } from '../utils/inputSanitizer'
import { SECURITY_ERROR_MESSAGES } from '../utils/securityConfig'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    setLoading(true)
    await fetchProfile(user.id)
  }

  const signUp = async ({ email, password, fullName, phone }) => {
    try {
      // Rate limiting check
      const rateLimitResult = rateLimiter.checkLimit('auth:register', null);
      if (!rateLimitResult.allowed) {
        return { 
          data: null, 
          error: rateLimitResult.reason || SECURITY_ERROR_MESSAGES.RATE_LIMIT 
        };
      }

      // Input sanitization
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedFullName = sanitizeString(fullName, { maxLength: 100 });
      const sanitizedPhone = sanitizePhone(phone);

      if (!sanitizedEmail) {
        return { data: null, error: 'Invalid email address' };
      }
      if (!sanitizedFullName || sanitizedFullName.length < 2) {
        return { data: null, error: 'Full name must be at least 2 characters' };
      }
      if (!sanitizedPhone) {
        return { data: null, error: 'Invalid phone number' };
      }
      if (password.length < 8) {
        return { data: null, error: 'Password must be at least 8 characters' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedFullName,
            phone: sanitizedPhone
          }
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }

  const signIn = async ({ email, password }) => {
    try {
      // Rate limiting check
      const rateLimitResult = rateLimiter.checkLimit('auth:login', null);
      if (!rateLimitResult.allowed) {
        return { 
          data: null, 
          error: rateLimitResult.reason || SECURITY_ERROR_MESSAGES.RATE_LIMIT 
        };
      }

      // Input sanitization
      const sanitizedEmail = sanitizeEmail(email);
      if (!sanitizedEmail) {
        return { data: null, error: 'Invalid email address' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }

  const isAdmin = profile?.role === 'admin'

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    signUp,
    signIn,
    signOut,
    isAdmin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
