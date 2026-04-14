'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Gamepad2,
  Sparkles,
  Users2,
  Zap,
  Wand2,
  Smartphone,
  Flame,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { playStartSound, playTapSound } from '@/lib/sound'
import { ShareLinkButton } from '@/components/share-link-button'
import { MobileLaunchRail } from '@/components/mobile-launch-rail'

const features = [
  {
    icon: Gamepad2,
    title: 'Instant play',
    description: 'Open the link and start a round immediately. No signup wall, no friction.',
  },
  {
    icon: Sparkles,
    title: 'Auto-generated',
    description: 'Puzzles and rounds are generated automatically so the game always feels fresh.',
  },
  {
    icon: Users2,
    title: 'Guest-friendly',
    description: 'Progress, streaks, and scores work for casual players without credentials.',
  },
  {
    icon: Zap,
    title: 'Fast feedback',
    description: 'Every interaction responds quickly with smooth animations and instant scoring.',
  },
  {
    icon: Wand2,
    title: 'AI-run puzzles',
    description: 'New words and rounds are selected automatically, so the game keeps moving on its own.',
  },
  {
    icon: Smartphone,
    title: 'Built for phones',
    description: 'Thumb-friendly controls, share-first access, and quick rounds for on-the-go play.',
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-28 pt-6 sm:px-6 sm:py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0.03),transparent)]" />
      <div className="absolute -left-10 top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-0 top-32 -z-10 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center"
        >
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Instant vocabulary arcade
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                A real game-like vocabulary arcade you can open and play in one tap.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Challenge Wordle-style rounds, fast quizzes, scramble puzzles, and spelling games
                built for instant public play. No login wall. No install. Just open, tap, and play.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 rounded-full px-6">
                <Link href="/games" onClick={playStartSound}>
                  Start playing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link href="/games/wordle" onClick={playTapSound}>
                  Jump to Wordle
                </Link>
              </Button>
              <div className="hidden sm:block">
                <ShareLinkButton label="Invite friends" size="lg" className="rounded-full px-6" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Guest play enabled',
                'AI-run puzzle rotations',
                '200-300ms feedback',
                'Mobile-first sharing',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden border-white/70 bg-white/72 p-5 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.35)] sm:p-6 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent_40%,rgba(16,185,129,0.1),transparent_72%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_30%)]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Live modes
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Designed like a polished mobile game lobby.
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Ready now
                </div>
              </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Wordle', 'Daily-style clues'],
                    ['Scramble', 'Timed letter puzzles'],
                    ['Quiz', 'Instant feedback'],
                    ['Speed Vocab', 'Rapid score runs'],
                ].map(([title, text], index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.22 }}
                    className="rounded-2xl border border-white/70 bg-white/72 p-4 shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{title}</p>
                      {index === 0 ? <Flame className="h-4 w-4 text-secondary" /> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </motion.div>
                ))}
              </div>
              <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/72 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">XP</p>
                  <p className="mt-1 text-2xl font-black text-primary">+120</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Streak</p>
                  <p className="mt-1 text-2xl font-black text-secondary">7 days</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rank</p>
                  <p className="mt-1 text-2xl font-black text-accent">#14</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="relative overflow-hidden border-white/70 bg-white/72 p-6 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.13),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_35%),radial-gradient(circle_at_90%_18%,rgba(245,158,11,0.12),transparent_28%)]" />
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <Share2 className="h-3.5 w-3.5" />
                Play with friends
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  One link. Everyone joins instantly.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Copy the game hub link, drop it in WhatsApp, Discord, or a group chat, and let everyone jump straight into guest play with their own score streaks.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ShareLinkButton label="Copy game link" size="lg" className="rounded-full px-6" />
                <Button asChild size="lg" variant="outline" className="rounded-full px-6 bg-white/80">
                  <Link href="/games">Open lobby</Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 border-white/70 bg-white/72 p-6 backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  Soundtrack
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                  Bring your music
                </h2>
              </div>
                <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                  Local only
                </span>
              </div>
            <p className="text-sm leading-7 text-muted-foreground">
              Paste a YouTube, Spotify, or Apple Music link and keep it connected while you play. The selection is saved on your device, so the vibe stays with you.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['YouTube', 'Songs or playlists'],
                ['Spotify', 'Albums or playlists'],
                ['Apple Music', 'Shared links'],
              ].map(([label, text]) => (
                  <div key={label} className="rounded-2xl border border-white/70 bg-white/78 p-4">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.05 }}
              >
                <Card className="h-full space-y-3 p-5 transition-transform duration-200 hover:-translate-y-1">
                  <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{feature.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </section>
      </div>

      <MobileLaunchRail />
    </div>
  )
}
