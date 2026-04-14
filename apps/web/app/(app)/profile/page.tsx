'use client'

import { useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Clock, Trophy, Flame, BarChart3 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const stats = useAuthStore((state) => state.stats)
  const logout = useAuthStore((state) => state.logout)
  const guestLogin = useAuthStore((state) => state.guestLogin)

  const handleLogout = useCallback(async () => {
    await logout()
    await guestLogin()
    router.push('/games')
  }, [guestLogin, logout, router])

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Profile</h2>
        <p className="mt-2 text-muted-foreground">
          {user.isGuest
            ? 'Guest profile and live session progress'
            : 'Manage your account settings'}
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary p-4 text-white">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-lg font-semibold text-foreground">
                {user.username}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-primary/50" />
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-foreground">
                  {user.isGuest ? 'Guest session only' : user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 text-primary/50" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-foreground">{joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Progress Snapshot</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/60 p-4">
            <Trophy className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Level</p>
            <p className="text-xl font-semibold text-foreground">{user.level}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-4">
            <BarChart3 className="h-5 w-5 text-secondary" />
            <p className="mt-3 text-sm text-muted-foreground">XP</p>
            <p className="text-xl font-semibold text-foreground">{user.xp}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-4">
            <Flame className="h-5 w-5 text-accent" />
            <p className="mt-3 text-sm text-muted-foreground">Streak</p>
            <p className="text-xl font-semibold text-foreground">
              {stats?.currentStreak ?? user.streak}
            </p>
          </div>
        </div>
        <Button className="mt-6" variant="outline" onClick={handleLogout}>
          {user.isGuest ? 'Start fresh guest run' : 'Log out'}
        </Button>
      </Card>
    </div>
  )
}
