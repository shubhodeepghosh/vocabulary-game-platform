'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  BookOpen,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareLinkButton } from '@/components/share-link-button'
import { SoundToggleButton } from '@/components/sound-toggle-button'
import { MusicDock } from '@/components/music-dock'
import { useAuthStore } from '@/store/auth-store'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const logout = useAuthStore((state) => state.logout)
  const guestLogin = useAuthStore((state) => state.guestLogin)

  useEffect(() => {
    const ensureSession = async () => {
      await bootstrap()
    }

    void ensureSession()
  }, [bootstrap, router])

  const handleLogout = useCallback(async () => {
    await logout()
    await guestLogin()
    router.push('/games')
  }, [guestLogin, logout, router])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/games', label: 'Games', icon: BookOpen },
    { href: '/stats', label: 'Stats', icon: Zap },
    { href: '/profile', label: 'Profile', icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Keen</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 hover:bg-muted lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="hidden items-center gap-4 lg:flex">
            <SoundToggleButton compact />
            <ShareLinkButton label="Share game" />
            <span className="text-sm text-muted-foreground">
              {user?.isGuest ? 'Guest mode' : user?.email ?? 'Loading...'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              New guest
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <nav className="hidden w-48 border-r border-border bg-sidebar p-4 lg:block">
          <div className="mb-6 rounded-xl bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Signed in as
            </p>
            <p className="mt-2 font-semibold text-foreground">
              {user?.username ?? 'Player'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SoundToggleButton compact />
              <ShareLinkButton compact label="Invite" />
            </div>
          </div>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-auto border-t border-border pt-4 lg:flex lg:items-center lg:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              New guest
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
            <div className="mb-3">
                <div className="flex gap-2">
                  <SoundToggleButton compact className="flex-1" />
                  <ShareLinkButton compact label="Invite friends" className="flex-1" />
                </div>
              </div>
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {children}
        </main>
      </div>

      <div className="hidden xl:block">
        <MusicDock className="fixed bottom-4 right-4 z-40 w-[360px]" compact />
      </div>

      <div className="border-t border-border bg-card px-3 py-3 xl:hidden">
        <MusicDock compact />
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs transition-colors ${
                  isActive(item.href)
                    ? 'border-t-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
