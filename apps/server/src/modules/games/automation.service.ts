import type { Difficulty, GameType } from '@keen/types'
import { env } from '../../config/env.js'

type CandidateWord = {
  word: string
  definition: string
  example_sentence: string
}

type BeePuzzle = {
  difficulty: Difficulty
  letters: string[]
  centerLetter: string
  validWords: string[]
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function pickDeterministically<T>(items: T[], seed: string) {
  if (!items.length) {
    throw new Error('No items available for automation')
  }

  return items[hashString(seed) % items.length]
}

async function queryOpenAI<T>(prompt: string): Promise<T | null> {
  if (!env.OPENAI_API_KEY || env.GAME_AUTOMATION_MODE !== 'openai') {
    return null
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'game_automation',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                word: { type: 'string' },
                centerLetter: { type: 'string' },
              },
            },
          },
        },
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      output_text?: string
    }

    if (!data.output_text) {
      return null
    }

    return JSON.parse(data.output_text) as T
  } catch {
    return null
  }
}

async function queryGemini<T>(prompt: string): Promise<T | null> {
  if (!env.GEMINI_API_KEY || env.GAME_AUTOMATION_MODE === 'openai') {
    return null
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>
        }
      }>
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
    if (!text) {
      return null
    }

    return JSON.parse(text) as T
  } catch {
    return null
  }
}

async function queryStructuredAI<T>(prompt: string): Promise<T | null> {
  return (await queryGemini<T>(prompt)) ?? (await queryOpenAI<T>(prompt))
}

export class AutomationService {
  async chooseWordForGame<T extends CandidateWord>(
    gameType: GameType,
    difficulty: Difficulty,
    candidates: T[],
    dateKey: string,
    excludeWords: string[] = []
  ): Promise<T> {
    const seed = `${gameType}:${difficulty}:${dateKey}`
    const normalizedExcludes = new Set(excludeWords.map((word) => word.toLowerCase()))
    const viableCandidates = candidates.filter((candidate) => !normalizedExcludes.has(candidate.word.toLowerCase()))
    const pool = viableCandidates.length ? viableCandidates : candidates
    const aiChoice = await queryStructuredAI<{ word?: string }>(
      [
        'Pick one word for a daily vocabulary game.',
        `Game: ${gameType}`,
        `Difficulty: ${difficulty}`,
        `Date: ${dateKey}`,
        'Choose only from this shortlist:',
        pool
          .map((candidate) => `${candidate.word} - ${candidate.definition}`)
          .join('\n'),
        'Return JSON with a single "word" field.',
      ].join('\n')
    )

    const fromAi = candidates.find(
      (candidate) => candidate.word.toLowerCase() === aiChoice?.word?.toLowerCase()
    )

    return fromAi ?? pickDeterministically(pool, seed)
  }

  async chooseBeePuzzle(
    difficulty: Difficulty,
    puzzles: BeePuzzle[],
    dateKey: string
  ) {
    const matching = puzzles.filter((puzzle) => puzzle.difficulty === difficulty)
    const seed = `spelling-bee:${difficulty}:${dateKey}`
    const aiChoice = await queryStructuredAI<{ centerLetter?: string }>(
      [
        'Pick one spelling bee puzzle for today.',
        `Difficulty: ${difficulty}`,
        `Date: ${dateKey}`,
        'Return JSON with the "centerLetter" of the chosen puzzle.',
        matching
          .map(
            (puzzle) =>
              `${puzzle.centerLetter}: ${puzzle.letters.join(',')} (${puzzle.validWords.length} words)`
          )
          .join('\n'),
      ].join('\n')
    )

    const fromAi = matching.find(
      (puzzle) =>
        puzzle.centerLetter.toLowerCase() === aiChoice?.centerLetter?.toLowerCase()
    )

    return fromAi ?? pickDeterministically(matching, seed)
  }

  createDynamicFeedback(gameType: GameType, success: boolean, score: number) {
    const positive = {
      wordle: 'Sharp read. That grid looked clean.',
      scramble: 'Fast hands. You untangled that nicely.',
      'spelling-bee': 'Great chain. The hive is humming.',
      speed: 'You were flying. Keep the tempo high.',
      quiz: 'Nice hit. Your vocab instincts are working.',
    }

    const negative = {
      wordle: 'No stress. Use the pattern and squeeze the board.',
      scramble: 'Almost there. Try a different letter anchor.',
      'spelling-bee': 'That one missed. Lean on the center letter.',
      speed: 'Reset fast. The next round can swing it back.',
      quiz: 'Good learning rep. The explanation is the win here.',
    }

    const base = success ? positive[gameType] : negative[gameType]
    return `${base} Current score: ${score}.`
  }
}

export const automationService = new AutomationService()
