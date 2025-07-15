import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, attemptType, success, ip } = body

    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error } = await supabase
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