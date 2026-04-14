import type {
  AuthResponse,
  AuthUser,
  Difficulty,
  GameResultSummary,
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
  UserStats,
  WordleGuessResponse,
  WordleStartResponse,
} from '@keen/types'
import { demoBeePuzzles, demoWords, gameSeeds } from './demo-data'

type DemoGameType = 'wordle' | 'scramble' | 'spelling-bee' | 'speed' | 'quiz'

type DemoSession = {
  id: string
  userId: string
  gameType: DemoGameType
  difficulty: Difficulty
  status: 'active' | 'completed'
  score: number
  state: Record<string, unknown>
  createdAt: string
}

type DemoUser = AuthUser & {
  password?: string
  lastPlayedAt?: string | null
}

type DemoState = {
  currentUserId: string | null
  users: DemoUser[]
  sessions: DemoSession[]
  results: Array<GameResultSummary & { userId: string }>
}

const STORAGE_KEY = 'keen_demo_state_v1'

function nowIso() {
  return new Date().toISOString()
}

function loadState(): DemoState {
  if (typeof window === 'undefined') {
    return {
      currentUserId: null,
      users: [],
      sessions: [],
      results: [],
    }
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return {
      currentUserId: null,
      users: [],
      sessions: [],
      results: [],
    }
  }

  try {
    return JSON.parse(raw) as DemoState
  } catch {
    return {
      currentUserId: null,
      users: [],
      sessions: [],
      results: [],
    }
  }
}

function saveState(state: DemoState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeDifficulty(input?: string): Difficulty {
  return input === 'easy' || input === 'hard' ? input : 'medium'
}

function getDifficultyForRound(round: number): Difficulty {
  if (round >= 4) return 'hard'
  if (round >= 2) return 'medium'
  return 'easy'
}

function getWordleLength(difficulty: Difficulty) {
  return difficulty === 'easy' ? 4 : difficulty === 'hard' ? 6 : 5
}

function getScrambleLengthRange(difficulty: Difficulty) {
  return difficulty === 'easy' ? [4, 5] : difficulty === 'hard' ? [7, 8] : [5, 6]
}

function getScrambleTimeLimit(difficulty: Difficulty) {
  return difficulty === 'easy' ? 45 : difficulty === 'hard' ? 25 : 35
}

function getSpeedTimeLimit(difficulty: Difficulty) {
  return difficulty === 'easy' ? 10 : difficulty === 'hard' ? 6 : 8
}

function shuffle<T>(items: T[]) {
  const clone = [...items]
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]]
  }
  return clone
}

function scrambleWord(word: string) {
  const normalized = word.toUpperCase()
  let scrambled = normalized
  while (scrambled === normalized) scrambled = shuffle(normalized.split('')).join('')
  return scrambled
}

function buildScrambleHint(answer: string, definition: string, hintLevel: number) {
  if (hintLevel <= 0) return definition
  if (hintLevel === 1) return `Starts with ${answer[0].toUpperCase()} and ends with ${answer.at(-1)?.toUpperCase()}.`
  return `Definition: ${definition}`
}

function evaluateWordleGuess(guess: string, answer: string) {
  const result: Array<{ letter: string; status: 'correct' | 'present' | 'absent' }> = []
  const target = answer.toUpperCase().split('')
  const letters = guess.toUpperCase().split('')
  const used = new Array(target.length).fill(false)

  for (let index = 0; index < letters.length; index += 1) {
    if (letters[index] === target[index]) {
      result[index] = { letter: letters[index], status: 'correct' }
      used[index] = true
    }
  }

  for (let index = 0; index < letters.length; index += 1) {
    if (result[index]) continue
    const matchIndex = target.findIndex((letter, targetIndex) => letter === letters[index] && !used[targetIndex])
    if (matchIndex >= 0) {
      used[matchIndex] = true
      result[index] = { letter: letters[index], status: 'present' }
    } else {
      result[index] = { letter: letters[index], status: 'absent' }
    }
  }

  return result
}

