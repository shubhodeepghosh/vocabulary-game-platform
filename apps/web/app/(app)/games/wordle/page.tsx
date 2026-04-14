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
import { cn } from '@/lib/utils'

type GuessRow = WordleGuessResponse['evaluation']

const statusColor = {
  correct: 'border-emerald-300/70 bg-emerald-500 text-white shadow-[0_12px_24px_-14px_rgba(16,185,129,0.8)]',
  present: 'border-amber-300/70 bg-amber-400 text-white shadow-[0_12px_24px_-14px_rgba(245,158,11,0.8)]',
  absent: 'border-slate-300/70 bg-slate-400 text-white shadow-[0_12px_24px_-14px_rgba(100,116,139,0.8)]',
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
            <Button variant="ghost" size="sm" className="gap-2 rounded-full bg-white/70 shadow-sm">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <Card className="space-y-5 border-white/70 bg-white/65 p-6 shadow-[0_24px_90px_-44px_rgba(14,116,144,0.32)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((option) => (
              <Button
                key={option}
                variant="outline"
                size="sm"
                onClick={() => {
                  playTapSound()
                  setDifficulty(option)
                }}
                className={cn(
                  'rounded-full transition-all duration-200',
                  difficulty === option
                    ? 'border-sky-300/80 bg-sky-500 text-white shadow-[0_12px_24px_-16px_rgba(14,165,233,0.8)] hover:bg-sky-500'
                    : 'border-white/80 bg-white/80 text-foreground hover:-translate-y-0.5 hover:border-sky-300/70 hover:bg-sky-50',
                )}
              >
                {option}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => void startGame(true)} className="rounded-full border-white/80 bg-white/80 shadow-sm hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-cyan-50">
              New Puzzle
            </Button>
          </div>

        <div className="rounded-[1.35rem] border border-sky-200/70 bg-gradient-to-r from-sky-100/85 via-cyan-50/85 to-teal-50/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Clue
          </p>
          <p className="mt-2 text-foreground">{session.clue}</p>
        </div>

        <motion.div
          key={shakeKey}
          animate={message.includes('Unable') ? { x: [0, -8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.28 }}
          className={`rounded-[1.25rem] border px-4 py-3 text-sm shadow-sm ${
            result === 'won'
              ? 'border-emerald-200/70 bg-emerald-500/10 text-emerald-800'
              : result === 'lost'
                ? 'border-rose-200/70 bg-rose-500/10 text-rose-800'
                : 'border-white/70 bg-white/70 text-foreground'
          }`}
        >
          {message}
        </motion.div>

        <div className="rounded-[1.8rem] border border-white/70 bg-gradient-to-br from-sky-50/90 via-white/80 to-cyan-50/80 p-4 shadow-inner shadow-white/60">
        <div className="space-y-2">
          {guesses.map((guess, guessIndex) => (
            <div key={guessIndex} className="flex gap-2">
              {guess.map((cell, cellIndex) => (
                <motion.div
                  key={`${guessIndex}-${cellIndex}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22, delay: cellIndex * 0.04 }}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[1rem] border text-lg font-semibold uppercase sm:h-14 sm:w-14',
                    statusColor[cell.status],
                  )}
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
                  className={`flex h-12 w-12 items-center justify-center rounded-[1rem] border-2 text-lg font-semibold uppercase sm:h-14 sm:w-14 ${
                    index < currentGuess.length
                      ? 'border-sky-300/80 bg-sky-100 text-slate-900 shadow-[0_10px_20px_-14px_rgba(14,165,233,0.7)]'
                      : 'border-white/70 bg-white/85 text-slate-400 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.1)]'
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
                  className="h-12 w-12 rounded-[1rem] border-2 border-white/70 bg-white/72 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.12)] sm:h-14 sm:w-14"
                />
              ))}
            </div>
          ))}
        </div>
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

        <Button
          variant={result === 'active' ? 'outline' : 'default'}
          onClick={() => void startGame(true)}
          className={cn(
            'rounded-full',
            result === 'active'
              ? 'border-white/80 bg-white/80 shadow-sm hover:border-sky-300/70 hover:bg-sky-50'
              : 'shadow-[0_14px_28px_-18px_rgba(14,165,233,0.7)]',
          )}
        >
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
