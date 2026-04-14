import { Router } from 'express'
import { z } from 'zod'
import { AuthenticatedRequest, requireAuth } from '../../common/auth.js'
import { gameService } from './game.service.js'

const startSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
})

const sessionSchema = z.object({
  sessionId: z.string().uuid(),
})

export const gamesRouter = Router()

gamesRouter.post('/wordle/start', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = startSchema.parse(request.body ?? {})
    response.json(await gameService.startWordle(request.user!.sub, body.difficulty))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/wordle/guess', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = sessionSchema.extend({ guess: z.string().min(1) }).parse(request.body)
    response.json(await gameService.guessWordle(request.user!.sub, body.sessionId, body.guess))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/scramble/start', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = startSchema.parse(request.body ?? {})
    response.json(await gameService.startScramble(request.user!.sub, body.difficulty))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/scramble/submit', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = sessionSchema.extend({
      answer: z.string().optional(),
      requestHint: z.boolean().optional(),
    }).parse(request.body)
    response.json(await gameService.submitScramble(request.user!.sub, body.sessionId, body.answer, body.requestHint))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/spelling-bee/start', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = startSchema.parse(request.body ?? {})
    response.json(await gameService.startSpellingBee(request.user!.sub, body.difficulty))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/spelling-bee/submit', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = sessionSchema.extend({
      word: z.string().optional(),
      finalize: z.boolean().optional(),
    }).parse(request.body)
    response.json(await gameService.submitSpellingBee(request.user!.sub, body.sessionId, body.word, body.finalize))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/speed/start', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = startSchema.parse(request.body ?? {})
    response.json(await gameService.startSpeed(request.user!.sub, body.difficulty))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/speed/answer', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = sessionSchema.extend({
      answerIndex: z.number().int().min(0).max(3),
    }).parse(request.body)
    response.json(await gameService.answerSpeed(request.user!.sub, body.sessionId, body.answerIndex))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/quiz/start', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = startSchema.parse(request.body ?? {})
    response.json(await gameService.startQuiz(request.user!.sub, body.difficulty))
  } catch (error) {
    next(error)
  }
})

gamesRouter.post('/quiz/answer', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const body = sessionSchema.extend({
      answerIndex: z.number().int().min(0).max(3),
    }).parse(request.body)
    response.json(await gameService.answerQuiz(request.user!.sub, body.sessionId, body.answerIndex))
  } catch (error) {
    next(error)
  }
})
