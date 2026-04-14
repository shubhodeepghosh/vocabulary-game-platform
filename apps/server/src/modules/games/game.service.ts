import {
  Difficulty,
  GameResultSummary,
  GameType,
  LeaderboardEntry,
  QuizAnswerResponse,
  QuizQuestion,
  QuizStartResponse,
  ScrambleStartResponse,
  ScrambleSubmitResponse,
  SpeedAnswerResponse,
  SpeedQuestion,
  SpeedStartResponse,
  SpellingBeeStartResponse,
  SpellingBeeSubmitResponse,
  WordleGuessResponse,
  WordleStartResponse,
} from '@keen/types'
import { PoolClient } from 'pg'
import { AppError } from '../../common/errors.js'
import { ensureRedis, pool, redis } from '../../db/client.js'
import { spellingBeePuzzles } from '../../data/vocabulary.js'
import { automationService } from './automation.service.js'
import {
  buildScrambleHint,
  calculateLevel,
  calculateSpellingBeeScore,
  calculateXp,
  evaluateWordleGuess,
  getDifficultyForRound,
  getScrambleLengthRange,
  getScrambleTimeLimit,
  getSpeedTimeLimit,
  getWordleLength,
  isSameDay,
  isYesterday,
  normalizeDifficulty,
  scrambleWord,
  shuffle,
} from './engines.js'

type SessionRow = {
  id: string
  difficulty: Difficulty
  state: Record<string, unknown>
}

type WordRow = {
  id: number
  word: string
  definition: string
  example_sentence: string
  difficulty: Difficulty
}

type ChoiceQuestion = {
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
  difficulty: Difficulty
  timeLimitSeconds?: number
  answerWord?: string
}

const GAME_TYPES: GameType[] = ['wordle', 'scramble', 'spelling-bee', 'speed', 'quiz']

