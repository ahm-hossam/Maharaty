import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../services/api'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthStore {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean

  setTokens: (access: string, refresh: string) => Promise<void>
  setUser: (user: AuthUser | null) => void
  initialize: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: async (access: string, refresh: string) => {
    await SecureStore.setItemAsync('access_token', access)
    await SecureStore.setItemAsync('refresh_token', refresh)
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
  },

  setUser: (user: AuthUser | null) => {
    set({ user })
  },

  initialize: async () => {
    try {
      const access = await SecureStore.getItemAsync('access_token')
      const refresh = await SecureStore.getItemAsync('refresh_token')

      if (!access || !refresh) {
        set({ isLoading: false, isAuthenticated: false })
        return
      }

      set({ accessToken: access, refreshToken: refresh })

      const { data } = await api.get('/auth/me')
      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      await SecureStore.deleteItemAsync('access_token')
      await SecureStore.deleteItemAsync('refresh_token')
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },
}))
