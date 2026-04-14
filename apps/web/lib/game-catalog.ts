import type { GameCatalogItem } from '@keen/types'

export const gameCatalog: GameCatalogItem[] = [
  {
    id: 'wordle',
    name: 'Wordle',
    description: 'Decode the hidden word with positional feedback.',
    difficulty: 'medium',
    href: '/games/wordle',
    accent: 'from-blue-500 to-blue-600',
  },
  {
    id: 'scramble',
    name: 'Scramble',
    description: 'Untangle letters fast and use hints wisely.',
    difficulty: 'easy',
    href: '/games/scramble',
    accent: 'from-purple-500 to-purple-600',
  },
  {
    id: 'spelling-bee',
    name: 'Spelling Bee',
    description: 'Build valid words around the center letter.',
    difficulty: 'hard',
    href: '/games/spelling-bee',
    accent: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'speed',
    name: 'Speed Vocab',
    description: 'Answer definition rounds before the timer expires.',
    difficulty: 'hard',
    href: '/games/speed',
    accent: 'from-orange-500 to-orange-600',
  },
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Multiple choice vocabulary rounds with instant feedback.',
    difficulty: 'medium',
    href: '/games/quiz',
    accent: 'from-cyan-500 to-cyan-600',
  },
]
