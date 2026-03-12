import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http')
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20

if (!isValidUrl || !isValidKey) {
  console.warn('⚠️ Supabase credentials not configured!')
  console.warn('📝 To fix: Update your .env file with real Supabase credentials')
  console.warn('📖 See SETUP.md for step-by-step instructions')
}

// Use dummy values if not configured to prevent errors
export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co',
  isValidKey ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'
)
