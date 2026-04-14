'use client'

import type React from 'react'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { playShareSound, playTapSound } from '@/lib/sound'

type ShareLinkButtonProps = {
  url?: string
  title?: string
  text?: string
  label?: string
  compact?: boolean
  className?: string
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
}

export function ShareLinkButton({
  url,
  title = 'Keen Vocabulary Games',
  text = 'Play these vocabulary games with me.',
  label = 'Share',
  compact = false,
  className,
  variant = 'outline',
  size = 'sm',
}: ShareLinkButtonProps) {
  const handleShare = async () => {
    const shareUrl = url ?? `${window.location.origin}/games`
    playTapSound()

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        })
        playShareSound()
        return
      } catch {
        // Fall back to copy when share is cancelled or unavailable.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      playShareSound()
      toast.success('Share link copied')
    } catch {
      toast.error('Unable to copy the share link')
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn('gap-2', className)}
    >
      <Share2 className="h-4 w-4" />
      <span className={compact ? 'sr-only' : ''}>{label}</span>
    </Button>
  )
}
