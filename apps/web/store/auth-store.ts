'use client'

import type { AuthResponse, AuthUser, UserStats } from '@keen/types'
import { create } from 'zustand'
import { apiFetch, ApiError } from '@/lib/api/client'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous'

type AuthStore = {
  user: AuthUser | null
  stats: UserStats | null
  status: AuthStatus
  error: string | null
  bootstrap: () => Promise<void>
  login: (input: { email: string; password: string }) => Promise<void>
  guestLogin: () => Promise<void>
  signup: (input: {
    username: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshStats: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  stats: null,
  status: 'idle',
  error: null,
  clearError: () => set({ error: null }),
  bootstrap: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const data = await apiFetch<{ user: AuthUser }>('/auth/me')
      set({ user: data.user, status: 'authenticated' })
      await get().refreshStats()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await get().guestLogin()
        return
      }
      set({
        user: null,
        stats: null,
        status: 'anonymous',
        error: error instanceof Error ? error.message : 'Unable to load session',
      })
    }
  },
  login: async ({ email, password }) => {
    set({ status: 'loading', error: null })
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      set({ user: data.user, status: 'authenticated' })
      await get().refreshStats()
    } catch (error) {
      set({
        status: 'anonymous',
        error: error instanceof Error ? error.message : 'Login failed',
      })
      throw error
    }
  },
  guestLogin: async () => {
    const data = await apiFetch<AuthResponse>('/auth/guest', {
      method: 'POST',
    })
    set({ user: data.user, status: 'authenticated', error: null })
    await get().refreshStats()
  },
  signup: async ({ username, email, password }) => {
    set({ status: 'loading', error: null })
    try {
      const data = await apiFetch<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      })
      set({ user: data.user, status: 'authenticated' })
      await get().refreshStats()
    } catch (error) {
      set({
        status: 'anonymous',
        error: error instanceof Error ? error.message : 'Sign up failed',
      })
      throw error
    }
  },
  logout: async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    set({ user: null, stats: null, status: 'anonymous', error: null })
  },
  refreshStats: async () => {
    try {
      const stats = await apiFetch<UserStats>('/user/stats')
      set((state) => ({
        stats,
        status: state.user ? 'authenticated' : state.status,
        user: state.user
          ? {
              ...state.user,
              xp: stats.totalXp,
              streak: stats.currentStreak,
              level: stats.level,
            }
          : null,
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Unable to refresh statistics',
      })
    }
  },
}))