async function withTransaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const value = await work(client)
    await client.query('COMMIT')
    return value
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export class GameService {
  async startWordle(userId: string, requestedDifficulty?: string): Promise<WordleStartResponse> {
    const difficulty = normalizeDifficulty(requestedDifficulty)
    const wordLength = getWordleLength(difficulty)
    const excludeWords = await this.getRecentlyUsedWords()
    const candidates = await this.getCandidateWords({
      difficulty,
      length: wordLength,
      limit: 40,
      excludeWords,
    })
    const word = await automationService.chooseWordForGame(
      'wordle',
      difficulty,
      candidates,
      this.getDateKey(),
      excludeWords
    )
    const sessionId = await this.createSession(userId, 'wordle', difficulty, {
      answer: word.word.toUpperCase(),
      clue: word.definition,
      attempts: [],
      maxAttempts: 6,
    })
    return { sessionId, wordLength, maxAttempts: 6, difficulty, clue: word.definition }
  }

  async guessWordle(userId: string, sessionId: string, guess: string): Promise<WordleGuessResponse> {
    const session = await this.getActiveSession(userId, sessionId, 'wordle')
    const answer = String(session.state.answer)
    const attempts = Array.isArray(session.state.attempts) ? [...(session.state.attempts as string[])] : []
    const normalizedGuess = guess.trim().toUpperCase()
    if (normalizedGuess.length !== answer.length) {
      throw new AppError(400, `Guess must be ${answer.length} letters`)
    }
    if (!(await this.wordExists(normalizedGuess))) {
      throw new AppError(400, 'Guess must be a valid vocabulary word')
    }
    attempts.push(normalizedGuess)
    const maxAttempts = Number(session.state.maxAttempts ?? 6)
    const evaluation = evaluateWordleGuess(normalizedGuess, answer)
    const won = normalizedGuess === answer
    const lost = !won && attempts.length >= maxAttempts
    const score = won ? Math.max(40, 120 - (attempts.length - 1) * 15) : 0
    await pool.query('UPDATE game_sessions SET state = $1 WHERE id = $2', [{ ...session.state, attempts }, sessionId])
    if (won || lost) await this.completeSession({ sessionId, userId, gameType: 'wordle', difficulty: session.difficulty, score, won, metadata: { attempts, answer } })
    return { sessionId, attemptsUsed: attempts.length, maxAttempts, status: won ? 'won' : lost ? 'lost' : 'active', score, evaluation, answer: won || lost ? answer : undefined }
  }

  async startScramble(userId: string, requestedDifficulty?: string): Promise<ScrambleStartResponse> {
    const difficulty = normalizeDifficulty(requestedDifficulty)
    const [minLength, maxLength] = getScrambleLengthRange(difficulty)
    const excludeWords = await this.getRecentlyUsedWords()
    const candidates = await this.getCandidateWords({
      difficulty,
      minLength,
      maxLength,
      limit: 40,
      excludeWords,
    })
    const word = await automationService.chooseWordForGame(
      'scramble',
      difficulty,
      candidates,
      this.getDateKey(),
      excludeWords
    )
    const timeLimitSeconds = getScrambleTimeLimit(difficulty)
    const scrambledWord = scrambleWord(word.word)
    const sessionId = await this.createSession(userId, 'scramble', difficulty, {
      answer: word.word.toUpperCase(),
      definition: word.definition,
      scrambledWord,
      startedAt: new Date().toISOString(),
      timeLimitSeconds,
      hintsUsed: 0,
      maxHints: 2,
    })
    return { sessionId, scrambledWord, difficulty, timeLimitSeconds, hint: word.definition, maxHints: 2 }
  }

  async submitScramble(userId: string, sessionId: string, answer?: string, requestHint?: boolean): Promise<ScrambleSubmitResponse> {
    const session = await this.getActiveSession(userId, sessionId, 'scramble')
    const startedAt = new Date(String(session.state.startedAt))
    const timeLimitSeconds = Number(session.state.timeLimitSeconds)
    const elapsedSeconds = (Date.now() - startedAt.getTime()) / 1000
    const correctWord = String(session.state.answer)
    const hintsUsed = Number(session.state.hintsUsed ?? 0)
    const maxHints = Number(session.state.maxHints ?? 2)
    if (elapsedSeconds > timeLimitSeconds) {
      await this.completeSession({ sessionId, userId, gameType: 'scramble', difficulty: session.difficulty, score: 0, won: false, metadata: { correctWord, timedOut: true } })
      return { sessionId, status: 'lost', score: 0, hintsRemaining: Math.max(0, maxHints - hintsUsed), correctWord }
    }
    if (requestHint) {
      const nextHintsUsed = Math.min(maxHints, hintsUsed + 1)
      await pool.query('UPDATE game_sessions SET state = $1 WHERE id = $2', [{ ...session.state, hintsUsed: nextHintsUsed }, sessionId])
      return { sessionId, status: 'active', score: 0, hint: buildScrambleHint(correctWord, String(session.state.definition), nextHintsUsed), hintsRemaining: Math.max(0, maxHints - nextHintsUsed) }
    }
    const normalizedAnswer = answer?.trim().toUpperCase()
    if (!normalizedAnswer) throw new AppError(400, 'Answer is required')
    if (normalizedAnswer !== correctWord) return { sessionId, status: 'active', score: 0, hintsRemaining: Math.max(0, maxHints - hintsUsed) }
    const score = Math.max(25, Math.round(110 - elapsedSeconds * 2 - hintsUsed * 12 + (session.difficulty === 'hard' ? 15 : 0)))
    await this.completeSession({ sessionId, userId, gameType: 'scramble', difficulty: session.difficulty, score, won: true, metadata: { correctWord, elapsedSeconds, hintsUsed } })
    return { sessionId, status: 'won', score, hintsRemaining: Math.max(0, maxHints - hintsUsed), correctWord }
  }

  async startSpellingBee(userId: string, requestedDifficulty?: string): Promise<SpellingBeeStartResponse> {
    const difficulty = normalizeDifficulty(requestedDifficulty)
    const puzzle = await automationService.chooseBeePuzzle(
      difficulty,
      spellingBeePuzzles,
      this.getDateKey()
    )
    const sessionId = await this.createSession(userId, 'spelling-bee', difficulty, { letters: puzzle.letters, centerLetter: puzzle.centerLetter, validWords: puzzle.validWords, foundWords: [], score: 0, minimumLength: 4 })
    return { sessionId, letters: shuffle(puzzle.letters), centerLetter: puzzle.centerLetter, difficulty, minimumLength: 4, foundWords: [], score: 0 }
  }

  async submitSpellingBee(userId: string, sessionId: string, word?: string, finalize = false): Promise<SpellingBeeSubmitResponse> {
    const session = await this.getActiveSession(userId, sessionId, 'spelling-bee')
    const validWords = (session.state.validWords as string[]) ?? []
    const foundWords = new Set((session.state.foundWords as string[]) ?? [])
    const centerLetter = String(session.state.centerLetter)
    if (finalize) {
      const finalScore = Number(session.state.score ?? 0)
      await this.completeSession({ sessionId, userId, gameType: 'spelling-bee', difficulty: session.difficulty, score: finalScore, won: foundWords.size > 0, metadata: { foundWords: [...foundWords], totalPossibleWords: validWords.length } })
      return { sessionId, accepted: true, message: 'Round finished', score: finalScore, foundWords: [...foundWords], completed: true, finalScore }
    }
    const normalizedWord = word?.trim().toLowerCase()
    if (!normalizedWord) throw new AppError(400, 'Word is required')
    if (!normalizedWord.includes(centerLetter.toLowerCase())) return { sessionId, accepted: false, message: `Every word must include ${centerLetter}`, score: Number(session.state.score ?? 0), foundWords: [...foundWords] }
    if (normalizedWord.length < Number(session.state.minimumLength ?? 4)) return { sessionId, accepted: false, message: 'Words must be at least 4 letters long', score: Number(session.state.score ?? 0), foundWords: [...foundWords] }
    if (!validWords.includes(normalizedWord)) return { sessionId, accepted: false, message: 'That word is not valid for this puzzle', score: Number(session.state.score ?? 0), foundWords: [...foundWords] }
    if (foundWords.has(normalizedWord)) return { sessionId, accepted: false, message: 'You already found that word', score: Number(session.state.score ?? 0), foundWords: [...foundWords] }
    foundWords.add(normalizedWord)
    const score = Number(session.state.score ?? 0) + calculateSpellingBeeScore(normalizedWord)
    await pool.query('UPDATE game_sessions SET state = $1 WHERE id = $2', [{ ...session.state, foundWords: [...foundWords], score }, sessionId])
    const completed = foundWords.size === validWords.length
    if (completed) await this.completeSession({ sessionId, userId, gameType: 'spelling-bee', difficulty: session.difficulty, score, won: true, metadata: { foundWords: [...foundWords], totalPossibleWords: validWords.length } })
    return { sessionId, accepted: true, message: completed ? 'Puzzle completed' : 'Great find', score, foundWords: [...foundWords], completed, finalScore: completed ? score : undefined }
  }

  async startSpeed(userId: string, requestedDifficulty?: string): Promise<SpeedStartResponse> {
    const difficulty = normalizeDifficulty(requestedDifficulty)
    const question = await this.buildSpeedQuestion(difficulty, 1)
    const sessionId = await this.createSession(userId, 'speed', difficulty, { round: 1, score: 0, maxRounds: 5, question, questionStartedAt: new Date().toISOString() })
    return { sessionId, question: this.publicSpeedQuestion(question, 1), score: 0 }
  }

  async answerSpeed(userId: string, sessionId: string, answerIndex: number): Promise<SpeedAnswerResponse> {
    const session = await this.getActiveSession(userId, sessionId, 'speed')
    const round = Number(session.state.round ?? 1)
    const question = session.state.question as ChoiceQuestion
    const questionStartedAt = new Date(String(session.state.questionStartedAt))
    const elapsedMs = Date.now() - questionStartedAt.getTime()
    const timeLimitMs = Number(question.timeLimitSeconds ?? 8) * 1000
    const correct = elapsedMs <= timeLimitMs && answerIndex === question.answerIndex
    const score = Number(session.state.score ?? 0) + (correct ? Math.max(12, Math.round(25 + (timeLimitMs - elapsedMs) / 250)) : 0)
    if (round >= Number(session.state.maxRounds ?? 5)) {
      await this.completeSession({ sessionId, userId, gameType: 'speed', difficulty: session.difficulty, score, won: score >= 60, metadata: { rounds: round, correctWord: question.answerWord } })
      return { sessionId, correct, score, finished: true, answerIndex: question.answerIndex }
    }
    const nextRound = round + 1
    const nextQuestion = await this.buildSpeedQuestion(getDifficultyForRound(nextRound), nextRound)
    await pool.query('UPDATE game_sessions SET state = $1 WHERE id = $2', [{ ...session.state, round: nextRound, score, question: nextQuestion, questionStartedAt: new Date().toISOString() }, sessionId])
    return { sessionId, correct, score, finished: false, answerIndex: question.answerIndex, nextQuestion: this.publicSpeedQuestion(nextQuestion, nextRound) }
  }

  async startQuiz(userId: string, requestedDifficulty?: string): Promise<QuizStartResponse> {
    const difficulty = normalizeDifficulty(requestedDifficulty)
    const question = await this.buildQuizQuestion(difficulty, 1)
    const sessionId = await this.createSession(userId, 'quiz', difficulty, { round: 1, score: 0, maxRounds: 5, question })
    return { sessionId, question: this.publicQuizQuestion(question, 1), score: 0 }
  }

  async answerQuiz(userId: string, sessionId: string, answerIndex: number): Promise<QuizAnswerResponse> {
    const session = await this.getActiveSession(userId, sessionId, 'quiz')
    const round = Number(session.state.round ?? 1)
    const question = session.state.question as ChoiceQuestion
    const correct = answerIndex === question.answerIndex
    const score = Number(session.state.score ?? 0) + (correct ? 20 : 0)
    if (round >= Number(session.state.maxRounds ?? 5)) {
      await this.completeSession({ sessionId, userId, gameType: 'quiz', difficulty: session.difficulty, score, won: score >= 60, metadata: { rounds: round, correctWord: question.answerWord } })
      return { sessionId, correct, score, finished: true, answerIndex: question.answerIndex, explanation: question.explanation }
    }
    const nextRound = round + 1
    const nextQuestion = await this.buildQuizQuestion(getDifficultyForRound(nextRound), nextRound)
    await pool.query('UPDATE game_sessions SET state = $1 WHERE id = $2', [{ ...session.state, round: nextRound, score, question: nextQuestion }, sessionId])
    return { sessionId, correct, score, finished: false, answerIndex: question.answerIndex, explanation: question.explanation, nextQuestion: this.publicQuizQuestion(nextQuestion, nextRound) }
  }

  async getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const canUseRedis = await ensureRedis()
    if (canUseRedis) {
      const ranked = await redis.zRangeWithScores('leaderboard:global', 0, limit - 1, { REV: true })
      if (ranked.length) {
        const hydrated = await Promise.all(ranked.map(async (entry, index) => {
          const details = await redis.hGetAll(`leaderboard:user:${entry.value}`)
          return { userId: entry.value, username: details.username, xp: Number(details.xp), level: Number(details.level), streak: Number(details.streak), rank: index + 1 }
        }))
        if (hydrated.every((entry) => entry.username)) return hydrated
      }
    }
    const { rows } = await pool.query('SELECT id, username, xp, level, streak FROM users ORDER BY xp DESC, created_at ASC LIMIT $1', [limit])
    const entries = rows.map((row, index) => ({ userId: row.id, username: row.username, xp: row.xp, level: row.level, streak: row.streak, rank: index + 1 }))
    await this.cacheLeaderboard(entries)
    return entries
  }

  async getFriendsLeaderboard(userId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.xp, u.level, u.streak
       FROM friendships f JOIN users u ON u.id = f.friend_id
       WHERE f.user_id = $1 AND f.status = 'accepted'
       UNION
       SELECT id, username, xp, level, streak FROM users WHERE id = $1
       ORDER BY xp DESC LIMIT $2`,
      [userId, limit]
    )
    return rows.map((row, index) => ({ userId: row.id, username: row.username, xp: row.xp, level: row.level, streak: row.streak, rank: index + 1 }))
  }

  async getRecentResults(userId: string): Promise<GameResultSummary[]> {
    const { rows } = await pool.query('SELECT id, game_slug, score, won, created_at, difficulty FROM game_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 8', [userId])
    return rows.map((row) => ({ id: row.id, gameType: row.game_slug, score: row.score, won: row.won, createdAt: row.created_at, difficulty: row.difficulty }))
  }

  async getBreakdown(userId: string) {
    const { rows } = await pool.query(
      `SELECT game_slug, COUNT(*)::int AS played, COUNT(*) FILTER (WHERE won)::int AS wins,
              COALESCE(AVG(score), 0)::float AS average_score, COALESCE(MAX(score), 0)::int AS best_score
       FROM game_results WHERE user_id = $1 GROUP BY game_slug`,
      [userId]
    )
    const breakdown = Object.fromEntries(GAME_TYPES.map((gameType) => [gameType, { played: 0, wins: 0, averageScore: 0, bestScore: 0 }])) as Record<GameType, { played: number; wins: number; averageScore: number; bestScore: number }>
    for (const row of rows) breakdown[row.game_slug as GameType] = { played: row.played, wins: row.wins, averageScore: Math.round(Number(row.average_score)), bestScore: row.best_score }
    return breakdown
  }

  private async createSession(userId: string, gameType: GameType, difficulty: Difficulty, state: Record<string, unknown>) {
    const { rows } = await pool.query('INSERT INTO game_sessions (user_id, game_slug, difficulty, state) VALUES ($1, $2, $3, $4) RETURNING id', [userId, gameType, difficulty, state])
    return rows[0].id as string
  }

  private async getActiveSession(userId: string, sessionId: string, gameType: GameType) {
    const { rows } = await pool.query('SELECT id, difficulty, state FROM game_sessions WHERE id = $1 AND user_id = $2 AND game_slug = $3 AND status = $4 LIMIT 1', [sessionId, userId, gameType, 'active'])
    if (!rows.length) throw new AppError(404, 'Active game session not found')
    return rows[0] as SessionRow
  }

  private async completeSession(input: { sessionId: string; userId: string; gameType: GameType; difficulty: Difficulty; score: number; won: boolean; metadata: Record<string, unknown> }) {
    await withTransaction(async (client) => {
      const userResult = await client.query('SELECT id, username, xp, streak, last_played_at FROM users WHERE id = $1 LIMIT 1', [input.userId])
      if (!userResult.rows.length) throw new AppError(404, 'User not found')
      const user = userResult.rows[0]
      const now = new Date()
      const lastPlayedAt = user.last_played_at ? new Date(user.last_played_at) : null
      const streak = !lastPlayedAt ? 1 : isSameDay(lastPlayedAt, now) ? user.streak : isYesterday(lastPlayedAt, now) ? user.streak + 1 : 1
      const xpEarned = calculateXp(input.score, input.difficulty, input.won)
      const totalXp = user.xp + xpEarned
      const level = calculateLevel(totalXp)
      await client.query(`UPDATE game_sessions SET status = 'completed', score = $1, xp_earned = $2, completed_at = NOW() WHERE id = $3`, [input.score, xpEarned, input.sessionId])
      await client.query(`INSERT INTO game_results (session_id, user_id, game_slug, difficulty, won, score, metadata)
                          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (session_id) DO NOTHING`, [input.sessionId, input.userId, input.gameType, input.difficulty, input.won, input.score, { ...input.metadata, xpEarned, streakAfterGame: streak }])
      await client.query('UPDATE users SET xp = $1, streak = $2, level = $3, last_played_at = NOW(), updated_at = NOW() WHERE id = $4', [totalXp, streak, level, input.userId])
      await client.query(`INSERT INTO leaderboards (user_id, scope, game_slug, score, xp, updated_at)
                          VALUES ($1, 'global', 'all', $2, $3, NOW())
                          ON CONFLICT (user_id, scope, game_slug)
                          DO UPDATE SET score = EXCLUDED.score, xp = EXCLUDED.xp, updated_at = NOW()`, [input.userId, input.score, totalXp])
      await this.cacheLeaderboardEntry({ userId: input.userId, username: user.username, xp: totalXp, level, streak, rank: 0 })
    })
  }

  private async getRandomWord(filters: { difficulty: Difficulty; length?: number; minLength?: number; maxLength?: number }) {
    const candidates = await this.getCandidateWords({
      ...filters,
      limit: 1,
    })
    return candidates[0]
  }

  private async getCandidateWords(filters: { difficulty: Difficulty; length?: number; minLength?: number; maxLength?: number; limit: number; excludeWords?: string[] }) {
    const params: unknown[] = [filters.difficulty]
    const conditions = ['difficulty = $1']
    if (filters.length) { params.push(filters.length); conditions.push(`length = $${params.length}`) }
    if (filters.minLength) { params.push(filters.minLength); conditions.push(`length >= $${params.length}`) }
    if (filters.maxLength) { params.push(filters.maxLength); conditions.push(`length <= $${params.length}`) }
    if (filters.excludeWords?.length) {
      params.push(filters.excludeWords.map((word) => word.toLowerCase()))
      conditions.push(`lower(word) <> ALL($${params.length}::text[])`)
    }
    params.push(filters.limit)
    const { rows } = await pool.query(`SELECT id, word, definition, example_sentence, difficulty FROM words WHERE ${conditions.join(' AND ')} ORDER BY random() LIMIT $${params.length}`, params)
    if (!rows.length) {
      throw new AppError(404, 'No vocabulary data available for this difficulty')
    }
    return rows as WordRow[]
  }

  private getDateKey() {
    return new Date().toISOString().slice(0, 10)
  }

  private async wordExists(word: string) {
    const { rows } = await pool.query('SELECT 1 FROM words WHERE word = $1 LIMIT 1', [word.toLowerCase()])
    return rows.length > 0
  }

  private async buildSpeedQuestion(difficulty: Difficulty, round: number): Promise<ChoiceQuestion> {
    const excludeWords = await this.getRecentlyUsedWords()
    const candidates = await this.getCandidateWords({
      difficulty,
      limit: 40,
      excludeWords,
    })
    const correct = await automationService.chooseWordForGame(
      'speed',
      difficulty,
      candidates,
      `${this.getDateKey()}:round:${round}`,
      excludeWords
    )
    const distractors = await this.getDistractors(correct.id, 3)
    const options = shuffle([correct.definition, ...distractors.map((word) => word.definition)])
    return { prompt: `Pick the best definition for "${correct.word.toUpperCase()}".`, options, answerIndex: options.indexOf(correct.definition), explanation: correct.example_sentence, difficulty, timeLimitSeconds: getSpeedTimeLimit(getDifficultyForRound(round)), answerWord: correct.word }
  }

  private async buildQuizQuestion(difficulty: Difficulty, round: number): Promise<ChoiceQuestion> {
    const excludeWords = await this.getRecentlyUsedWords()
    const candidates = await this.getCandidateWords({
      difficulty,
      limit: 40,
      excludeWords,
    })
    const correct = await automationService.chooseWordForGame(
      'quiz',
      difficulty,
      candidates,
      `${this.getDateKey()}:round:${round}`,
      excludeWords
    )
    const distractors = await this.getDistractors(correct.id, 3)
    const options = shuffle([correct.word.toUpperCase(), ...distractors.map((word) => word.word.toUpperCase())])
    return { prompt: correct.definition, options, answerIndex: options.indexOf(correct.word.toUpperCase()), explanation: correct.example_sentence, difficulty: getDifficultyForRound(round), answerWord: correct.word }
  }

  private async getDistractors(excludeWordId: number, count: number) {
    const { rows } = await pool.query('SELECT id, word, definition, example_sentence, difficulty FROM words WHERE id <> $1 ORDER BY random() LIMIT $2', [excludeWordId, count])
    return rows as WordRow[]
  }

  private async getRecentlyUsedWords(limit = 48) {
    const { rows } = await pool.query(
      `SELECT metadata
       FROM game_results
       ORDER BY created_at DESC
       LIMIT $2`,
      [limit]
    )

    const words: string[] = []
    for (const row of rows) {
      const metadata = row.metadata as Record<string, unknown> | null
      const candidates = [
        metadata?.answer,
        metadata?.correctWord,
        metadata?.answerWord,
      ]

      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
          words.push(candidate)
        }
      }
    }

    return words
  }

  private publicSpeedQuestion(question: ChoiceQuestion, round: number): SpeedQuestion {
    return { prompt: question.prompt, options: question.options, round, timeLimitSeconds: Number(question.timeLimitSeconds ?? 8), difficulty: question.difficulty }
  }

  private publicQuizQuestion(question: ChoiceQuestion, round: number): QuizQuestion {
    return { prompt: question.prompt, options: question.options, explanation: question.explanation, round, difficulty: question.difficulty }
  }

  private async cacheLeaderboard(entries: LeaderboardEntry[]) {
    const canUseRedis = await ensureRedis()
    if (!canUseRedis) return
    await redis.del('leaderboard:global')
    for (const entry of entries) await this.cacheLeaderboardEntry(entry)
  }

  private async cacheLeaderboardEntry(entry: LeaderboardEntry) {
    const canUseRedis = await ensureRedis()
    if (!canUseRedis) return
    await redis.zAdd('leaderboard:global', [{ score: entry.xp, value: entry.userId }])
    await redis.hSet(`leaderboard:user:${entry.userId}`, { username: entry.username, xp: entry.xp.toString(), level: entry.level.toString(), streak: entry.streak.toString() })
  }
}

export const gameService = new GameService()
