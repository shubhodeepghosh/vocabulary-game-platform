'use client'

import type { Difficulty, GameType } from '@keen/types'
import { create } from 'zustand'

type GameSession = {
  gameType: GameType
  sessionId: string
  difficulty: Difficulty
  score: number
}

type GameStore = {
  currentSession: GameSession | null
  setSession: (session: GameSession) => void
  updateScore: (score: number) => void
  clearSession: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  currentSession: null,
  setSession: (currentSession) => set({ currentSession }),
  updateScore: (score) =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, score }
        : null,
    })),
  clearSession: () => set({ currentSession: null }),
}))
