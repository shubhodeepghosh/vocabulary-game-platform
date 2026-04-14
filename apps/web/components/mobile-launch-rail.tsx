'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareLinkButton } from '@/components/share-link-button'
import { playStartSound } from '@/lib/sound'
import { cn } from '@/lib/utils'

export function MobileLaunchRail({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur md:hidden',
        className,
      )}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <Button asChild className="h-12 flex-1 gap-2 rounded-full text-base">
          <Link href="/games" onClick={playStartSound}>
            <Play className="h-4 w-4" />
            Play now
          </Link>
        </Button>
        <ShareLinkButton
          label="Share"
          compact
          size="icon-lg"
          className="h-12 w-12 rounded-full"
        />
      </div>
      <p className="mt-2 text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        Free guest play, instant rounds, made for mobile
      </p>
    </div>
  )
}
