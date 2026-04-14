'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'

const WORD_LENGTH = 5
const MAX_GUESSES = 6

interface GuessResult {
  letter: string
  status: 'correct' | 'present' | 'absent'
}

type LetterStatus = 'correct' | 'present' | 'absent' | 'unused'

export default function WordlePage() {
  const router = useRouter()
  const [word, setWord] = useState('')
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [wordDefinition, setWordDefinition] = useState('')

  // Load word on mount
  useEffect(() => {
    const loadWord = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('words')
        .select('word, definition')
        .eq('length', WORD_LENGTH)
        .order('random()', { ascending: true })
        .limit(1)
        .single()

      if (data) {
        setWord(data.word.toUpperCase())
        setWordDefinition(data.definition)
      } else {
        setWord('REACT')
        setWordDefinition('A JavaScript library for building user interfaces')
      }
      setLoading(false)
    }

    loadWord()
  }, [])

  const evaluateGuess = (guess: string): GuessResult[] => {
    const result: GuessResult[] = []
    const wordLetters = word.split('')
    const guessLetters = guess.toUpperCase().split('')
    const used: boolean[] = new Array(WORD_LENGTH).fill(false)

    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === wordLetters[i]) {
        result[i] = { letter: guessLetters[i], status: 'correct' }
        used[i] = true
      }
    }

    // Second pass: mark present and absent letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!result[i]) {
        const letterIndex = wordLetters.findIndex(
          (l, idx) => l === guessLetters[i] && !used[idx]
        )
        if (letterIndex !== -1) {
          result[i] = { letter: guessLetters[i], status: 'present' }
          used[letterIndex] = true
        } else {
          result[i] = { letter: guessLetters[i], status: 'absent' }
        }
      }
    }

    return result
  }

  const handleGuess = useCallback(async () => {
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage('Word must be 5 letters')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    const newGuesses = [...guesses, currentGuess.toUpperCase()]
    setGuesses(newGuesses)

    if (currentGuess.toUpperCase() === word) {
      setWon(true)
      setGameOver(true)
      setMessage('You won!')

      // Save game result
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('game_sessions').insert({
          user_id: user.id,
          game_type: 'wordle',
          score: Math.round(((MAX_GUESSES - newGuesses.length + 1) / MAX_GUESSES) * 100),
          completed: true,
        })
      }
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true)
      setMessage(`Game Over! The word was ${word}`)

      // Save game result
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('game_sessions').insert({
          user_id: user.id,
          game_type: 'wordle',
          score: 0,
          completed: true,
        })
      }
    }

    setCurrentGuess('')
  }, [currentGuess, word, guesses])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGuess()
    }
  }

  const handleReset = () => {
    setGuesses([])
    setCurrentGuess('')
    setGameOver(false)
    setWon(false)
    setMessage('')
    setLoading(true)

    // Load new word
    const loadWord = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('words')
        .select('word, definition')
        .eq('length', WORD_LENGTH)
        .order('random()', { ascending: true })
        .limit(1)
        .single()

      if (data) {
        setWord(data.word.toUpperCase())
        setWordDefinition(data.definition)
      }
      setLoading(false)
    }

    loadWord()
  }

  const getLetterColor = (status: LetterStatus): string => {
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white'
      case 'present':
        return 'bg-yellow-500 text-white'
      case 'absent':
        return 'bg-gray-400 text-white'
      default:
        return 'bg-muted text-foreground'
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Wordle</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guess the word in {MAX_GUESSES} attempts
          </p>
        </div>
        <Link href="/games">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="space-y-6 p-6">
        {/* Hint */}
        <div className="rounded-lg bg-primary/10 p-4">
          <p className="text-xs text-muted-foreground">Hint:</p>
          <p className="mt-1 text-foreground">{wordDefinition}</p>
        </div>

        {/* Guesses Display */}
        <div className="space-y-2">
          {guesses.map((guess, guessIdx) => (
            <div key={guessIdx} className="flex gap-2">
              {evaluateGuess(guess).map((result, letterIdx) => (
                <div
                  key={letterIdx}
                  className={`flex h-12 w-12 items-center justify-center rounded-lg font-semibold text-lg ${getLetterColor(
                    result.status
                  )}`}
                >
                  {result.letter}
                </div>
              ))}
            </div>
          ))}

          {/* Current Guess */}
          {!gameOver && (
            <div className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 font-semibold text-lg ${
                    i < currentGuess.length
                      ? 'border-primary bg-muted text-foreground'
                      : 'border-border'
                  }`}
                >
                  {currentGuess[i]?.toUpperCase()}
                </div>
              ))}
            </div>
          )}

          {/* Empty rows for remaining guesses */}
          {!gameOver &&
            Array.from({
              length: MAX_GUESSES - guesses.length - 1,
            }).map((_, rowIdx) => (
              <div key={`empty-${rowIdx}`} className="flex gap-2">
                {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="h-12 w-12 rounded-lg border-2 border-border"
                  ></div>
                ))}
              </div>
            ))}
        </div>

        {/* Input and Controls */}
        {!gameOver && (
          <div className="flex gap-2">
            <input
              type="text"
              value={currentGuess}
              onChange={(e) =>
                setCurrentGuess(e.target.value.slice(0, WORD_LENGTH))
              }
              onKeyPress={handleKeyPress}
              placeholder="Enter your guess..."
              maxLength={WORD_LENGTH}
              autoFocus
              className="flex-1 rounded-lg border border-border bg-input px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
            <Button onClick={handleGuess}>Guess</Button>
          </div>
        )}

        {/* Game Over Message */}
        {gameOver && (
          <div className="rounded-lg bg-card p-4 text-center">
            <p
              className={`text-lg font-semibold ${
                won ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {won
                ? `You found it in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}!`
                : `The word was ${word}`}
            </p>
          </div>
        )}

        {/* Reset Button */}
        <Button
          onClick={handleReset}
          className="w-full gap-2"
          variant={gameOver ? 'default' : 'outline'}
        >
          <RotateCcw className="h-4 w-4" />
          {gameOver ? 'Play Again' : 'New Game'}
        </Button>
      </Card>

      {/* Guesses Left Info */}
      <Card className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {gameOver
            ? 'Game Over'
            : `Guesses Remaining: ${MAX_GUESSES - guesses.length}`}
        </p>
      </Card>
    </div>
  )
}
