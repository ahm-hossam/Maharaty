import { api } from '../services/api'

export function useActivity() {
  const trackActivity = async (
    type: string,
    meta?: Record<string, any>,
    contentId?: string,
  ) => {
    try {
      await api.post('/activities', { type, meta, contentId })
    } catch {
      // fire-and-forget, never throw
    }
  }

  return { trackActivity }
}
