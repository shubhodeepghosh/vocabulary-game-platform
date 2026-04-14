import { usePreferencesStore } from '@/store/preferences-store'

let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    audioContext = new window.AudioContext()
  }
  return audioContext
}

function soundIsEnabled() {
  return usePreferencesStore.getState().soundEnabled
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  navigator.vibrate(pattern)
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.12,
) {
  if (!soundIsEnabled()) return

  const context = getAudioContext()
  if (!context) return

  void context.resume().catch(() => {})

  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.value = 0.0001

  oscillator.connect(gain)
  gain.connect(context.destination)

  const now = context.currentTime
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

export function playSuccessSound() {
  vibrate([20, 30, 20])
  playTone(660, 0.09, 'triangle', 0.14)
  window.setTimeout(() => playTone(880, 0.12, 'triangle', 0.11), 70)
  window.setTimeout(() => playTone(990, 0.14, 'sine', 0.08), 145)
}

export function playErrorSound() {
  vibrate([60, 35, 60])
  playTone(180, 0.14, 'sawtooth', 0.16)
  window.setTimeout(() => playTone(120, 0.18, 'triangle', 0.09), 70)
}

export function playTapSound() {
  vibrate(10)
  playTone(520, 0.045, 'square', 0.08)
}

export function playShareSound() {
  vibrate([15, 20, 15])
  playTone(740, 0.07, 'triangle', 0.11)
  window.setTimeout(() => playTone(980, 0.1, 'sine', 0.08), 60)
}

export function playStartSound() {
  vibrate([10, 20, 10])
  playTone(440, 0.07, 'triangle', 0.08)
  window.setTimeout(() => playTone(660, 0.08, 'triangle', 0.1), 55)
  window.setTimeout(() => playTone(880, 0.11, 'sine', 0.09), 120)
}

export function playLevelUpSound() {
  vibrate([15, 15, 15, 15])
  playTone(523.25, 0.08, 'sine', 0.1)
  window.setTimeout(() => playTone(659.25, 0.09, 'sine', 0.12), 80)
  window.setTimeout(() => playTone(783.99, 0.1, 'triangle', 0.13), 155)
}
