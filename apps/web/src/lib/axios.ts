import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { refreshToken } = useAuthStore.getState()
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'}/auth/refresh`,
          { refreshToken }
        )
        const newAccessToken = data.data.accessToken
        useAuthStore.getState().setAuth(
          newAccessToken,
          refreshToken,
          useAuthStore.getState().user!
        )
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return api(original)
      } catch {
        useAuthStore.getState().clearAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
