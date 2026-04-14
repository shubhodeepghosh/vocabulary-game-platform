'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type {
  Difficulty,
  ScrambleStartResponse,
  ScrambleSubmitResponse,
} from '@keen/types'
import { ChevronLeft, Lightbulb, RotateCcw } from 'lucide-react'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GameResultOverlay } from '@/components/game-result-overlay'
import { playErrorSound, playSuccessSound, playTapSound } from '@/lib/sound'
import { useAuthStore } from '@/store/auth-store'
import { useGameStore } from '@/store/game-store'

export default function ScramblePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [session, setSession] = useState<ScrambleStartResponse | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('Start a round and unscramble the word.')
  const [status, setStatus] = useState<'active' | 'won' | 'lost'>('active')
  const [hint, setHint] = useState('')
  const [hintsRemaining, setHintsRemaining] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isBusy, setIsBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const [correctWord, setCorrectWord] = useState<string | null>(null)
  const [finalScore, setFinalScore] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const setGameSession = useGameStore((state) => state.setSession)
  const updateScore = useGameStore((state) => state.updateScore)
  const clearSession = useGameStore((state) => state.clearSession)

  const startGame = useCallback(async (withSound = false) => {
    if (withSound) playTapSound()
    setIsBusy(true)
    try {
      const data = await apiFetch<ScrambleStartResponse>('/games/scramble/start', {
        method: 'POST',
        body: JSON.stringify({ difficulty }),
      })
      setSession(data)
      setHint(data.hint)
      setHintsRemaining(data.maxHints)
      setTimeLeft(data.timeLimitSeconds)
      setAnswer('')
      setFeedback('Round live. Rearrange the letters and beat the clock.')
      setStatus('active')
      setCorrectWord(null)
      setFinalScore(0)
      setLoadError(null)
      setGameSession({
        gameType: 'scramble',
        sessionId: data.sessionId,
        difficulty: data.difficulty,
        score: 0,
      })
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load round')
    } finally {
      setIsBusy(false)
    }
  }, [difficulty, setGameSession])

  useEffect(() => {
    void startGame()
    return () => clearSession()
  }, [clearSession, startGame])

  useEffect(() => {
    if (!session || status !== 'active' || timeLeft <= 0) return
    const timeout = window.setTimeout(() => setTimeLeft((current) => current - 1), 1000)
    return () => window.clearTimeout(timeout)
  }, [session, status, timeLeft])

  useEffect(() => {
    if (!session || status !== 'active' || timeLeft > 0) return
    void submitRound()
  }, [session, status, timeLeft])

  const applyResult = (response: ScrambleSubmitResponse) => {
    setStatus(response.status)
    setFinalScore(response.score)
    updateScore(response.score)
    if (response.hint) setHint(response.hint)
    setHintsRemaining(response.hintsRemaining)
    if (response.correctWord) setCorrectWord(response.correctWord)
    if (response.status === 'won') {
      playSuccessSound()
      setFeedback(`Correct. ${response.correctWord ?? 'the word'} locked in for ${response.score} points.`)
      void useAuthStore.getState().refreshStats()
    } else if (response.status === 'lost') {
      playErrorSound()
      setFeedback(`Time is up. The word was ${response.correctWord ?? 'the word'}.`)
      void useAuthStore.getState().refreshStats()
    } else {
      playTapSound()
      setFeedback(response.hint ? 'Hint unlocked. Keep going.' : 'Not quite. Try a different arrangement.')
      setShake(true)
      window.setTimeout(() => setShake(false), 250)
    }
  }

  const submitRound = async (requestHint = false) => {
    if (!session) return
    if (!requestHint) playTapSound()
    setIsBusy(true)
    try {
      const response = await apiFetch<ScrambleSubmitResponse>('/games/scramble/submit', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.sessionId,
          answer: requestHint ? undefined : answer,
          requestHint,
        }),
      })
      applyResult(response)
      if (!requestHint && response.status === 'won') {
        setAnswer('')
      }
    } catch (error) {
      playErrorSound()
      setFeedback(error instanceof Error ? error.message : 'Unable to submit round')
    } finally {
      setIsBusy(false)
    }
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground">
            {loadError ?? 'Loading Scramble...'}
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Scramble</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Unscramble the letters before the timer expires.
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
            <RotateCcw className="mr-2 h-4 w-4" />
            New round
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl bg-primary/10 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Scrambled letters
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {session.scrambledWord.split('').map((letter, index) => (
                <motion.div
                  key={`${letter}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.04 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-2xl font-bold text-primary shadow-sm"
                >
                  {letter}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Timer
            </p>
            <p className={`mt-4 text-4xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-foreground'}`}>
              {timeLeft}s
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Hints left: {hintsRemaining}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{hint}</p>
          </div>
        </div>

        <motion.div
          animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.25 }}
          className={`rounded-xl px-4 py-3 text-sm ${
            status === 'won'
              ? 'bg-green-500/10 text-green-700'
              : status === 'lost'
                ? 'bg-red-500/10 text-red-700'
                : 'bg-muted/40 text-foreground'
          }`}
        >
          {feedback}
        </motion.div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={answer}
            onChange={(event) => setAnswer(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submitRound()
            }}
            placeholder="Type the original word"
            className="h-12"
            disabled={status !== 'active'}
          />
          <Button className="h-12 sm:w-32" onClick={() => void submitRound()} disabled={isBusy || status !== 'active' || !answer.trim()}>
            Submit
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => void submitRound(true)}
            disabled={isBusy || status !== 'active' || hintsRemaining <= 0}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Use hint
          </Button>
          <Button variant="outline" onClick={() => void startGame(true)}>
            Reset round
          </Button>
        </div>
      </Card>

      <GameResultOverlay
        open={status !== 'active'}
        tone={status === 'won' ? 'win' : 'lose'}
        title={status === 'won' ? 'Word cracked' : 'Time ran out'}
        description={
          status === 'won'
            ? `You solved ${correctWord ?? 'the word'} for ${finalScore} points.`
            : `The answer was ${correctWord ?? 'the word'}. Hit restart and go again.`
        }
        primaryAction={{
          label: 'New round',
          onClick: () => void startGame(true),
        }}
      />
    </div>
  )
}
