export type GameType =
  | 'wordle'
  | 'scramble'
  | 'spelling-bee'
  | 'speed'
  | 'quiz'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface AuthUser {
  id: string
  username: string
  email: string
  isGuest?: boolean
  xp: number
  streak: number
  level: number
  createdAt: string
}

export interface AuthResponse {
  user: AuthUser
  tokenExpiresAt: string
}

export interface UserStats {
  totalGamesPlayed: number
  totalWins: number
  averageScore: number
  currentStreak: number
  bestStreak: number
  totalXp: number
  level: number
  favoriteGame: GameType | null
  recentResults: GameResultSummary[]
  byGame: Record<GameType, GameBreakdown>
}

export interface GameBreakdown {
  played: number
  wins: number
  averageScore: number
  bestScore: number
}

export interface GameResultSummary {
  id: string
  gameType: GameType
  score: number
  won: boolean
  createdAt: string
  difficulty: Difficulty
}

export interface LeaderboardEntry {
  userId: string
  username: string
  xp: number
  level: number
  streak: number
  rank: number
}

export interface StartGameRequest {
  difficulty?: Difficulty
}

export interface WordleStartResponse {
  sessionId: string
  wordLength: number
  maxAttempts: number
  difficulty: Difficulty
  clue: string
}

export interface WordleGuessResponse {
  sessionId: string
  attemptsUsed: number
  maxAttempts: number
  status: 'active' | 'won' | 'lost'
  score: number
  evaluation: Array<{
    letter: string
    status: 'correct' | 'present' | 'absent'
  }>
  answer?: string
}

export interface ScrambleStartResponse {
  sessionId: string
  scrambledWord: string
  difficulty: Difficulty
  timeLimitSeconds: number
  hint: string
  maxHints: number
}

export interface ScrambleSubmitResponse {
  sessionId: string
  status: 'active' | 'won' | 'lost'
  score: number
  hint?: string
  hintsRemaining: number
  correctWord?: string
}

export interface SpellingBeeStartResponse {
  sessionId: string
  letters: string[]
  centerLetter: string
  difficulty: Difficulty
  minimumLength: number
  foundWords: string[]
  score: number
}

export interface SpellingBeeSubmitResponse {
  sessionId: string
  accepted: boolean
  message: string
  score: number
  foundWords: string[]
  completed?: boolean
  finalScore?: number
}

export interface SpeedQuestion {
  prompt: string
  options: string[]
  correctAnswerIndex?: number
  round: number
  timeLimitSeconds: number
  difficulty: Difficulty
}

export interface SpeedStartResponse {
  sessionId: string
  question: SpeedQuestion
  score: number
}

export interface SpeedAnswerResponse {
  sessionId: string
  correct: boolean
  score: number
  finished: boolean
  answerIndex: number
  nextQuestion?: SpeedQuestion
}

export interface QuizQuestion {
  prompt: string
  options: string[]
  correctAnswerIndex?: number
  explanation: string
  round: number
  difficulty: Difficulty
}

export interface QuizStartResponse {
  sessionId: string
  question: QuizQuestion
  score: number
}

export interface QuizAnswerResponse {
  sessionId: string
  correct: boolean
  score: number
  finished: boolean
  answerIndex: number
  explanation: string
  nextQuestion?: QuizQuestion
}

export interface GameCatalogItem {
  id: GameType
  name: string
  description: string
  difficulty: Difficulty
  href: string
  accent: string
}
