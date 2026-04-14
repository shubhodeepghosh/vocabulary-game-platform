'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BookOpen,
  Zap,
  Flame,
  Trophy,
  ChevronRight,
  BarChart3,
} from 'lucide-react'

interface UserStats {
  total_games_played: number
  average_score: number
  current_streak: number
  best_streak: number
}

interface Game {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  href: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const email = user.email?.split('@')[0] || 'Player'
        setUserName(email.charAt(0).toUpperCase() + email.slice(1))

        // Fetch user stats
        const { data } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setStats(data)
        } else {
          // Initialize stats if not found
          setStats({
            total_games_played: 0,
            average_score: 0,
            current_streak: 0,
            best_streak: 0,
          })
        }
      }
      setLoading(false)
    }

    fetchUserData()
  }, [])

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
      id: 'match',
      name: 'Word Match',
      description: 'Match words with definitions',
      icon: <Zap className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      href: '/games/match',
    },
    {
      id: 'flashcard',
      name: 'Flashcards',
      description: 'Learn with interactive flashcards',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'from-cyan-500 to-cyan-600',
      href: '/games/flashcard',
    },
    {
      id: 'sentence',
      name: 'Sentence Builder',
      description: 'Build correct sentences',
      icon: <Trophy className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      href: '/games/sentence',
    },
    {
      id: 'rapid',
      name: 'Rapid Fire',
      description: 'Answer questions quickly',
      icon: <Flame className="h-8 w-8" />,
      color: 'from-orange-500 to-orange-600',
      href: '/games/rapid',
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

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Welcome back, {userName}!</h2>
        <p className="mt-2 text-muted-foreground">
          Keep learning and improving your vocabulary
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Games Played</p>
              <p className="text-2xl font-bold text-primary">
                {stats?.total_games_played || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold text-secondary">
                {stats?.average_score ? Math.round(stats.average_score) : 0}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-secondary/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-accent">
                {stats?.current_streak || 0}
              </p>
            </div>
            <Flame className="h-8 w-8 text-accent/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Best Streak</p>
              <p className="text-2xl font-bold text-destructive">
                {stats?.best_streak || 0}
              </p>
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

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:flex-1">
            View Statistics
          </Button>
          <Button variant="outline" className="w-full sm:flex-1">
            View Achievements
          </Button>
          <Button variant="outline" className="w-full sm:flex-1">
            Leaderboard
          </Button>
        </div>
      </div>
    </div>
  )
}
