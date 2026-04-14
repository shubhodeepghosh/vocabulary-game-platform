'use client'

import {
  BookOpen,
  BrainCircuit,
  Flower2,
  TimerReset,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type GameThemeId = 'wordle' | 'scramble' | 'spelling-bee' | 'speed' | 'quiz'

type GameTheme = {
  badge: string
  title: string
  subtitle: string
  accent: string
  glow: string
  panel: string
  orb1: string
  orb2: string
  orb3: string
  icon: LucideIcon
}

export const gameThemes: Record<GameThemeId, GameTheme> = {
  wordle: {
    badge: 'Spellbound Archive',
    title: 'Wordle',
    subtitle: 'A cozy letter mystery with calm, clever clues.',
    accent: 'from-sky-400 via-cyan-300 to-teal-300',
    glow: 'bg-sky-400/20',
    panel: 'bg-sky-500/8',
    orb1: 'bg-sky-300/40',
    orb2: 'bg-cyan-300/35',
    orb3: 'bg-emerald-300/30',
    icon: BookOpen,
  },
  scramble: {
    badge: 'Wind Maze',
    title: 'Scramble',
    subtitle: 'A breezy puzzle forest where letters drift like leaves.',
    accent: 'from-violet-400 via-fuchsia-300 to-pink-300',
    glow: 'bg-violet-400/18',
    panel: 'bg-violet-500/8',
    orb1: 'bg-violet-300/38',
    orb2: 'bg-fuchsia-300/32',
    orb3: 'bg-rose-300/28',
    icon: BrainCircuit,
  },
  'spelling-bee': {
    badge: 'Honey Grove',
    title: 'Spelling Bee',
    subtitle: 'A bright little hive of words and golden discovery.',
    accent: 'from-amber-300 via-orange-300 to-rose-300',
    glow: 'bg-amber-300/18',
    panel: 'bg-amber-500/8',
    orb1: 'bg-amber-200/42',
    orb2: 'bg-orange-200/34',
    orb3: 'bg-rose-200/24',
    icon: Flower2,
  },
  speed: {
    badge: 'Star Run',
    title: 'Speed Vocab',
    subtitle: 'A sparkling rush through the language sky.',
    accent: 'from-orange-300 via-amber-300 to-yellow-200',
    glow: 'bg-orange-300/18',
    panel: 'bg-orange-500/8',
    orb1: 'bg-orange-200/42',
    orb2: 'bg-amber-200/34',
    orb3: 'bg-yellow-200/28',
    icon: TimerReset,
  },
  quiz: {
    badge: 'Mind Garden',
    title: 'Quiz',
    subtitle: 'A brain-teasing path with instant magical feedback.',
    accent: 'from-cyan-300 via-blue-300 to-indigo-300',
    glow: 'bg-cyan-300/18',
    panel: 'bg-cyan-500/8',
    orb1: 'bg-cyan-200/38',
    orb2: 'bg-blue-200/32',
    orb3: 'bg-indigo-200/28',
    icon: Sparkles,
  },
}

export function GameScene({
  gameId,
  children,
  className,
}: {
  gameId: GameThemeId
  children: ReactNode
  className?: string
}) {
  const theme = gameThemes[gameId]
  const Icon = theme.icon

  return (
    <div className={cn('relative overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8', className)}>
      <div
        className={cn(
          'absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.35),transparent)]',
          theme.panel,
        )}
      />
      <div className={cn('absolute -left-16 top-10 -z-10 h-52 w-52 rounded-full blur-3xl', theme.orb1)} />
      <div className={cn('absolute right-0 top-28 -z-10 h-64 w-64 rounded-full blur-3xl', theme.orb2)} />
      <div className={cn('absolute bottom-0 left-1/4 -z-10 h-44 w-44 rounded-full blur-3xl', theme.orb3)} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-[0_28px_90px_-42px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-6 lg:p-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className={cn('inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white', theme.accent)}>
                {theme.badge}
              </span>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={cn('mt-1 flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-lg', 'bg-gradient-to-br', theme.accent)}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    {theme.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                    {theme.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className={cn('grid gap-2 rounded-3xl border border-border/70 p-3 sm:grid-cols-3', theme.glow)}>
              {[
                ['Mood', 'Playful'],
                ['Style', 'Soft fantasy'],
                ['Device', 'Responsive'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-background/70 px-3 py-2 text-left shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
    </div>
  )
}
