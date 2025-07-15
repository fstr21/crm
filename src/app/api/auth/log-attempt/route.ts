import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: any = null

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, attemptType, success, ip } = body

    // If Supabase is disabled, just return success without logging
    if (!supabaseAdmin) {
      console.log('Auth attempt (Supabase disabled):', { email, attemptType, success, ip })
      return NextResponse.json({ success: true })
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error } = await supabaseAdmin
      .from('auth_attempts')
      .insert([
        {
          ip_address: ip,
          email,
          attempt_type: attemptType,
          success,
          user_agent: userAgent,
          created_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Failed to log auth attempt:', error)
      return NextResponse.json({ error: 'Failed to log attempt' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth logging error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}