function calculateXp(score: number, difficulty: Difficulty, won = true) {
  const multiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.25 : 1
  const base = won ? 30 : 10
  return Math.max(12, Math.round(base + score * 0.35 * multiplier))
}

function calculateLevel(totalXp: number) {
  return Math.max(1, Math.floor(totalXp / 250) + 1)
}

function calculateSpellingBeeScore(word: string) {
  return word.length === 4 ? 1 : word.length + 1
}

function isSameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString()
}

function isYesterday(lastPlayedAt: Date, now: Date) {
  const previous = new Date(now)
  previous.setDate(now.getDate() - 1)
  return lastPlayedAt.toDateString() === previous.toDateString()
}

function getCurrentUser(state: DemoState) {
  return state.users.find((user) => user.id === state.currentUserId) ?? null
}

function createGuestUser(state: DemoState) {
  const suffix = Math.random().toString(36).slice(2, 8)
  const user: DemoUser = {
    id: nextId('guest'),
    username: `Guest-${suffix}`,
    email: `guest-${suffix}@demo.local`,
    isGuest: true,
    xp: 0,
    streak: 0,
    level: 1,
    createdAt: nowIso(),
    password: undefined,
    lastPlayedAt: null,
  }
  state.users.unshift(user)
  state.currentUserId = user.id
  saveState(state)
  return user
}

function ensureUser(state: DemoState) {
  const current = getCurrentUser(state)
  return current ?? createGuestUser(state)
}

function mapUser(user: DemoUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isGuest: user.isGuest,
    xp: user.xp,
    streak: user.streak,
    level: user.level,
    createdAt: user.createdAt,
  }
}

function candidateWords(difficulty: Difficulty, length?: number, minLength?: number, maxLength?: number) {
  return demoWords.filter((word) => {
    if (word.difficulty !== difficulty && !(difficulty === 'medium' && word.difficulty === 'easy')) return false
    if (length && word.word.length !== length) return false
    if (minLength && word.word.length < minLength) return false
    if (maxLength && word.word.length > maxLength) return false
    return true
  })
}

function chooseWord(difficulty: Difficulty, length?: number, minLength?: number, maxLength?: number) {
  const words = candidateWords(difficulty, length, minLength, maxLength)
  return words[Math.floor(Math.random() * words.length)] ?? demoWords[0]
}

function getDistractors(excludeWordId: number, count: number) {
  return shuffle(demoWords.filter((word) => word.id !== excludeWordId)).slice(0, count)
}

function startSession(
  state: DemoState,
  userId: string,
  gameType: DemoGameType,
  difficulty: Difficulty,
  sessionState: Record<string, unknown>
) {
  const session: DemoSession = {
    id: nextId('session'),
    userId,
    gameType,
    difficulty,
    status: 'active',
    score: 0,
    state: sessionState,
    createdAt: nowIso(),
  }
  state.sessions.unshift(session)
  saveState(state)
  return session
}

function getSession(state: DemoState, userId: string, sessionId: string, gameType: DemoGameType) {
  const session = state.sessions.find(
    (entry) => entry.id === sessionId && entry.userId === userId && entry.gameType === gameType && entry.status === 'active'
  )
  if (!session) {
    throw new Error('Active game session not found')
  }
  return session
}

function completeSession(state: DemoState, input: {
  session: DemoSession
  userId: string
  gameType: DemoGameType
  difficulty: Difficulty
  score: number
  won: boolean
  metadata: Record<string, unknown>
}) {
  const user = state.users.find((entry) => entry.id === input.userId)
  if (!user) throw new Error('User not found')
  const now = new Date()
  const lastPlayedAt = user.lastPlayedAt ? new Date(user.lastPlayedAt) : null
  const streak = !lastPlayedAt ? 1 : isSameDay(lastPlayedAt, now) ? user.streak : isYesterday(lastPlayedAt, now) ? user.streak + 1 : 1
  const xpEarned = calculateXp(input.score, input.difficulty, input.won)
  user.xp += xpEarned
  user.streak = streak
  user.level = calculateLevel(user.xp)
  user.lastPlayedAt = nowIso()
  input.session.status = 'completed'
  input.session.score = input.score
  state.results.unshift({
    id: nextId('result'),
    userId: user.id,
    gameType: input.gameType,
    score: input.score,
    won: input.won,
    createdAt: nowIso(),
    difficulty: input.difficulty,
  })
  saveState(state)
}

