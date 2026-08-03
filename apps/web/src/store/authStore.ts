import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

function setSessionCookie(value: string) {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `maharaty-session=${value}; path=/; SameSite=Strict${secure}`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) => {
        setSessionCookie('1')
        set({ accessToken, refreshToken, user })
      },
      clearAuth: () => {
        setSessionCookie('')
        set({ accessToken: null, refreshToken: null, user: null })
      },
      isAdmin: () =>
        ['ADMIN', 'SUPER_ADMIN'].includes(get().user?.role ?? ''),
    }),
    {
      name: 'maharaty-admin-auth',
      // sessionStorage: tokens are cleared when the browser tab closes
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
    }
  )
)
