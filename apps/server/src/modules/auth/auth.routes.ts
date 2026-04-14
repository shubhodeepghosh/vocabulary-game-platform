import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import {
  comparePassword,
  clearAuthCookie,
  hashPassword,
  requireAuth,
  setAuthCookie,
  signAuthToken,
  type AuthenticatedRequest,
} from '../../common/auth.js'
import { pool } from '../../db/client.js'

const signupSchema = z.object({
  username: z.string().min(3).max(24),
  email: z.string().email(),
  password: z.string().min(8).max(72),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
})

function mapUser(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    username: String(row.username),
    email: String(row.email),
    isGuest: Boolean(row.is_guest),
    xp: Number(row.xp),
    streak: Number(row.streak),
    level: Number(row.level),
    createdAt: String(row.created_at),
  }
}

export const authRouter = Router()

async function createGuestUser() {
  const suffix = randomUUID().slice(0, 8)
  const username = `Guest-${suffix}`
  const email = `guest-${suffix}@guest.local`
  const passwordHash = await hashPassword(randomUUID())
  const { rows } = await pool.query(
    'INSERT INTO users (username, email, password_hash, is_guest) VALUES ($1, $2, $3, TRUE) RETURNING id, username, email, is_guest, xp, streak, level, created_at',
    [username, email, passwordHash]
  )

  return mapUser(rows[0])
}

authRouter.post('/signup', async (request, response, next) => {
  try {
    const body = signupSchema.parse(request.body)
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1', [body.email.toLowerCase(), body.username.toLowerCase()])
    if (existing.rows.length > 0) {
      response.status(409).json({ message: 'Email or username already exists' })
      return
    }
    const passwordHash = await hashPassword(body.password)
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, is_guest, xp, streak, level, created_at',
      [body.username, body.email.toLowerCase(), passwordHash]
    )
    const user = mapUser(rows[0])
    setAuthCookie(response, signAuthToken({ sub: user.id, email: user.email, username: user.username }))
    response.status(201).json({ user, tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/guest', async (_request, response, next) => {
  try {
    const user = await createGuestUser()
    setAuthCookie(
      response,
      signAuthToken({ sub: user.id, email: user.email, username: user.username })
    )
    response.status(201).json({
      user,
      tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (request, response, next) => {
  try {
    const body = loginSchema.parse(request.body)
    const { rows } = await pool.query(
      'SELECT id, username, email, is_guest, xp, streak, level, created_at, password_hash FROM users WHERE email = $1 LIMIT 1',
      [body.email.toLowerCase()]
    )
    if (!rows.length || !(await comparePassword(body.password, rows[0].password_hash))) {
      response.status(401).json({ message: 'Invalid email or password' })
      return
    }
    const user = mapUser(rows[0])
    setAuthCookie(response, signAuthToken({ sub: user.id, email: user.email, username: user.username }))
    response.json({ user, tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/logout', (_request, response) => {
  clearAuthCookie(response)
  response.status(204).send()
})

authRouter.get('/me', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, is_guest, xp, streak, level, created_at FROM users WHERE id = $1 LIMIT 1', [request.user!.sub])
    if (!rows.length) {
      response.status(404).json({ message: 'User not found' })
      return
    }
    response.json({ user: mapUser(rows[0]) })
  } catch (error) {
    next(error)
  }
})
