import { Router } from 'express'
import { requireAuth, type AuthenticatedRequest } from '../../common/auth.js'
import { pool } from '../../db/client.js'
import { gameService } from '../games/game.service.js'

export const userRouter = Router()

userRouter.get('/profile', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, is_guest, xp, streak, level, created_at FROM users WHERE id = $1 LIMIT 1', [request.user!.sub])
    if (!rows.length) {
      response.status(404).json({ message: 'User not found' })
      return
    }
    const row = rows[0]
    response.json({ id: row.id, username: row.username, email: row.email, isGuest: row.is_guest, xp: row.xp, streak: row.streak, level: row.level, createdAt: row.created_at })
  } catch (error) {
    next(error)
  }
})

userRouter.get('/stats', requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const [userResult, overviewResult, favoriteResult, recentResults, breakdown] = await Promise.all([
      pool.query('SELECT xp, streak, level FROM users WHERE id = $1 LIMIT 1', [request.user!.sub]),
      pool.query(
        `SELECT COUNT(*)::int AS total_games_played, COUNT(*) FILTER (WHERE won)::int AS total_wins,
                COALESCE(AVG(score), 0)::float AS average_score,
                COALESCE(MAX((metadata->>'streakAfterGame')::int), 0)::int AS best_streak
         FROM game_results WHERE user_id = $1`,
        [request.user!.sub]
      ),
      pool.query('SELECT game_slug FROM game_results WHERE user_id = $1 GROUP BY game_slug ORDER BY COUNT(*) DESC LIMIT 1', [request.user!.sub]),
      gameService.getRecentResults(request.user!.sub),
      gameService.getBreakdown(request.user!.sub),
    ])

    if (!userResult.rows.length) {
      response.status(404).json({ message: 'User not found' })
      return
    }

    const user = userResult.rows[0]
    const overview = overviewResult.rows[0]
    response.json({
      totalGamesPlayed: overview.total_games_played ?? 0,
      totalWins: overview.total_wins ?? 0,
      averageScore: Math.round(Number(overview.average_score ?? 0)),
      currentStreak: user.streak,
      bestStreak: overview.best_streak ?? user.streak,
      totalXp: user.xp,
      level: user.level,
      favoriteGame: favoriteResult.rows[0]?.game_slug ?? null,
      recentResults,
      byGame: breakdown,
    })
  } catch (error) {
    next(error)
  }
})
