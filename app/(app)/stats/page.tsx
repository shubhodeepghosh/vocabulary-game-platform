'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react'

interface UserStats {
  total_games_played: number
  average_score: number
  current_streak: number
  best_streak: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setStats(data)
        }
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

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
                {stats?.total_games_played || 0}
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
                {stats?.average_score ? Math.round(stats.average_score) : 0}%
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
                {stats?.current_streak || 0}
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
                {stats?.best_streak || 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">days</p>
            </div>
            <Target className="h-8 w-8 text-destructive/50" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">More Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Detailed statistics, charts, and game-by-game analytics will be available soon.
        </p>
      </Card>
    </div>
  )
}
