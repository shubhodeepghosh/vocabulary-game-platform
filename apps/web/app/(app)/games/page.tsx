'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
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
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.35)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(167,243,208,0.16),transparent_36%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              The journey begins
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Choose your quest and jump straight into the story.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Every game is built for instant play, but now it feels like a lively quest board instead of a plain menu.
            </p>
          </div>
          <Button asChild size="sm" className="gap-2 rounded-full px-5">
            <Link href="/games/wordle" onClick={playTapSound}>
              Start with Wordle
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {gameCatalog.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: index * 0.04 }}
          >
            <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-foreground">{game.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{game.difficulty}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {games.map((game) => (
          <Card
            key={game.id}
            className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-28px_rgba(15,23,42,0.35)]"
          >
            <div
              className={`bg-gradient-to-br ${game.color} p-6 text-white`}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-white/18 p-3 backdrop-blur-sm">
                  {game.icon}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {game.difficulty}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{game.name}</h3>
              <p className="mt-1 text-sm text-white/80">{game.description}</p>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <p className="flex-1 text-sm text-muted-foreground">
                {game.fullDescription}
              </p>
              <Button asChild className="mt-4 w-full gap-2 rounded-full">
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
