import { createClient } from '@/lib/supabase/client'

export interface GameResult {
  gameType: string
  score: number
  completed: boolean
}

/**
 * Submit a game result to the database
 */
export async function submitGameResult(result: GameResult) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const response = await fetch('/api/games/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameType: result.gameType,
      score: result.score,
      completed: result.completed,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit game result')
  }

  return await response.json()
}

/**
 * Get random words from the database
 */
export async function getRandomWords(
  count: number = 1,
  difficulty?: string,
  length?: number
) {
  const supabase = createClient()
  let query = supabase.from('words').select('*')

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  if (length) {
    query = query.eq('length', length)
  }

  const { data, error } = await query
    .order('random()', { ascending: true })
    .limit(count)

  if (error) {
    throw error
  }

  return data
}

/**
 * Get a single random word
 */
export async function getRandomWord(difficulty?: string, length?: number) {
  const words = await getRandomWords(1, difficulty, length)
  return words?.[0] || null
}

/**
 * Get user's game stats
 */
export async function getUserStats() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Get user's game history
 */
export async function getGameHistory(gameType?: string, limit: number = 10) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  let query = supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', user.id)

  if (gameType) {
    query = query.eq('game_type', gameType)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data
}

/**
 * Calculate score as percentage (0-100)
 */
export function calculateScorePercentage(
  correct: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-600'
    case 'medium':
      return 'text-yellow-600'
    case 'hard':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get game icon color gradient
 */
export function getGameGradient(gameType: string): string {
  const gradients: Record<string, string> = {
    wordle: 'from-blue-500 to-blue-600',
    match: 'from-purple-500 to-purple-600',
    flashcard: 'from-cyan-500 to-cyan-600',
    sentence: 'from-green-500 to-green-600',
    rapid: 'from-orange-500 to-orange-600',
  }

  return gradients[gameType] || 'from-primary to-primary'
}
