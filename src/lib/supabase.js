import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://eckxlrgbevxenqwlnuog.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja3hscmdiZXZ4ZW5xd2xudW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzODg3NDQsImV4cCI6MjEwNTk2NDc0NH0.HioJVFvuGosPHb808NWN1q7FsuM0vJTH4vi6d8B-uDA'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use active credentials if env variables are missing, placeholders, or pointing to the decommissioned project
const isOldOrInvalidUrl = !envUrl || !envUrl.startsWith('http') || envUrl.includes('ppdutkrpuniqeqxftbpv') || envUrl.includes('placeholder')
const isOldOrInvalidKey = !envKey || envKey.length < 20 || envKey.includes('ppdutkrpuniqeqxftbpv') || envKey.includes('placeholder')

const supabaseUrl = isOldOrInvalidUrl ? DEFAULT_SUPABASE_URL : envUrl
const supabaseAnonKey = isOldOrInvalidKey ? DEFAULT_SUPABASE_ANON_KEY : envKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

