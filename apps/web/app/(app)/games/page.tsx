'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  BarChart3,
  Trophy,
  BrainCircuit,
  Clock3,
  ChevronRight,
} from 'lucide-react'
import { gameCatalog } from '@/lib/game-catalog'
import { playTapSound } from '@/lib/sound'

interface Game {
  id: string
  name: string
  description: string
  fullDescription: string
  icon: React.ReactNode
  color: string
  href: string
  difficulty: string
}

export default function GamesPage() {
  const games: Game[] = [
    {
      id: 'wordle',
      name: 'Wordle',
      description: 'Guess the word in 6 attempts',
      fullDescription:
        'Classic word guessing game. You have 6 attempts to guess the hidden word. Each guess reveals if letters are in the correct position or exist in the word.',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      href: '/games/wordle',
      difficulty: 'Medium',
    },
    {
      id: 'scramble',
      name: 'Scramble',
      description: 'Untangle letters before the clock expires',
      fullDescription:
        'Every round scrambles a vocabulary word, tracks hint usage, and rewards fast clean solves.',
      icon: <BrainCircuit className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      href: '/games/scramble',
      difficulty: 'Easy',
    },
    {
      id: 'spelling-bee',
      name: 'Spelling Bee',
      description: 'Build as many valid words as you can',
      fullDescription:
        'A center-letter word hunt with scoring based on word length and a growing found-word list.',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'from-emerald-500 to-emerald-600',
      href: '/games/spelling-bee',
      difficulty: 'Hard',
    },
    {
      id: 'quiz',
      name: 'Quiz',
      description: 'Multiple choice definitions with instant feedback',
      fullDescription:
        'A five-round vocabulary quiz that explains every answer and tracks your accuracy.',
      icon: <Trophy className="h-8 w-8" />,
      color: 'from-cyan-500 to-cyan-600',
      href: '/games/quiz',
      difficulty: 'Medium',
    },
    {
      id: 'speed',
      name: 'Speed Vocab',
      description: 'Timed meaning rounds that ramp up fast',
      fullDescription:
        'Build score streaks by answering quickly while the difficulty and response pressure scale each round.',
      icon: <Clock3 className="h-8 w-8" />,
      color: 'from-orange-500 to-orange-600',
      href: '/games/speed',
      difficulty: 'Hard',
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">All Games</h2>
        <p className="mt-2 text-muted-foreground">
          Jump in instantly. Daily-style word selection runs automatically and guest sessions start without signup.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Ready for public play</p>
            <p className="text-sm text-muted-foreground">
              Open the link, share it, and let anyone jump into a session with no account.
            </p>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link href="/games/wordle" onClick={playTapSound}>
              Start with Wordle
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        {gameCatalog.map((game) => (
          <div key={game.id} className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-sm font-medium text-foreground">{game.name}</p>
            <p className="text-xs text-muted-foreground">{game.difficulty}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {games.map((game) => (
          <Card
            key={game.id}
            className="group flex flex-col overflow-hidden transition-all hover:shadow-lg"
          >
            <div
              className={`bg-gradient-to-br ${game.color} p-6 text-white`}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-white/20 p-3">
                  {game.icon}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {game.difficulty}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{game.name}</h3>
              <p className="mt-1 text-sm text-white/80">{game.description}</p>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="flex-1 text-sm text-muted-foreground">
                {game.fullDescription}
              </p>
              <Button asChild className="mt-4 w-full gap-2">
                <Link href={game.href} onClick={playTapSound}>
                  Play Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
