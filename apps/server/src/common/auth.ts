import type { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

const AUTH_COOKIE = 'keen_access_token'

export interface JwtPayload {
  sub: string
  email: string
  username: string
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  })
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

export function setAuthCookie(response: Response, token: string) {
  response.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearAuthCookie(response: Response) {
  response.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  const bearer = request.headers.authorization?.replace('Bearer ', '')
  const token = request.cookies[AUTH_COOKIE] ?? bearer

  if (!token) {
    response.status(401).json({ message: 'Authentication required' })
    return
  }

  try {
    request.user = verifyAuthToken(token)
    next()
  } catch {
    response.status(401).json({ message: 'Invalid or expired session' })
  }
}
