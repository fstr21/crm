import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') 
      || request.headers.get('x-real-ip') 
      || '127.0.0.1'
    
    const rateLimitKey = `${action}_attempts:${clientIP}`
    
    // Different rate limits for different actions
    const limits = {
      login: { maxAttempts: 5, windowSeconds: 900 }, // 5 attempts per 15 minutes
      signup: { maxAttempts: 3, windowSeconds: 3600 }, // 3 attempts per hour
      password_reset: { maxAttempts: 3, windowSeconds: 3600 }
    }
    
    const limit = limits[action as keyof typeof limits] || limits.login
    const rateLimit = await checkRateLimit(rateLimitKey, limit.maxAttempts, limit.windowSeconds)
    
    return NextResponse.json(rateLimit)
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Return allowed on error to prevent blocking users
    return NextResponse.json({ 
      allowed: true, 
      remaining: 5, 
      resetTime: Date.now() + 900000 
    })
  }
}