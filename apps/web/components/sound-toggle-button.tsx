'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferencesStore } from '@/store/preferences-store'
import { playTapSound } from '@/lib/sound'

export function SoundToggleButton({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const soundEnabled = usePreferencesStore((state) => state.soundEnabled)
  const toggleSound = usePreferencesStore((state) => state.toggleSound)

  const handleToggle = () => {
    playTapSound()
    toggleSound()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'sm' : 'default'}
      onClick={handleToggle}
      className={className}
      aria-pressed={soundEnabled}
      title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
    >
      {soundEnabled ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
      {!compact && (
        <span className="hidden sm:inline">
          {soundEnabled ? 'Sound on' : 'Sound off'}
        </span>
      )}
    </Button>
  )
}
