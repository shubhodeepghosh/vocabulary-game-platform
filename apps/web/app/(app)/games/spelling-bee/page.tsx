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

      <Card className="space-y-6 p-6">
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

        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl bg-muted/60 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Score
            </p>
            <p className="mt-3 text-4xl font-bold text-foreground">{session.score}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Minimum word length: {session.minimumLength}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {session.letters.map((letter) => (
                <motion.div
                  key={letter}
                  whileHover={{ scale: 1.03 }}
                  className={`flex h-16 items-center justify-center rounded-2xl text-2xl font-bold ${
                    letter === session.centerLetter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground'
                  }`}
                >
                  {letter}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
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
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                accepted === true
                  ? 'bg-green-500/10 text-green-700'
                  : accepted === false
                    ? 'bg-red-500/10 text-red-700'
                    : 'bg-muted/40 text-foreground'
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
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
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
