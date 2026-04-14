'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'

export default function Page() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const router = useRouter()
  const signup = useAuthStore((state) => state.signup)
  const guestLogin = useAuthStore((state) => state.guestLogin)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    clearError()

    if (password !== repeatPassword) {
      useAuthStore.setState({ error: 'Passwords do not match' })
      setIsLoading(false)
      return
    }

    try {
      await signup({ username, email, password })
      router.push('/games')
    } catch {
      // Store already handles the error message.
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestPlay = async () => {
    setIsGuestLoading(true)
    clearError()

    try {
      await guestLogin()
      router.push('/games')
    } catch {
      // Store already handles the error message.
    } finally {
      setIsGuestLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>
                Accounts are optional. Start as a guest now or create one to keep a named profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  type="button"
                  className="w-full"
                  variant="secondary"
                  disabled={isGuestLoading}
                  onClick={handleGuestPlay}
                >
                  {isGuestLoading ? 'Starting guest session...' : 'Play instantly as guest'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or create an account
                    </span>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSignUp} className="mt-6">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="keen-player"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="repeat-password">Repeat Password</Label>
                    </div>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating an account...' : 'Sign up'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
