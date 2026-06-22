import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  activities?: Activity[]
}

export interface Activity {
  id: string
  type: string
  userId: string
  createdAt: string
  user?: User
}

export interface Content {
  id: string
  type: 'COURSE' | 'VIDEO' | 'ARTICLE'
  titleAr: string
  description?: string
  category?: string
  thumbnail?: string
  isPublished: boolean
  duration?: number
  url?: string
  meta?: Record<string, unknown>
  createdAt: string
}

export interface Analytics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  totalContent: number
  publishedContent: number
  totalActivities: number
  activitiesThisWeek: number
  topActivities: { type: string; count: number }[]
  userGrowth: { date: string; count: number }[]
  contentByType: { COURSE: number; VIDEO: number; ARTICLE: number }
  recentUsers: User[]
  recentActivities: Activity[]
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  totalPages: number
}

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: () => api.get('/admin/analytics').then((r) => r.data.data),
  })
}

export function useUsers(params: {
  page: number
  search: string
  role?: string
  isActive?: string
}) {
  return useQuery<UsersResponse>({
    queryKey: ['users', params],
    queryFn: () => {
      const p: Record<string, string | number> = {
        page: params.page,
        limit: 20,
        search: params.search,
      }
      if (params.role) p.role = params.role
      if (params.isActive !== undefined && params.isActive !== '')
        p.isActive = params.isActive
      return api.get('/users', { params: p }).then((r) => r.data.data)
    },
    placeholderData: (prev) => prev,
  })
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: ['content', 'categories'],
    queryFn: () => api.get('/content/categories').then((r) => r.data.data),
    staleTime: 60_000,
  })
}

export function useAllContent() {
  return useQuery<Content[]>({
    queryKey: ['content', 'all'],
    queryFn: () =>
      api.get('/content/admin/all').then((r) => r.data.data.content ?? r.data.data),
  })
}

export function useActivities(params: {
  userId?: string
  type?: string
  page: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => {
      const p: Record<string, string | number> = {
        page: params.page,
        limit: params.limit ?? 20,
      }
      if (params.userId) p.userId = params.userId
      if (params.type) p.type = params.type
      return api.get('/activities', { params: p }).then((r) => r.data.data)
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      email: string
      password: string
      role: string
    }) => api.post('/users', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      name?: string
      email?: string
      role?: string
      isActive?: boolean
    }) => api.patch(`/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useCreateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      type: 'COURSE' | 'VIDEO' | 'ARTICLE'
      titleAr: string
      description?: string
      category?: string
      thumbnail?: string
      duration?: number
      url?: string
      isPublished: boolean
      meta?: Record<string, unknown>
    }) => api.post('/content', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }),
  })
}

export function useUpdateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      type?: 'COURSE' | 'VIDEO' | 'ARTICLE'
      titleAr?: string
      description?: string
      category?: string
      thumbnail?: string
      duration?: number
      url?: string
      isPublished?: boolean
      meta?: Record<string, unknown>
    }) => api.patch(`/content/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }),
  })
}

export function useDeleteContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/content/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }),
  })
}

export interface BannerConfig {
  isActive: boolean
  title: string
  subtitle: string
  ctaText: string
  bgColor1: string
  bgColor2: string
  contentId?: string | null
  contentType?: string | null
  contentTitle?: string | null
}

export function useBanner() {
  return useQuery<BannerConfig>({
    queryKey: ['banner'],
    queryFn: () => api.get('/banner').then((r) => r.data.data),
  })
}

export function useUpdateBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<BannerConfig>) => api.put('/banner', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banner'] }),
  })
}

export function useSendNotification() {
  return useMutation({
    mutationFn: (data: {
      userIds?: string[]
      bulk?: boolean
      title: string
      body: string
      type: 'in-app' | 'push' | 'both'
    }) => api.post('/notifications/send', data),
  })
}
