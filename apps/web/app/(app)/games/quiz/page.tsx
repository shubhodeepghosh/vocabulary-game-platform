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
import { GameResultOverlay } from '@/components/game-result-overlay'
import { playErrorSound, playSuccessSound, playTapSound } from '@/lib/sound'
import { useAuthStore } from '@/store/auth-store'
import { useGameStore } from '@/store/game-store'

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Quiz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Five multiple-choice rounds with instant explanations.
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-primary/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Score
            </p>
            <p className="mt-3 text-4xl font-bold text-foreground">{score}</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Current round
            </p>
            <p className="mt-3 text-4xl font-bold text-foreground">
              {question?.round ?? 5}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>

        {question ? (
          <>
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
                <button
                  key={option}
                  disabled={answerReveal !== null || isBusy}
                  onClick={() => void submitAnswer(index)}
                  className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                    answerReveal === index
                      ? 'border-green-500 bg-green-500/10 text-green-700'
                      : answerReveal !== null && selectedAnswer === index
                        ? 'border-red-500 bg-red-500/10 text-red-700'
                      : answerReveal !== null
                        ? 'border-border bg-muted/30 text-muted-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <p className="text-sm font-medium">{option}</p>
                </button>
              ))}
            </div>

            {answerReveal !== null && (
              <Button onClick={moveNext}>
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
  )
}
