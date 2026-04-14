import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/auth.js'
import { gameService } from '../games/game.service.js'

export const leaderboardRouter = Router()

leaderboardRouter.get('/global', requireAuth, async (_request, response, next) => {
  try {
    response.json({ entries: await gameService.getGlobalLeaderboard() })
  } catch (error) {
    next(error)
  }
})

leaderboardRouter.get('/friends', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    response.json({ entries: await gameService.getFriendsLeaderboard(request.user!.sub) })
  } catch (error) {
    next(error)
  }
})
