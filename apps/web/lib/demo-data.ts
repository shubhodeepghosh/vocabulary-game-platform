import type { Difficulty, GameType } from '@keen/types'

export type DemoWord = {
  id: number
  word: string
  definition: string
  exampleSentence: string
  difficulty: Difficulty
}

export const demoWords: DemoWord[] = [
  { id: 1, word: 'adapt', definition: 'to change so something fits a new use or condition', exampleSentence: 'Strong readers adapt their strategies to the text.', difficulty: 'easy' },
  { id: 2, word: 'brisk', definition: 'quick, lively, and energetic', exampleSentence: 'They took a brisk walk before class.', difficulty: 'easy' },
  { id: 3, word: 'calm', definition: 'free from excitement or nervous activity', exampleSentence: 'She stayed calm during the puzzle round.', difficulty: 'easy' },
  { id: 4, word: 'dwell', definition: 'to live in a place or to think about something for too long', exampleSentence: 'Do not dwell on one wrong guess.', difficulty: 'easy' },
  { id: 5, word: 'eager', definition: 'wanting to do something very much', exampleSentence: 'The eager team started the challenge immediately.', difficulty: 'easy' },
  { id: 6, word: 'fable', definition: 'a short story that usually teaches a lesson', exampleSentence: 'The hint read like a modern fable.', difficulty: 'medium' },
  { id: 7, word: 'galaxy', definition: 'a huge system of stars held together by gravity', exampleSentence: 'The score chart looked like a galaxy of progress.', difficulty: 'medium' },
  { id: 8, word: 'harmony', definition: 'a pleasing agreement between parts', exampleSentence: 'The frontend and backend moved in harmony.', difficulty: 'hard' },
  { id: 9, word: 'insight', definition: 'a deep understanding of something', exampleSentence: 'The stat cards provide insight into improvement.', difficulty: 'hard' },
  { id: 10, word: 'journey', definition: 'the act of traveling from one place to another', exampleSentence: 'Vocabulary growth is a long journey.', difficulty: 'medium' },
  { id: 11, word: 'lucid', definition: 'clear and easy to understand', exampleSentence: 'Her lucid explanation solved the clue.', difficulty: 'medium' },
  { id: 12, word: 'meadow', definition: 'a field of grass and wild flowers', exampleSentence: 'The background felt calm like a meadow.', difficulty: 'medium' },
  { id: 13, word: 'notion', definition: 'an idea or belief about something', exampleSentence: 'He had a notion that the answer started with s.', difficulty: 'medium' },
  { id: 14, word: 'orbit', definition: 'the curved path of one object around another', exampleSentence: 'The quiz choices orbit around the main idea.', difficulty: 'medium' },
  { id: 15, word: 'prism', definition: 'a solid shape that can separate light into colors', exampleSentence: 'A prism split the beam into bands of color.', difficulty: 'medium' },
  { id: 16, word: 'quartz', definition: 'a hard mineral often used in watches and glass', exampleSentence: 'The timer felt as precise as quartz.', difficulty: 'hard' },
  { id: 17, word: 'resolve', definition: 'firm determination or the act of solving something', exampleSentence: 'Her resolve carried the streak forward.', difficulty: 'hard' },
  { id: 18, word: 'serene', definition: 'calm and peaceful', exampleSentence: 'The serene palette made the app feel focused.', difficulty: 'medium' },
  { id: 19, word: 'thrive', definition: 'to grow or develop well', exampleSentence: 'Players thrive when feedback is immediate.', difficulty: 'medium' },
  { id: 20, word: 'unravel', definition: 'to solve or explain something complicated', exampleSentence: 'The final clue helped unravel the mystery word.', difficulty: 'hard' },
]

export const demoBeePuzzles = [
  {
    difficulty: 'easy' as Difficulty,
    letters: ['A', 'E', 'H', 'N', 'R', 'S', 'T'],
    centerLetter: 'A',
    validWords: ['earn', 'earth', 'heart', 'near', 'rate', 'share', 'snare', 'stare', 'tear'],
  },
  {
    difficulty: 'medium' as Difficulty,
    letters: ['O', 'D', 'G', 'L', 'N', 'R', 'W'],
    centerLetter: 'O',
    validWords: ['down', 'glow', 'gold', 'grow', 'long', 'word', 'world', 'wrong'],
  },
  {
    difficulty: 'hard' as Difficulty,
    letters: ['I', 'E', 'N', 'P', 'R', 'S', 'T'],
    centerLetter: 'I',
    validWords: ['inset', 'insert', 'inter', 'rinse', 'rise', 'siren', 'spire', 'spite', 'sprite', 'stir'],
  },
] as const

export const gameSeeds: Array<{
  slug: GameType
  name: string
  description: string
}> = [
  { slug: 'wordle', name: 'Wordle', description: 'Guess the hidden word with positional feedback.' },
  { slug: 'scramble', name: 'Scramble', description: 'Unscramble letters before the timer runs out.' },
  { slug: 'spelling-bee', name: 'Spelling Bee', description: 'Find words that obey the center letter rule.' },
  { slug: 'speed', name: 'Speed Vocab', description: 'Answer definition questions before time expires.' },
  { slug: 'quiz', name: 'Quiz', description: 'Multiple-choice vocabulary rounds with instant feedback.' },
]
