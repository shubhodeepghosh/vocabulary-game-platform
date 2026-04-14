'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PreferencesStore = {
  soundEnabled: boolean
  hydrated: boolean
  setHydrated: (hydrated: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  toggleSound: () => void
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'keen-preferences',
      partialize: (state) => ({ soundEnabled: state.soundEnabled }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
