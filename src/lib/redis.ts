import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect()
  }
  return redis
}

export async function checkRateLimit(
  key: string, 
  maxAttempts: number = 5, 
  windowSeconds: number = 900
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const client = await connectRedis()
    const current = await client.incr(key)
    
    if (current === 1) {
      await client.expire(key, windowSeconds)
    }
    
    const ttl = await client.ttl(key)
    const resetTime = Date.now() + (ttl * 1000)
    
    return {
      allowed: current <= maxAttempts,
      remaining: Math.max(0, maxAttempts - current),
      resetTime
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return { allowed: true, remaining: maxAttempts, resetTime: Date.now() }
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    const client = await connectRedis()
    await client.del(key)
  } catch (error) {
    console.error('Rate limit reset failed:', error)
  }
}

export { redis }