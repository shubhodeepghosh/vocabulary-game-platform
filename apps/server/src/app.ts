import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { ZodError } from 'zod'
import { AppError } from './common/errors.js'
import { env } from './config/env.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { userRouter } from './modules/user/user.routes.js'
import { gamesRouter } from './modules/games/games.routes.js'
import { leaderboardRouter } from './modules/leaderboard/leaderboard.routes.js'

export const app = express()

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/games', gamesRouter)
app.use('/leaderboard', leaderboardRouter)

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  if (error instanceof ZodError) {
    response.status(400).json({
      message: error.issues[0]?.message ?? 'Invalid request payload',
    })
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
    })
    return
  }

  response.status(500).json({
    message: error.message || 'Something went wrong',
  })
})