function publicStatsForUser(state: DemoState, user: DemoUser): UserStats {
  const recentResults = state.results
    .filter((result) => result.userId === user.id)
    .slice(0, 8)
    .map((result) => ({
      id: result.id,
      gameType: result.gameType,
      score: result.score,
      won: result.won,
      createdAt: result.createdAt,
      difficulty: result.difficulty,
    }))

  const byGame = Object.fromEntries(
    gameSeeds.map((game) => [
      game.slug,
      { played: 0, wins: 0, averageScore: 0, bestScore: 0 },
    ])
  ) as UserStats['byGame']

  for (const game of gameSeeds) {
    const items = state.results.filter((result) => result.userId === user.id && result.gameType === game.slug)
    if (!items.length) continue
    byGame[game.slug] = {
      played: items.length,
      wins: items.filter((item) => item.won).length,
      averageScore: Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length),
      bestScore: Math.max(...items.map((item) => item.score)),
    }
  }

  const userResults = state.results.filter((result) => result.userId === user.id)
  return {
    totalGamesPlayed: userResults.length,
    totalWins: userResults.filter((result) => result.won).length,
    averageScore: userResults.length ? Math.round(userResults.reduce((sum, result) => sum + result.score, 0) / userResults.length) : 0,
    currentStreak: user.streak,
    bestStreak: Math.max(user.streak, 1),
    totalXp: user.xp,
    level: user.level,
    favoriteGame: userResults[0]?.gameType ?? null,
    recentResults,
    byGame,
  }
}

function leaderboard(state: DemoState): LeaderboardEntry[] {
  return [...state.users]
    .sort((left, right) => right.xp - left.xp || left.createdAt.localeCompare(right.createdAt))
    .map((user, index) => ({
      userId: user.id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      rank: index + 1,
    }))
}

function dailyKey() {
  return new Date().toISOString().slice(0, 10)
}

function createSpeedQuestion(difficulty: Difficulty, round: number): { question: SpeedQuestion; answerIndex: number } {
  const correct = chooseWord(getDifficultyForRound(round))
  const distractors = getDistractors(correct.id, 3)
  const options = shuffle([correct.definition, ...distractors.map((word) => word.definition)])
  return {
    question: {
      prompt: `Pick the best definition for "${correct.word.toUpperCase()}".`,
      options,
      correctAnswerIndex: options.indexOf(correct.definition),
      round,
      timeLimitSeconds: getSpeedTimeLimit(getDifficultyForRound(round)),
      difficulty,
    },
    answerIndex: options.indexOf(correct.definition),
  }
}

function createQuizQuestion(difficulty: Difficulty, round: number): { question: QuizQuestion; answerIndex: number } {
  const correct = chooseWord(getDifficultyForRound(round))
  const distractors = getDistractors(correct.id, 3)
  const options = shuffle([correct.word.toUpperCase(), ...distractors.map((word) => word.word.toUpperCase())])
  return {
    question: {
      prompt: correct.definition,
      options,
      correctAnswerIndex: options.indexOf(correct.word.toUpperCase()),
      explanation: correct.exampleSentence,
      round,
      difficulty,
    },
    answerIndex: options.indexOf(correct.word.toUpperCase()),
  }
}

