'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShareLinkButton } from '@/components/share-link-button'
import {
  BookOpen,
  Flame,
  Trophy,
  ChevronRight,
  BarChart3,
  BrainCircuit,
  Clock3,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { apiFetch } from '@/lib/api/client'
import type { LeaderboardEntry } from '@keen/types'
import { gameCatalog } from '@/lib/game-catalog'

interface Game {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  href: string
}

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const stats = useAuthStore((state) => state.stats)
  const user = useAuthStore((state) => state.user)
  const refreshStats = useAuthStore((state) => state.refreshStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        await refreshStats()
        const global = await apiFetch<{ entries: LeaderboardEntry[] }>(
          '/leaderboard/global'
        )
        setLeaderboard(global.entries)
      } catch {
        setLeaderboard([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [refreshStats])

  const games: Game[] = [
    {
      id: 'wordle',
      name: 'Wordle',
      description: 'Guess the word in 6 attempts',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      href: '/games/wordle',
    },
    {
      id: 'scramble',
      name: 'Scramble',
      description: 'Unscramble letters before time runs out',
      icon: <BrainCircuit className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      href: '/games/scramble',
    },
    {
      id: 'spelling-bee',
      name: 'Spelling Bee',
      description: 'Find words around a required center letter',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'from-emerald-500 to-emerald-600',
      href: '/games/spelling-bee',
    },
    {
      id: 'quiz',
      name: 'Quiz',
      description: 'Pick the best answer and learn instantly',
      icon: <Trophy className="h-8 w-8" />,
      color: 'from-cyan-500 to-cyan-600',
      href: '/games/quiz',
    },
    {
      id: 'speed',
      name: 'Speed Vocab',
      description: 'Fast multiple choice rounds with a shrinking clock',
      icon: <Clock3 className="h-8 w-8" />,
      color: 'from-orange-500 to-orange-600',
      href: '/games/speed',
    },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const hasMomentum = (stats?.totalWins ?? 0) > 0 || (stats?.currentStreak ?? 0) > 0

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          {user?.isGuest ? `Ready to play, ${user.username}?` : `Welcome back, ${user?.username ?? 'Player'}!`}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {user?.isGuest
            ? 'You are in instant-play guest mode. Share the link and let people jump straight into the games.'
            : 'Keep learning, building streaks, and climbing the leaderboard.'}
        </p>
      </div>

      {hasMomentum && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-5"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 14 }).map((_, index) => (
              <motion.span
                key={index}
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: ['0%', '120%'], opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.08,
                  ease: 'linear',
                }}
                className={`absolute top-0 h-2 w-1 rounded-full ${
                  index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-secondary' : 'bg-accent'
                }`}
                style={{ left: `${(index * 13) % 100}%` }}
              />
            ))}
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Momentum
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                You’ve got a streak going.
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep the run alive, share the game, and push for a higher score.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-background/90 px-4 py-3 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wins</p>
                <p className="text-2xl font-black text-primary">{stats?.totalWins ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-background/90 px-4 py-3 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Streak</p>
                <p className="text-2xl font-black text-secondary">{stats?.currentStreak ?? 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Games Played</p>
              <p className="text-2xl font-bold text-primary">
                {stats?.totalGamesPlayed || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-4 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold text-secondary">
                {stats?.averageScore ?? 0}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-secondary/50" />
          </div>
        </Card>

        <Card className="p-4 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-accent">
                {stats?.currentStreak || 0}
              </p>
            </div>
            <Flame className="h-8 w-8 text-accent/50" />
          </div>
        </Card>

        <Card className="p-4 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">XP / Level</p>
              <p className="text-2xl font-bold text-destructive">
                {stats?.totalXp || 0}
              </p>
              <p className="text-xs text-muted-foreground">Lv. {stats?.level || 1}</p>
            </div>
            <Trophy className="h-8 w-8 text-destructive/50" />
          </div>
        </Card>
      </div>

      {/* Games Section */}
      <div>
        <h3 className="mb-4 text-xl font-semibold text-foreground">Choose a Game</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link key={game.id} href={game.href}>
              <Card className="group h-full overflow-hidden transition-all hover:shadow-md">
                <div
                  className={`bg-gradient-to-br ${game.color} p-6 text-white`}
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-white/20 p-3">
                      {game.icon}
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold">{game.name}</h4>
                  <p className="mt-1 text-sm text-white/80">{game.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div id="leaderboard" className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Weekly Momentum
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Favorite game: {stats?.favoriteGame ?? 'No rounds yet'}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/stats">View stats</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {gameCatalog.map((game) => (
              <div key={game.id} className="rounded-xl bg-muted/60 p-4">
                <p className="text-sm font-medium text-foreground">{game.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats?.byGame[game.id].played ?? 0} rounds played
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Share This Game Hub
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send one link and let people play instantly with no signup wall.
                </p>
              </div>
              <ShareLinkButton />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Global Leaderboard
            </h3>
            <div className="mt-4 space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      #{entry.rank} {entry.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {entry.level} - {entry.streak} day streak
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{entry.xp} XP</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
