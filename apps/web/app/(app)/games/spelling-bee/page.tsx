'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type {
  Difficulty,
  SpellingBeeStartResponse,
  SpellingBeeSubmitResponse,
} from '@keen/types'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GameScene } from '@/components/game-scene'
import { GameResultOverlay } from '@/components/game-result-overlay'
import { playErrorSound, playSuccessSound, playTapSound } from '@/lib/sound'
import { useAuthStore } from '@/store/auth-store'
import { useGameStore } from '@/store/game-store'

export default function SpellingBeePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [session, setSession] = useState<SpellingBeeStartResponse | null>(null)
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState('Every word must use the center letter.')
  const [accepted, setAccepted] = useState<boolean | null>(null)
  const [roundComplete, setRoundComplete] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const setGameSession = useGameStore((state) => state.setSession)
  const updateScore = useGameStore((state) => state.updateScore)
  const clearSession = useGameStore((state) => state.clearSession)

  const startGame = useCallback(async (withSound = false) => {
    if (withSound) playTapSound()
    setIsBusy(true)
    try {
      const data = await apiFetch<SpellingBeeStartResponse>('/games/spelling-bee/start', {
        method: 'POST',
        body: JSON.stringify({ difficulty }),
      })
      setSession(data)
      setValue('')
      setFeedback('Round ready. Start chaining valid words.')
      setAccepted(null)
      setRoundComplete(false)
      setLoadError(null)
      setGameSession({
        gameType: 'spelling-bee',
        sessionId: data.sessionId,
        difficulty: data.difficulty,
        score: data.score,
      })
      updateScore(data.score)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load puzzle')
    } finally {
      setIsBusy(false)
    }
  }, [difficulty, setGameSession, updateScore])

  useEffect(() => {
    void startGame()
    return () => clearSession()
  }, [clearSession, startGame])

  const submitWord = async (finalize = false) => {
    if (!session) return
    if (!finalize) playTapSound()
    setIsBusy(true)
    try {
      const response = await apiFetch<SpellingBeeSubmitResponse>('/games/spelling-bee/submit', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.sessionId,
          word: finalize ? undefined : value,
          finalize,
        }),
      })
      setSession((current) =>
        current
          ? { ...current, foundWords: response.foundWords, score: response.score }
          : current
      )
      setAccepted(response.accepted)
      setFeedback(response.message)
      setValue('')
      updateScore(response.score)
      if (response.accepted) playSuccessSound()
      else playErrorSound()
      if (response.completed) {
        setRoundComplete(true)
        void useAuthStore.getState().refreshStats()
      }
    } catch (error) {
      playErrorSound()
      setAccepted(false)
      setFeedback(error instanceof Error ? error.message : 'Unable to submit word')
    } finally {
      setIsBusy(false)
    }
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground">
            {loadError ?? 'Loading Spelling Bee...'}
          </p>
          {loadError && (
            <Button onClick={() => void startGame(true)} variant="outline">
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <GameScene gameId="spelling-bee">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Spelling Bee</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Build words from the letter set and always include the center tile.
            </p>
          </div>
          <Link href="/games">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <Card className="space-y-6 border-white/60 bg-white/58 p-6 shadow-[0_24px_90px_-42px_rgba(245,158,11,0.42)] backdrop-blur-2xl">
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
              <RotateCcw className="mr-2 h-4 w-4" />
              New puzzle
            </Button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.02fr_1.08fr]">
            <div className="rounded-[1.5rem] border border-amber-200/60 bg-gradient-to-br from-amber-100/90 via-white/85 to-orange-100/75 p-5 shadow-inner shadow-white/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Score
                  </p>
                  <p className="mt-2 text-5xl font-black text-foreground">{session.score}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Minimum word length: {session.minimumLength}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-white/75 px-3 py-2 text-right shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Hive</p>
                  <p className="text-lg font-bold text-foreground">{session.foundWords.length} found</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex gap-3">
                  {session.letters.slice(0, 2).map((letter, index) => (
                    <HoneyTile key={`${letter}-${index}`} letter={letter} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {session.letters.slice(2, 3).map((letter, index) => (
                    <HoneyTile key={`${letter}-${index}`} letter={letter} />
                  ))}
                  <HoneyTile letter={session.centerLetter} center />
                  {session.letters.slice(3, 4).map((letter, index) => (
                    <HoneyTile key={`${letter}-${index}`} letter={letter} />
                  ))}
                </div>
                <div className="flex gap-3">
                  {session.letters.slice(4, 6).map((letter, index) => (
                    <HoneyTile key={`${letter}-${index}`} letter={letter} />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/60 bg-white/72 p-5 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.3)]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={value}
                  onChange={(event) => setValue(event.target.value.toLowerCase())}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void submitWord()
                  }}
                  placeholder="Type a valid word"
                  className="h-12"
                />
                <Button className="h-12 sm:w-28" onClick={() => void submitWord()} disabled={isBusy}>
                  Submit
                </Button>
              </div>

              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                  accepted === true
                    ? 'border border-emerald-200/70 bg-emerald-500/10 text-emerald-800'
                    : accepted === false
                      ? 'border border-rose-200/70 bg-rose-500/10 text-rose-800'
                      : 'border border-white/60 bg-white/70 text-foreground'
                }`}
              >
                {feedback}
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-foreground">Found words</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.foundWords.length ? (
                    session.foundWords.map((word) => (
                      <span
                        key={word}
                        className="rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-sm text-amber-900 shadow-sm"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No words found yet. Start with a short one.
                    </p>
                  )}
                </div>
              </div>

              <Button
                className="mt-6"
                variant="outline"
                onClick={() => void submitWord(true)}
                disabled={isBusy}
              >
                Finish round
              </Button>
            </div>
          </div>
        </Card>

        <GameResultOverlay
          open={roundComplete}
          tone="win"
          title="Puzzle cleared"
          description={`You found ${session.foundWords.length} valid word${session.foundWords.length === 1 ? '' : 's'} and scored ${session.score} points.`}
          primaryAction={{
            label: 'New puzzle',
            onClick: () => void startGame(true),
          }}
        />
      </div>
    </GameScene>
  )
}

function HoneyTile({
  letter,
  center = false,
}: {
  letter: string
  center?: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: center ? 0 : -1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex h-16 w-16 items-center justify-center border border-white/70 text-2xl font-black uppercase shadow-[0_12px_30px_-16px_rgba(15,23,42,0.35)]',
        center
          ? 'rounded-[1.25rem] bg-gradient-to-br from-amber-400 via-orange-300 to-rose-300 text-white ring-4 ring-amber-200/60'
          : 'rounded-[1.25rem] bg-white/85 text-foreground backdrop-blur-sm',
      )}
      style={{
        clipPath:
          'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)',
      }}
    >
      {letter}
    </motion.div>
  )
}
