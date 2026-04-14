'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronUp,
  Music2,
  Trash2,
  PlayCircle,
  ExternalLink,
  Waves,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { playTapSound } from '@/lib/sound'

type MusicProvider = 'youtube' | 'spotify' | 'apple' | 'generic'

type MusicSource = {
  url: string
  provider: MusicProvider
  embedUrl: string | null
}

const STORAGE_KEY = 'keen-music-source'

function detectMusicSource(rawUrl: string): MusicSource | null {
  try {
    const url = new URL(rawUrl)
    const host = url.hostname.replace(/^www\./, '')

    if (host.includes('youtube.com') || host.includes('youtu.be') || host.includes('music.youtube.com')) {
      const videoId =
        url.searchParams.get('v') ??
        (host.includes('youtu.be') ? url.pathname.split('/').filter(Boolean)[0] : null)

      const playlist = url.searchParams.get('list')

      if (playlist) {
        return {
          url: rawUrl,
          provider: 'youtube',
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlist}`,
        }
      }

      if (videoId) {
        return {
          url: rawUrl,
          provider: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        }
      }
    }

    if (host.includes('spotify.com')) {
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) {
        return {
          url: rawUrl,
          provider: 'spotify',
          embedUrl: `https://open.spotify.com/embed/${parts[0]}/${parts[1]}`,
        }
      }
    }

    if (host.includes('music.apple.com')) {
      const path = url.pathname.replace(/^\/+/, '')
      return {
        url: rawUrl,
        provider: 'apple',
        embedUrl: `https://embed.music.apple.com/${path}`,
      }
    }

    return {
      url: rawUrl,
      provider: 'generic',
      embedUrl: null,
    }
  } catch {
    return null
  }
}

function providerLabel(provider: MusicProvider) {
  switch (provider) {
    case 'youtube':
      return 'YouTube'
    case 'spotify':
      return 'Spotify'
    case 'apple':
      return 'Apple Music'
    default:
      return 'Music link'
  }
}

function MusicPreview({ source }: { source: MusicSource }) {
  if (!source.embedUrl) {
    return (
      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        This link can be opened in a new tab. Some platforms block embeds, but the link still works.
        <div className="mt-3">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={source.url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open music
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
      <iframe
        src={source.embedUrl}
        className={cn(
          'w-full',
          source.provider === 'spotify' ? 'h-[152px]' : 'h-[352px]',
        )}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={`${providerLabel(source.provider)} player`}
      />
    </div>
  )
}

export function MusicDock({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState('')
  const [source, setSource] = useState<MusicSource | null>(null)
  const [expanded, setExpanded] = useState(!compact)

  useEffect(() => {
    setMounted(true)
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MusicSource
        setSource(parsed)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const handleConnect = () => {
    const parsed = detectMusicSource(input.trim())
    if (!parsed) return
    playTapSound()
    setSource(parsed)
    setInput('')
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    setExpanded(true)
  }

  const handleClear = () => {
    playTapSound()
    setSource(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const title = useMemo(
    () => (source ? `Connected ${providerLabel(source.provider)}` : 'Connect music'),
    [source],
  )
  const compactCollapsed = compact && !expanded

  if (!mounted) {
    return null
  }

  return (
    <Card
      className={cn(
        'overflow-hidden border-border/70 bg-card/95 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.4)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Music2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">
              Spotify, YouTube, Apple Music, or any shareable link
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {source ? (
            <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600 sm:inline-flex">
              <Waves className="h-3 w-3" />
              Playing
            </span>
          ) : null}
          <Button variant="ghost" size="icon-sm" onClick={() => setExpanded((value) => !value)}>
            <ChevronUp
              className={cn('h-4 w-4 transition-transform', expanded ? 'rotate-0' : 'rotate-180')}
            />
          </Button>
        </div>
      </div>

      {compactCollapsed && source ? (
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Music2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {providerLabel(source.provider)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {source.url.replace(/^https?:\/\//, '')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  animate={{ scaleY: [0.5, 1.1, 0.7] }}
                  transition={{
                    duration: 0.9,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.12,
                    ease: 'easeInOut',
                  }}
                  className="h-5 w-1 rounded-full bg-primary/80"
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1 gap-2">
              <a href={source.url} target="_blank" rel="noreferrer">
                <PlayCircle className="h-4 w-4" />
                Open
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      ) : expanded ? (
        <div className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Paste a YouTube, Spotify, or Apple Music link"
              className="h-11"
            />
            <Button onClick={handleConnect} disabled={!input.trim()} className="h-11 sm:w-32">
              Connect
            </Button>
          </div>

          {source ? (
            <div className="space-y-3">
              <MusicPreview source={source} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline" className="gap-2">
                  <a href={source.url} target="_blank" rel="noreferrer">
                    <PlayCircle className="h-4 w-4" />
                    Open in platform
                  </a>
                </Button>
                <Button variant="ghost" onClick={handleClear} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Drop in a music link and keep it playing while you game. The app remembers your choice locally.
            </div>
          )}
        </div>
      ) : null}
    </Card>
  )
}
