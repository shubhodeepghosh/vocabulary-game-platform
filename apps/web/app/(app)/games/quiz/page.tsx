'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type {
  Difficulty,
  QuizAnswerResponse,
  QuizQuestion,
  QuizStartResponse,
} from '@keen/types'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import { apiFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GameScene } from '@/components/game-scene'
import { GameResultOverlay } from '@/components/game-result-overlay'
import { playErrorSound, playSuccessSound, playTapSound } from '@/lib/sound'
import { useAuthStore } from '@/store/auth-store'
import { useGameStore } from '@/store/game-store'
import { cn } from '@/lib/utils'

export default function QuizPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('Answer the prompt and review the explanation.')
  const [answerReveal, setAnswerReveal] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [pendingQuestion, setPendingQuestion] = useState<QuizQuestion | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const setGameSession = useGameStore((state) => state.setSession)
  const updateScore = useGameStore((state) => state.updateScore)
  const clearSession = useGameStore((state) => state.clearSession)

  const startGame = useCallback(async (withSound = false) => {
    if (withSound) playTapSound()
    setIsBusy(true)
    try {
      const data = await apiFetch<QuizStartResponse>('/games/quiz/start', {
        method: 'POST',
        body: JSON.stringify({ difficulty }),
      })
      setSessionId(data.sessionId)
      setQuestion(data.question)
      setPendingQuestion(null)
      setAnswerReveal(null)
      setSelectedAnswer(null)
      setScore(data.score)
      setFeedback('Round one is ready.')
      setLoadError(null)
      setGameSession({
        gameType: 'quiz',
        sessionId: data.sessionId,
        difficulty,
        score: data.score,
      })
      updateScore(data.score)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load quiz')
    } finally {
      setIsBusy(false)
    }
  }, [difficulty, setGameSession, updateScore])

  useEffect(() => {
    void startGame()
    return () => clearSession()
  }, [clearSession, startGame])

  const submitAnswer = async (answerIndex: number) => {
    if (!sessionId || !question) return
    playTapSound()
    setSelectedAnswer(answerIndex)
    setIsBusy(true)
    try {
      const response = await apiFetch<QuizAnswerResponse>('/games/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({ sessionId, answerIndex }),
      })
      setScore(response.score)
      updateScore(response.score)
      setAnswerReveal(response.answerIndex)
      setFeedback(
        response.correct
          ? `Correct. ${response.explanation}`
          : `Not quite. ${response.explanation}`
      )
      if (response.correct) playSuccessSound()
      else playErrorSound()
      setPendingQuestion(response.nextQuestion ?? null)
      if (response.finished) {
        setQuestion(null)
        void useAuthStore.getState().refreshStats()
      }
    } catch (error) {
      playErrorSound()
      setFeedback(error instanceof Error ? error.message : 'Unable to submit answer')
    } finally {
      setIsBusy(false)
    }
  }

  const moveNext = () => {
    if (!pendingQuestion) {
      setQuestion(null)
      return
    }
    setQuestion(pendingQuestion)
    setPendingQuestion(null)
    setAnswerReveal(null)
    setSelectedAnswer(null)
    setFeedback('Next question ready.')
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
    <GameScene gameId="quiz">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Quiz</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Five multiple-choice rounds with instant explanations.
            </p>
          </div>
          <Link href="/games">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full bg-white/70 shadow-sm">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <Card className="space-y-6 border-white/70 bg-white/62 p-6 shadow-[0_24px_90px_-44px_rgba(34,211,238,0.3)] backdrop-blur-2xl">
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
                    ? 'border-cyan-300/80 bg-cyan-500 text-white shadow-[0_12px_24px_-16px_rgba(34,211,238,0.8)] hover:bg-cyan-500'
                    : 'border-white/80 bg-white/80 text-foreground hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-cyan-50',
                )}
              >
                {option}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void startGame(true)}
              className="rounded-full border-white/80 bg-white/80 shadow-sm hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-amber-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-cyan-200/70 bg-gradient-to-br from-cyan-100/90 via-white/85 to-blue-100/75 p-5 shadow-inner shadow-white/50">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Score
              </p>
              <p className="mt-3 text-4xl font-black text-foreground">{score}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Keep the momentum and chase the next perfect streak.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-gradient-to-br from-amber-100/85 via-white/80 to-rose-100/70 p-5 shadow-[0_16px_44px_-26px_rgba(251,146,60,0.35)]">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Current round
              </p>
              <p className="mt-3 text-4xl font-black text-foreground">
                {question?.round ?? 5}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Five quick questions, each with instant learning feedback.
              </p>
            </div>
          </div>

          <div className={cn(
            'rounded-[1.25rem] border px-4 py-3 text-sm shadow-sm',
            feedback.includes('Correct')
              ? 'border-emerald-200/70 bg-emerald-500/10 text-emerald-800'
              : feedback.includes('Not quite')
                ? 'border-rose-200/70 bg-rose-500/10 text-rose-800'
                : 'border-white/70 bg-white/72 text-foreground',
          )}>
            {feedback}
          </div>

          {question ? (
            <>
              <div className="rounded-[1.5rem] border border-white/70 bg-gradient-to-br from-indigo-100/85 via-white/80 to-cyan-50/80 p-6 shadow-[0_16px_44px_-28px_rgba(79,70,229,0.3)]">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Prompt
                </p>
                <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
                  {question.prompt}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {question.options.map((option, index) => (
                  <button
                    key={option}
                    disabled={answerReveal !== null || isBusy}
                    onClick={() => void submitAnswer(index)}
                    className={`rounded-[1.35rem] border px-5 py-4 text-left transition-all duration-200 ${
                      answerReveal === index
                        ? 'border-emerald-300/70 bg-emerald-500/12 text-emerald-900 shadow-[0_14px_26px_-18px_rgba(16,185,129,0.8)]'
                        : answerReveal !== null && selectedAnswer === index
                          ? 'border-rose-300/70 bg-rose-500/12 text-rose-900 shadow-[0_14px_26px_-18px_rgba(244,63,94,0.7)]'
                          : answerReveal !== null
                            ? 'border-white/70 bg-white/70 text-muted-foreground'
                            : 'border-white/70 bg-white/82 text-foreground hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-cyan-50/80'
                    }`}
                  >
                    <p className="text-sm font-semibold">{option}</p>
                  </button>
                ))}
              </div>

              {answerReveal !== null && (
                <Button onClick={moveNext} className="rounded-full shadow-[0_14px_28px_-18px_rgba(34,211,238,0.7)]">
                  {pendingQuestion ? 'Continue' : 'Finish run'}
                </Button>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-lg font-semibold text-foreground">Quiz complete</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Restart to try a harder run.
              </p>
            </div>
          )}
        </Card>

      <GameResultOverlay
        open={question === null && !loadError}
        tone="complete"
        title="Quiz complete"
        description={`You finished the run on ${score} points. Restart for a sharper score or increase the difficulty.`}
        primaryAction={{
          label: 'Play again',
          onClick: () => void startGame(true),
        }}
      />
      </div>
    </GameScene>
  )
}
