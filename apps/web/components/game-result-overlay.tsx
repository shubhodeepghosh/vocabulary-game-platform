'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PartyPopper, Skull, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ResultTone = 'win' | 'lose' | 'complete'

type GameResultOverlayProps = {
  open: boolean
  tone: ResultTone
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
}

const confetti = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 17) % 100}%`,
  delay: (index % 6) * 0.08,
  duration: 1.4 + (index % 4) * 0.2,
  rotate: (index * 27) % 360,
}))

export function GameResultOverlay({
  open,
  tone,
  title,
  description,
  primaryAction,
}: GameResultOverlayProps) {
  const Icon =
    tone === 'win' ? PartyPopper : tone === 'lose' ? Skull : Sparkles

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((piece, index) => (
              <motion.span
                key={index}
                initial={{ y: -20, opacity: 0, rotate: piece.rotate }}
                animate={{
                  y: ['0%', '120vh'],
                  opacity: [0, 1, 1, 0],
                  rotate: piece.rotate + 180,
                }}
                transition={{
                  duration: piece.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: piece.delay,
                  ease: 'linear',
                }}
                className={cn(
                  'absolute top-0 h-3 w-2 rounded-sm',
                  index % 3 === 0
                    ? 'bg-primary'
                    : index % 3 === 1
                      ? 'bg-secondary'
                      : 'bg-accent',
                )}
                style={{ left: piece.left }}
              />
            ))}
          </div>

          <motion.div
            initial={{ y: 16, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_30px_100px_-30px_rgba(15,23,42,0.55)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.1),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_40%)]" />
            <div className="relative space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {tone === 'lose' ? 'Round ended' : tone === 'complete' ? 'Run complete' : 'You won'}
                </p>
                <h3 className="text-3xl font-black tracking-tight text-foreground">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {primaryAction ? (
                  <Button onClick={primaryAction.onClick} className="flex-1 gap-2">
                    <RotateCcw className="h-4 w-4" />
                    {primaryAction.label}
                  </Button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
