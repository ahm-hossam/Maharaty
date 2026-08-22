import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { useAuthStore } from '../store/authStore'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url ?? '?'
    const body = error.response?.data

    if (!error.response) {
      console.error(`[API] ✗ NETWORK ERROR — ${original?.method?.toUpperCase()} ${url} — is the backend reachable? (${BASE_URL})`)
    } else {
      console.error(`[API] ✗ ${status} ${url}`, JSON.stringify(body))
    }

    if (status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        await SecureStore.setItemAsync('access_token', data.data.accessToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        console.log('[API] Token refreshed, retrying request')
        return api(original)
      } catch (refreshError: any) {
        const refreshStatus = refreshError.response?.status
        if (refreshStatus === 401 || refreshStatus === 403) {
          console.error('[API] Refresh token invalid, logging out')
          await useAuthStore.getState().logout()
          router.replace('/(auth)/login')
        } else {
          console.error('[API] Token refresh failed due to network/server error — keeping session, will retry later')
        }
      }
    }
    return Promise.reject(error)
  },
)
