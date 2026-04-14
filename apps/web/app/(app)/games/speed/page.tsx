'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type {
  Difficulty,
  SpeedAnswerResponse,
  SpeedQuestion,
  SpeedStartResponse,
} from '@keen/types'
import { ChevronLeft, RotateCcw, Timer } from 'lucide-react'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GameResultOverlay } from '@/components/game-result-overlay'
import { playErrorSound, playSuccessSound, playTapSound } from '@/lib/sound'
import { useAuthStore } from '@/store/auth-store'
import { useGameStore } from '@/store/game-store'

export default function SpeedPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<SpeedQuestion | null>(null)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('Answer fast for bigger point swings.')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isBusy, setIsBusy] = useState(false)
  const [revealedAnswer, setRevealedAnswer] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const setGameSession = useGameStore((state) => state.setSession)
  const updateScore = useGameStore((state) => state.updateScore)
  const clearSession = useGameStore((state) => state.clearSession)

  const startGame = useCallback(async (withSound = false) => {
    if (withSound) playTapSound()
    setIsBusy(true)
    try {
      const data = await apiFetch<SpeedStartResponse>('/games/speed/start', {
        method: 'POST',
        body: JSON.stringify({ difficulty }),
      })
      setSessionId(data.sessionId)
      setQuestion(data.question)
      setScore(data.score)
      setTimeLeft(data.question.timeLimitSeconds)
      setFeedback('Round one is live. Pick the strongest definition.')
      setRevealedAnswer(null)
      setSelectedAnswer(null)
      setLoadError(null)
      setGameSession({
        gameType: 'speed',
        sessionId: data.sessionId,
        difficulty,
        score: data.score,
      })
      updateScore(data.score)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load run')
    } finally {
      setIsBusy(false)
    }
  }, [difficulty, setGameSession, updateScore])

  useEffect(() => {
    void startGame()
    return () => clearSession()
  }, [clearSession, startGame])

  useEffect(() => {
    if (!question || revealedAnswer !== null || timeLeft <= 0) return
    const timeout = window.setTimeout(() => setTimeLeft((current) => current - 1), 1000)
    return () => window.clearTimeout(timeout)
  }, [question, revealedAnswer, timeLeft])

  useEffect(() => {
    if (!question || !sessionId || timeLeft > 0 || revealedAnswer !== null) return
    void submitAnswer(0)
  }, [question, sessionId, timeLeft, revealedAnswer])

  const applyResponse = (response: SpeedAnswerResponse) => {
    setScore(response.score)
    updateScore(response.score)
    setRevealedAnswer(response.answerIndex)
    setFeedback(response.correct ? 'Correct. Speed bonus applied.' : 'Wrong pick. Reset and push on.')
    if (response.correct) playSuccessSound()
    else playErrorSound()

    window.setTimeout(() => {
      setRevealedAnswer(null)
      setSelectedAnswer(null)
      if (response.finished || !response.nextQuestion) {
        setQuestion(null)
        setFeedback(`Run complete. Final score: ${response.score}.`)
        void useAuthStore.getState().refreshStats()
        return
      }

      setQuestion(response.nextQuestion)
      setTimeLeft(response.nextQuestion.timeLimitSeconds)
      setFeedback(response.correct ? 'Next round.' : 'Next round. Recover quickly.')
    }, 850)
  }

  const submitAnswer = async (answerIndex: number) => {
    if (!sessionId || !question) return
    playTapSound()
    setSelectedAnswer(answerIndex)
    setIsBusy(true)
    try {
      const response = await apiFetch<SpeedAnswerResponse>('/games/speed/answer', {
        method: 'POST',
        body: JSON.stringify({ sessionId, answerIndex }),
      })
      applyResponse(response)
    } catch (error) {
      playErrorSound()
      setFeedback(error instanceof Error ? error.message : 'Unable to submit answer')
    } finally {
      setIsBusy(false)
    }
  }

  if (!question && loadError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground">{loadError}</p>
          <Button onClick={() => void startGame(true)} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Speed Vocab</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Timed definition rounds with dynamic difficulty scaling.
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
            Restart
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-primary/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Score
            </p>
            <p className="mt-3 text-4xl font-bold text-foreground">{score}</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Round
            </p>
            <p className="mt-3 text-4xl font-bold text-foreground">
              {question?.round ?? 5}
            </p>
          </div>
          <div className="rounded-2xl bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              Timer
            </div>
            <p className={`mt-3 text-4xl font-bold ${timeLeft <= 3 ? 'text-red-500' : 'text-foreground'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>

        {question ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Prompt
              </p>
              <p className="mt-3 text-xl font-semibold text-foreground">
                {question.prompt}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {question.options.map((option, index) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: revealedAnswer === null ? 1.01 : 1 }}
                  disabled={revealedAnswer !== null || isBusy}
                  onClick={() => void submitAnswer(index)}
                  className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                    revealedAnswer === index
                      ? 'border-green-500 bg-green-500/10 text-green-700'
                      : revealedAnswer !== null && selectedAnswer === index
                        ? 'border-red-500 bg-red-500/10 text-red-700'
                      : revealedAnswer !== null
                        ? 'border-border bg-muted/30 text-muted-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <p className="text-sm font-medium">{option}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-lg font-semibold text-foreground">Run complete</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Restart to chase a better score.
            </p>
          </div>
        )}
      </Card>

      <GameResultOverlay
        open={question === null && !loadError}
        tone="complete"
        title="Run complete"
        description={`You finished with ${score} points. Restart to beat that number or push the difficulty higher.`}
        primaryAction={{
          label: 'Run it back',
          onClick: () => void startGame(true),
        }}
      />
    </div>
  )
}
