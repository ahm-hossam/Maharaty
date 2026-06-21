import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  setAuth: (access: string, refresh: string, user: User) => void
  clearAuth: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
      isAdmin: () =>
        ['ADMIN', 'SUPER_ADMIN'].includes(get().user?.role ?? ''),
    }),
    { name: 'maharaty-admin-auth' }
  )
)
