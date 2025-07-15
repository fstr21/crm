import { createClient } from '@supabase/supabase-js'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock user and session for development
const mockUser: User = {
  id: 'mock-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'user@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser
}

// Create a mock client when Supabase is disabled
let supabase: any

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  })
} else {
  // Mock Supabase client when disabled - provides a logged-in user by default
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
      signUp: () => Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: mockUser, session: mockSession }, error: null }),
      signInWithOAuth: () => Promise.resolve({ data: { url: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
        // Immediately call with signed in state
        setTimeout(() => callback('SIGNED_IN', mockSession), 0)
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  }
}

export { supabase }
export type { User, Session } from '@supabase/supabase-js'