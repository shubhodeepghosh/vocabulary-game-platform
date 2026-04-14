'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { gameCatalog } from '@/lib/game-catalog'

export default function StatsPage() {
  const stats = useAuthStore((state) => state.stats)
  const refreshStats = useAuthStore((state) => state.refreshStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      await refreshStats()
      setLoading(false)
    }

    void fetchStats()
  }, [refreshStats])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Your Statistics</h2>
        <p className="mt-2 text-muted-foreground">
          Track your progress and improvement over time
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Games Played</p>
              <p className="mt-2 text-4xl font-bold text-primary">
                {stats?.totalGamesPlayed || 0}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="mt-2 text-4xl font-bold text-secondary">
                {stats?.averageScore ?? 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-secondary/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="mt-2 text-4xl font-bold text-accent">
                {stats?.currentStreak || 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">days</p>
            </div>
            <Zap className="h-8 w-8 text-accent/50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="mt-2 text-4xl font-bold text-destructive">
                {stats?.bestStreak || 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">days</p>
            </div>
            <Target className="h-8 w-8 text-destructive/50" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">By Game</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {gameCatalog.map((game) => (
            <div key={game.id} className="rounded-xl bg-muted/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{game.name}</p>
                <p className="text-sm text-primary">
                  {stats?.byGame[game.id].averageScore ?? 0}%
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Played {stats?.byGame[game.id].played ?? 0} - Wins{' '}
                {stats?.byGame[game.id].wins ?? 0} - Best{' '}
                {stats?.byGame[game.id].bestScore ?? 0}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Results</h3>
        <div className="mt-4 space-y-3">
          {stats?.recentResults.length ? (
            stats.recentResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{result.gameType}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.difficulty} - {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className={result.won ? 'font-semibold text-green-600' : 'font-semibold text-red-500'}>
                  {result.score}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Finish a few rounds to populate your history.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
