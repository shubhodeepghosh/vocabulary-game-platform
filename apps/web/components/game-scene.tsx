'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  BrainCircuit,
  Flower2,
  Sparkles,
  TimerReset,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type GameThemeId = 'wordle' | 'scramble' | 'spelling-bee' | 'speed' | 'quiz'

type GameTheme = {
  badge: string
  title: string
  subtitle: string
  accent: string
  accentSoft: string
  glow: string
  panel: string
  orb1: string
  orb2: string
  orb3: string
  icon: LucideIcon
  mantra: string
}

export const gameThemes: Record<GameThemeId, GameTheme> = {
  wordle: {
    badge: 'Spellbound Archive',
    title: 'Wordle',
    subtitle: 'A calm letter mystery with soft clues and a sky-lit quest feeling.',
    accent: 'from-sky-400 via-cyan-300 to-teal-300',
    accentSoft: 'from-sky-200/80 via-cyan-100/75 to-teal-100/75',
    glow: 'bg-sky-400/16 ring-sky-200/70',
    panel: 'bg-sky-500/10',
    orb1: 'bg-sky-300/42',
    orb2: 'bg-cyan-300/34',
    orb3: 'bg-emerald-300/30',
    icon: BookOpen,
    mantra: 'Listen to the clue. Trust the pattern. The archive is alive.',
  },
  scramble: {
    badge: 'Wind Maze',
    title: 'Scramble',
    subtitle: 'Letters drift like leaves through a breezy puzzle forest.',
    accent: 'from-violet-400 via-fuchsia-300 to-pink-300',
    accentSoft: 'from-violet-200/80 via-fuchsia-100/75 to-pink-100/75',
    glow: 'bg-violet-400/16 ring-violet-200/70',
    panel: 'bg-violet-500/10',
    orb1: 'bg-violet-300/40',
    orb2: 'bg-fuchsia-300/34',
    orb3: 'bg-rose-300/28',
    icon: BrainCircuit,
    mantra: 'Unwind the maze. Catch the breeze. Find the hidden path.',
  },
  'spelling-bee': {
    badge: 'Honey Grove',
    title: 'Spelling Bee',
    subtitle: 'A golden hive of words with a brighter, more playful rhythm.',
    accent: 'from-amber-300 via-orange-300 to-rose-300',
    accentSoft: 'from-amber-200/80 via-orange-100/75 to-rose-100/75',
    glow: 'bg-amber-300/16 ring-amber-200/70',
    panel: 'bg-amber-500/10',
    orb1: 'bg-amber-200/42',
    orb2: 'bg-orange-200/34',
    orb3: 'bg-rose-200/24',
    icon: Flower2,
    mantra: 'Circle the center. Build honey words. Keep the hive buzzing.',
  },
  speed: {
    badge: 'Star Run',
    title: 'Speed Vocab',
    subtitle: 'A sparkling sprint through the language sky with quick feedback.',
    accent: 'from-orange-300 via-amber-300 to-yellow-200',
    accentSoft: 'from-orange-200/80 via-amber-100/75 to-yellow-100/75',
    glow: 'bg-orange-300/16 ring-orange-200/70',
    panel: 'bg-orange-500/10',
    orb1: 'bg-orange-200/42',
    orb2: 'bg-amber-200/34',
    orb3: 'bg-yellow-200/28',
    icon: TimerReset,
    mantra: 'Move fast. Keep rhythm. Let the stars pull you forward.',
  },
  quiz: {
    badge: 'Mind Garden',
    title: 'Quiz',
    subtitle: 'A clever little path with magical feedback and soft brain sparks.',
    accent: 'from-cyan-300 via-blue-300 to-indigo-300',
    accentSoft: 'from-cyan-200/80 via-blue-100/75 to-indigo-100/75',
    glow: 'bg-cyan-300/16 ring-cyan-200/70',
    panel: 'bg-cyan-500/10',
    orb1: 'bg-cyan-200/40',
    orb2: 'bg-blue-200/32',
    orb3: 'bg-indigo-200/28',
    icon: Sparkles,
    mantra: 'Read the sparkle. Trust your instincts. Let the garden answer.',
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
    <div className={cn('relative isolate overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8', className)}>
      <div
        className={cn(
          'absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.84),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.38),transparent)]',
          theme.panel,
        )}
      />
      <div className="absolute inset-x-8 top-8 -z-10 h-40 rounded-[2.5rem] bg-white/35 blur-3xl" />
      <div className={cn('absolute -left-20 top-8 -z-10 h-60 w-60 rounded-full blur-3xl', theme.orb1)} />
      <div className={cn('absolute right-0 top-28 -z-10 h-72 w-72 rounded-full blur-3xl', theme.orb2)} />
      <div className={cn('absolute bottom-0 left-1/4 -z-10 h-48 w-48 rounded-full blur-3xl', theme.orb3)} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className={cn(
            'overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-[0_28px_90px_-42px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:p-6 lg:p-7',
            'ring-1',
            theme.glow,
          )}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span
                className={cn(
                  'inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm',
                  theme.accent,
                )}
              >
                {theme.badge}
              </span>
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={cn(
                    'relative mt-1 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.5rem] text-primary-foreground shadow-lg',
                    'bg-gradient-to-br',
                    theme.accent,
                  )}
                >
                  <span className={cn('absolute inset-0 bg-gradient-to-br opacity-60', theme.accentSoft)} />
                  <Icon className="relative h-8 w-8 drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    {theme.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                    {theme.subtitle}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground/70">{theme.mantra}</p>
                </div>
              </div>
            </div>

            <div className={cn('grid gap-2 rounded-[1.6rem] border border-white/60 p-3 sm:grid-cols-3', theme.glow)}>
              {[
                ['Mood', 'Playful'],
                ['Style', 'Storybook'],
                ['Device', 'Responsive'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/70 px-3 py-2 text-left shadow-sm backdrop-blur">
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
