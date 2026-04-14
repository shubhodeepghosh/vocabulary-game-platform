import { Difficulty } from '@keen/types'

export function normalizeDifficulty(input?: string): Difficulty {
  if (input === 'easy' || input === 'medium' || input === 'hard') {
    return input
  }

  return 'medium'
}

export function getWordleLength(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy':
      return 4
    case 'hard':
      return 6
    default:
      return 5
  }
}

export function getScrambleLengthRange(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy':
      return [4, 5]
    case 'hard':
      return [7, 8]
    default:
      return [5, 6]
  }
}

export function getScrambleTimeLimit(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy':
      return 45
    case 'hard':
      return 25
    default:
      return 35
  }
}

export function getSpeedTimeLimit(difficulty: Difficulty) {
  switch (difficulty) {
    case 'easy':
      return 10
    case 'hard':
      return 6
    default:
      return 8
  }
}

export function getDifficultyForRound(round: number): Difficulty {
  if (round >= 4) return 'hard'
  if (round >= 2) return 'medium'
  return 'easy'
}

export function shuffle<T>(items: T[]) {
  const clone = [...items]

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]]
  }

  return clone
}

export function scrambleWord(word: string) {
  const normalized = word.toUpperCase()
  let scrambled = normalized

  while (scrambled === normalized) {
    scrambled = shuffle(normalized.split('')).join('')
  }

  return scrambled
}

export function buildScrambleHint(
  answer: string,
  definition: string,
  hintLevel: number
) {
  if (hintLevel <= 0) {
    return definition
  }

  if (hintLevel === 1) {
    return `Starts with ${answer[0].toUpperCase()} and ends with ${answer.at(-1)?.toUpperCase()}.`
  }

  return `Definition: ${definition}`
}

export function evaluateWordleGuess(guess: string, answer: string) {
  const result: Array<{
    letter: string
    status: 'correct' | 'present' | 'absent'
  }> = []
  const target = answer.toUpperCase().split('')
  const letters = guess.toUpperCase().split('')
  const used = new Array(target.length).fill(false)

  for (let index = 0; index < letters.length; index += 1) {
    if (letters[index] === target[index]) {
      result[index] = {
        letter: letters[index],
        status: 'correct',
      }
      used[index] = true
    }
  }

  for (let index = 0; index < letters.length; index += 1) {
    if (result[index]) continue

    const matchIndex = target.findIndex(
      (letter, targetIndex) => letter === letters[index] && !used[targetIndex]
    )

    if (matchIndex >= 0) {
      used[matchIndex] = true
      result[index] = {
        letter: letters[index],
        status: 'present',
      }
    } else {
      result[index] = {
        letter: letters[index],
        status: 'absent',
      }
    }
  }

  return result
}

export function calculateXp(score: number, difficulty: Difficulty, won = true) {
  const multiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.25 : 1
  const base = won ? 30 : 10
  return Math.max(12, Math.round(base + score * 0.35 * multiplier))
}

export function calculateLevel(totalXp: number) {
  return Math.max(1, Math.floor(totalXp / 250) + 1)
}

export function calculateSpellingBeeScore(word: string) {
  return word.length === 4 ? 1 : word.length + 1
}

export function isSameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString()
}

export function isYesterday(lastPlayedAt: Date, now: Date) {
  const previous = new Date(now)
  previous.setDate(now.getDate() - 1)
  return lastPlayedAt.toDateString() === previous.toDateString()
}