export async function demoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const state = loadState()
  const method = init?.method?.toUpperCase() ?? 'GET'
  const body = init?.body ? JSON.parse(String(init.body)) : {}
  const current = ensureUser(state)

  const ok = <U>(payload: U, status = 200) => {
    if (status === 204) return undefined as T
    return payload as unknown as T
  }

  if (path === '/auth/me') {
    return ok({ user: mapUser(current) })
  }

  if (path === '/auth/guest' && method === 'POST') {
    const user = createGuestUser(state)
    return ok<AuthResponse>({ user: mapUser(user), tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() })
  }

  if (path === '/auth/logout' && method === 'POST') {
    state.currentUserId = null
    saveState(state)
    return ok(undefined, 204)
  }

  if (path === '/user/profile') {
    return ok(mapUser(current))
  }

  if (path === '/user/stats') {
    return ok(publicStatsForUser(state, current))
  }

  if (path === '/leaderboard/global') {
    return ok({ entries: leaderboard(state) })
  }

  if (path === '/games/wordle/start' && method === 'POST') {
    const difficulty = normalizeDifficulty(body.difficulty)
    const wordLength = getWordleLength(difficulty)
    const word = chooseWord(difficulty, wordLength)
    const session = startSession(state, current.id, 'wordle', difficulty, {
      answer: word.word.toUpperCase(),
      clue: word.definition,
      attempts: [],
      maxAttempts: 6,
    })
    return ok<WordleStartResponse>({ sessionId: session.id, wordLength, maxAttempts: 6, difficulty, clue: word.definition })
  }

  if (path === '/games/wordle/guess' && method === 'POST') {
    const session = getSession(state, current.id, body.sessionId, 'wordle')
    const answer = String(session.state.answer)
    const attempts = Array.isArray(session.state.attempts) ? [...(session.state.attempts as string[])] : []
    const guess = String(body.guess ?? '').trim().toUpperCase()
    if (guess.length !== answer.length) throw new Error(`Guess must be ${answer.length} letters`)
    attempts.push(guess)
    const evaluation = evaluateWordleGuess(guess, answer)
    const won = guess === answer
    const lost = !won && attempts.length >= Number(session.state.maxAttempts ?? 6)
    const score = won ? Math.max(40, 120 - (attempts.length - 1) * 15) : 0
    session.state = { ...session.state, attempts }
    if (won || lost) {
      completeSession(state, { session, userId: current.id, gameType: 'wordle', difficulty: session.difficulty, score, won, metadata: { attempts, answer } })
    } else {
      saveState(state)
    }
    return ok<WordleGuessResponse>({
      sessionId: session.id,
      attemptsUsed: attempts.length,
      maxAttempts: 6,
      status: won ? 'won' : lost ? 'lost' : 'active',
      score,
      evaluation,
      answer: won || lost ? answer : undefined,
    })
  }

  if (path === '/games/scramble/start' && method === 'POST') {
    const difficulty = normalizeDifficulty(body.difficulty)
    const [minLength, maxLength] = getScrambleLengthRange(difficulty)
    const word = chooseWord(difficulty, undefined, minLength, maxLength)
    const session = startSession(state, current.id, 'scramble', difficulty, {
      answer: word.word.toUpperCase(),
      definition: word.definition,
      scrambledWord: scrambleWord(word.word),
      startedAt: nowIso(),
      timeLimitSeconds: getScrambleTimeLimit(difficulty),
      hintsUsed: 0,
      maxHints: 2,
    })
    return ok<ScrambleStartResponse>({
      sessionId: session.id,
      scrambledWord: String(session.state.scrambledWord),
      difficulty,
      timeLimitSeconds: Number(session.state.timeLimitSeconds),
      hint: word.definition,
      maxHints: 2,
    })
  }

  if (path === '/games/scramble/submit' && method === 'POST') {
    const session = getSession(state, current.id, body.sessionId, 'scramble')
    const correctWord = String(session.state.answer)
    const hintsUsed = Number(session.state.hintsUsed ?? 0)
    const maxHints = Number(session.state.maxHints ?? 2)
    if (body.requestHint) {
      const nextHintsUsed = Math.min(maxHints, hintsUsed + 1)
      session.state = { ...session.state, hintsUsed: nextHintsUsed }
      saveState(state)
      return ok<ScrambleSubmitResponse>({
        sessionId: session.id,
        status: 'active',
        score: 0,
        hint: buildScrambleHint(correctWord, String(session.state.definition), nextHintsUsed),
        hintsRemaining: Math.max(0, maxHints - nextHintsUsed),
      })
    }
    const answer = String(body.answer ?? '').trim().toUpperCase()
    if (!answer) throw new Error('Answer is required')
    if (answer !== correctWord) {
      saveState(state)
      return ok<ScrambleSubmitResponse>({
        sessionId: session.id,
        status: 'active',
        score: 0,
        hintsRemaining: Math.max(0, maxHints - hintsUsed),
      })
    }
    const score = Math.max(25, Math.round(110 - hintsUsed * 12))
    completeSession(state, { session, userId: current.id, gameType: 'scramble', difficulty: session.difficulty, score, won: true, metadata: { correctWord, hintsUsed } })
    return ok<ScrambleSubmitResponse>({
      sessionId: session.id,
      status: 'won',
      score,
      hintsRemaining: Math.max(0, maxHints - hintsUsed),
      correctWord,
    })
  }

  if (path === '/games/spelling-bee/start' && method === 'POST') {
    const difficulty = normalizeDifficulty(body.difficulty)
    const puzzle = demoBeePuzzles.find((entry) => entry.difficulty === difficulty) ?? demoBeePuzzles[1]
    const session = startSession(state, current.id, 'spelling-bee', difficulty, {
      letters: puzzle.letters,
      centerLetter: puzzle.centerLetter,
      validWords: puzzle.validWords,
      foundWords: [],
      score: 0,
      minimumLength: 4,
    })
    return ok<SpellingBeeStartResponse>({
      sessionId: session.id,
      letters: shuffle([...puzzle.letters]),
      centerLetter: puzzle.centerLetter,
      difficulty,
      minimumLength: 4,
      foundWords: [],
      score: 0,
    })
  }

  if (path === '/games/spelling-bee/submit' && method === 'POST') {
    const session = getSession(state, current.id, body.sessionId, 'spelling-bee')
    const validWords = (session.state.validWords as string[]) ?? []
    const foundWords = new Set((session.state.foundWords as string[]) ?? [])
    const centerLetter = String(session.state.centerLetter)
    if (body.finalize) {
      const finalScore = Number(session.state.score ?? 0)
      completeSession(state, { session, userId: current.id, gameType: 'spelling-bee', difficulty: session.difficulty, score: finalScore, won: foundWords.size > 0, metadata: { foundWords: [...foundWords] } })
      return ok<SpellingBeeSubmitResponse>({ sessionId: session.id, accepted: true, message: 'Round finished', score: finalScore, foundWords: [...foundWords], completed: true, finalScore })
    }
    const word = String(body.word ?? '').trim().toLowerCase()
    if (!word) throw new Error('Word is required')
    if (!word.includes(centerLetter.toLowerCase())) return ok<SpellingBeeSubmitResponse>({ sessionId: session.id, accepted: false, message: `Every word must include ${centerLetter}`, score: Number(session.state.score ?? 0), foundWords: [...foundWords] })
    if (!validWords.includes(word)) return ok<SpellingBeeSubmitResponse>({ sessionId: session.id, accepted: false, message: 'That word is not valid for this puzzle', score: Number(session.state.score ?? 0), foundWords: [...foundWords] })
    if (foundWords.has(word)) return ok<SpellingBeeSubmitResponse>({ sessionId: session.id, accepted: false, message: 'You already found that word', score: Number(session.state.score ?? 0), foundWords: [...foundWords] })
    foundWords.add(word)
    const score = Number(session.state.score ?? 0) + calculateSpellingBeeScore(word)
    session.state = { ...session.state, foundWords: [...foundWords], score }
    saveState(state)
    return ok<SpellingBeeSubmitResponse>({ sessionId: session.id, accepted: true, message: 'Great find', score, foundWords: [...foundWords], completed: foundWords.size === validWords.length, finalScore: foundWords.size === validWords.length ? score : undefined })
  }

  if (path === '/games/speed/start' && method === 'POST') {
    const difficulty = normalizeDifficulty(body.difficulty)
    const built = createSpeedQuestion(difficulty, 1)
    const session = startSession(state, current.id, 'speed', difficulty, {
      round: 1,
      score: 0,
      maxRounds: 5,
      question: built.question,
      questionStartedAt: nowIso(),
    })
    return ok<SpeedStartResponse>({ sessionId: session.id, question: built.question, score: 0 })
  }

  if (path === '/games/speed/answer' && method === 'POST') {
    const session = getSession(state, current.id, body.sessionId, 'speed')
    const round = Number(session.state.round ?? 1)
    const question = session.state.question as SpeedQuestion
    const correct = Number(body.answerIndex) === question.correctAnswerIndex
    const score = Number(session.state.score ?? 0) + (correct ? 20 : 0)
    if (round >= Number(session.state.maxRounds ?? 5)) {
      completeSession(state, { session, userId: current.id, gameType: 'speed', difficulty: session.difficulty, score, won: score >= 60, metadata: { rounds: round } })
      return ok<SpeedAnswerResponse>({ sessionId: session.id, correct, score, finished: true, answerIndex: question.correctAnswerIndex ?? 0 })
    }
    const nextRound = round + 1
    const nextQuestion = createSpeedQuestion(getDifficultyForRound(nextRound), nextRound)
    session.state = { ...session.state, round: nextRound, score, question: nextQuestion.question, questionStartedAt: nowIso() }
    saveState(state)
    return ok<SpeedAnswerResponse>({ sessionId: session.id, correct, score, finished: false, answerIndex: question.correctAnswerIndex ?? 0, nextQuestion: nextQuestion.question })
  }

  if (path === '/games/quiz/start' && method === 'POST') {
    const difficulty = normalizeDifficulty(body.difficulty)
    const built = createQuizQuestion(difficulty, 1)
    const session = startSession(state, current.id, 'quiz', difficulty, {
      round: 1,
      score: 0,
      maxRounds: 5,
      question: built.question,
    })
    return ok<QuizStartResponse>({ sessionId: session.id, question: built.question, score: 0 })
  }

  if (path === '/games/quiz/answer' && method === 'POST') {
    const session = getSession(state, current.id, body.sessionId, 'quiz')
    const round = Number(session.state.round ?? 1)
    const question = session.state.question as QuizQuestion
    const correct = Number(body.answerIndex) === question.correctAnswerIndex
    const score = Number(session.state.score ?? 0) + (correct ? 20 : 0)
    if (round >= Number(session.state.maxRounds ?? 5)) {
      completeSession(state, { session, userId: current.id, gameType: 'quiz', difficulty: session.difficulty, score, won: score >= 60, metadata: { rounds: round } })
      return ok<QuizAnswerResponse>({ sessionId: session.id, correct, score, finished: true, answerIndex: question.correctAnswerIndex ?? 0, explanation: question.explanation })
    }
    const nextRound = round + 1
    const nextQuestion = createQuizQuestion(getDifficultyForRound(nextRound), nextRound)
    session.state = { ...session.state, round: nextRound, score, question: nextQuestion.question }
    saveState(state)
    return ok<QuizAnswerResponse>({ sessionId: session.id, correct, score, finished: false, answerIndex: question.correctAnswerIndex ?? 0, explanation: question.explanation, nextQuestion: nextQuestion.question })
  }

  throw new Error(`Unsupported demo route: ${path}`)
}
