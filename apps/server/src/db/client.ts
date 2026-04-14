import { Pool } from 'pg'
import { createClient } from 'redis'
import { env } from '../config/env.js'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const redis = createClient({
  url: env.REDIS_URL,
})

let redisReady = false

export async function ensureRedis() {
  if (!redisReady) {
    try {
      await redis.connect()
      redisReady = true
    } catch (error) {
      console.warn('Redis unavailable, continuing without cache', error)
    }
  }

  return redisReady
}
