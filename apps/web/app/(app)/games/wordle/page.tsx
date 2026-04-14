'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Difficulty, WordleGuessResponse, WordleStartResponse } from '@keen/types'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GameScene } from '@/components/game-scene'
import { GameResultOverlay } from '@/components/game-result-overlay'
import { playErrorSound, playSuccessSound, playTapSound } from '@/lib/sound'
import { useAuthStore } from '@/store/auth-store'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import { useGameStore } from '@/store/game-store'

type GuessRow = WordleGuessResponse['evaluation']

const statusColor = {
  correct: 'bg-green-500 text-white',
  present: 'bg-yellow-500 text-white',
  absent: 'bg-zinc-400 text-white',
}

export default function WordlePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [session, setSession] = useState<WordleStartResponse | null>(null)
  const [guesses, setGuesses] = useState<GuessRow[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [result, setResult] = useState<WordleGuessResponse['status']>('active')
  const [message, setMessage] = useState('Solve the clue to start your streak.')
  const [answer, setAnswer] = useState<string | undefined>()
  const [isBusy, setIsBusy] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const setGameSession = useGameStore((state) => state.setSession)
  const updateScore = useGameStore((state) => state.updateScore)
  const clearSession = useGameStore((state) => state.clearSession)

  const startGame = useCallback(async (withSound = false) => {
    if (withSound) playTapSound()
    setIsBusy(true)
    try {
      const data = await apiFetch<WordleStartResponse>('/games/wordle/start', {
        method: 'POST',
        body: JSON.stringify({ difficulty }),
      })
      setSession(data)
      setGuesses([])
      setCurrentGuess('')
      setResult('active')
      setMessage('New round ready. Type your first guess.')
      setAnswer(undefined)
      setLoadError(null)
      setGameSession({
        gameType: 'wordle',
        sessionId: data.sessionId,
        difficulty: data.difficulty,
        score: 0,
      })
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load puzzle')
    } finally {
      setIsBusy(false)
    }
  }, [difficulty, setGameSession])

  useEffect(() => {
    void startGame()
    return () => clearSession()
  }, [clearSession, startGame])

  const submitGuess = async () => {
    if (!session || result !== 'active' || currentGuess.length !== session.wordLength) {
      return
    }

    playTapSound()
    setIsBusy(true)
    try {
      const response = await apiFetch<WordleGuessResponse>('/games/wordle/guess', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.sessionId,
          guess: currentGuess,
        }),
      })
      setGuesses((current) => [...current, response.evaluation])
      setCurrentGuess('')
      setResult(response.status)
      setAnswer(response.answer)
      updateScore(response.score)

      if (response.status === 'won') {
        playSuccessSound()
        setMessage(`Perfect. You solved it in ${response.attemptsUsed} tries.`)
        void useAuthStore.getState().refreshStats()
      } else if (response.status === 'lost') {
        playErrorSound()
        setMessage(`Round over. The answer was ${response.answer}.`)
        void useAuthStore.getState().refreshStats()
      } else {
        playTapSound()
        setMessage('Close. Use the colors and go again.')
        setShakeKey((value) => value + 1)
      }
    } catch (error) {
      playErrorSound()
      setMessage(error instanceof Error ? error.message : 'Unable to submit guess')
      setShakeKey((value) => value + 1)
    } finally {
      setIsBusy(false)
    }
  }

  const remainingRows = useMemo(() => {
    if (!session) return []
    return Array.from({
      length: Math.max(0, session.maxAttempts - guesses.length - (result === 'active' ? 1 : 0)),
    })
  }, [guesses.length, result, session])
  const showOverlay = result !== 'active'

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground">
            {loadError ?? 'Loading Wordle...'}
          </p>
          {loadError && (
            <Button onClick={() => void startGame()} variant="outline">
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <GameScene gameId="wordle">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Wordle</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crack the hidden word with six or fewer guesses.
          </p>
        </div>
        <Link href="/games">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-3">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((option) => (
            <Button
              key={option}
              variant={difficulty === option ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                playTapSound()
                setDifficulty(option)
              }}
            >
              {option}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => void startGame(true)}>
            New Puzzle
          </Button>
        </div>

        <div className="rounded-xl bg-primary/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Clue
          </p>
          <p className="mt-2 text-foreground">{session.clue}</p>
        </div>

        <motion.div
          key={shakeKey}
          animate={message.includes('Unable') ? { x: [0, -8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.28 }}
          className={`rounded-xl border px-4 py-3 text-sm ${
            result === 'won'
              ? 'border-green-500/30 bg-green-500/10 text-green-700'
              : result === 'lost'
                ? 'border-red-500/30 bg-red-500/10 text-red-700'
                : 'border-border bg-muted/40 text-foreground'
          }`}
        >
          {message}
        </motion.div>

        <div className="space-y-2">
          {guesses.map((guess, guessIndex) => (
            <div key={guessIndex} className="flex gap-2">
              {guess.map((cell, cellIndex) => (
                <motion.div
                  key={`${guessIndex}-${cellIndex}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22, delay: cellIndex * 0.04 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold uppercase ${statusColor[cell.status]}`}
                >
                  {cell.letter}
                </motion.div>
              ))}
            </div>
          ))}

          {result === 'active' && (
            <div className="flex gap-2">
              {Array.from({ length: session.wordLength }).map((_, index) => (
                <motion.div
                  key={index}
                  animate={shakeKey ? { x: [0, -3, 3, 0] } : {}}
                  transition={{ duration: 0.24 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-lg font-semibold uppercase ${
                    index < currentGuess.length
                      ? 'border-primary bg-muted text-foreground'
                      : 'border-border bg-card'
                  }`}
                >
                  {currentGuess[index]}
                </motion.div>
              ))}
            </div>
          )}

          {remainingRows.map((_, rowIndex) => (
            <div key={`empty-${rowIndex}`} className="flex gap-2">
              {Array.from({ length: session.wordLength }).map((__, cellIndex) => (
                <div
                  key={cellIndex}
                  className="h-12 w-12 rounded-xl border-2 border-border bg-card"
                />
              ))}
            </div>
          ))}
        </div>

        {result === 'active' ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={currentGuess}
              onChange={(event) =>
                setCurrentGuess(event.target.value.slice(0, session.wordLength).toUpperCase())
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') void submitGuess()
              }}
              placeholder={`Enter a ${session.wordLength}-letter word`}
              className="h-12"
            />
            <Button className="h-12 sm:w-32" onClick={() => void submitGuess()} disabled={isBusy}>
              Guess
            </Button>
          </div>
        ) : (
          <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            Final answer: <span className="font-semibold text-foreground">{answer}</span>
          </div>
        )}

        <Button variant={result === 'active' ? 'outline' : 'default'} onClick={() => void startGame(true)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {result === 'active' ? 'Reset puzzle' : 'Play again'}
        </Button>
      </Card>

      <GameResultOverlay
        open={showOverlay}
        tone={result === 'won' ? 'win' : 'lose'}
        title={
          result === 'won'
            ? `Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 'es'}`
            : 'The word slipped away'
        }
        description={
          result === 'won'
            ? `Nice work. The answer was ${answer ?? 'that word'}.`
            : `The answer was ${answer ?? 'that word'}. Start another round and keep the streak alive.`
        }
        primaryAction={{
          label: result === 'won' ? 'Play again' : 'Try again',
          onClick: () => void startGame(true),
        }}
      />
      </div>
    </GameScene>
  )
}
