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

export interface UserActivity {
  id: string
  type: string
  meta?: Record<string, unknown>
  contentId?: string
  createdAt: string
  content?: { id: string; titleAr: string; type: string; thumbnail?: string }
}

export interface UserContentProgress {
  progress: number
  completedAt?: string
  lastSeenAt?: string
  content: { id: string; titleAr: string; type: string; thumbnail?: string; category?: string }
}

export interface UserAssessmentResult {
  id: string
  score: number
  passed: boolean
  completedAt: string
  assessment: { id: string; title: string; titleAr: string }
}

export interface UserSkillItem {
  level: string
  progress: number
  skill: { id: string; nameAr: string; name: string; icon?: string }
}

export interface UserDetail {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  activities: UserActivity[]
  contentProgress: UserContentProgress[]
  assessmentResults: UserAssessmentResult[]
  userSkills: UserSkillItem[]
  _count: { activities: number; contentProgress: number; assessmentResults: number }
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
  return useQuery<UserDetail>({
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

// ─── Community ────────────────────────────────────────────────────────────────

export interface PostAuthor {
  id: string
  name: string
  avatar?: string
  role: string
}

export interface CommunityPost {
  id: string
  content: string
  image?: string
  isAdminPost: boolean
  isPinned: boolean
  createdAt: string
  author: PostAuthor
  _count: { comments: number; reactions: number }
  hasReacted: boolean
}

export interface CommunityComment {
  id: string
  content: string
  createdAt: string
  author: PostAuthor
}

export interface PostsResponse {
  posts: CommunityPost[]
  total: number
  page: number
  totalPages: number
}

export function useCommunityPosts(page = 1) {
  return useQuery<PostsResponse>({
    queryKey: ['community', 'posts', page],
    queryFn: () =>
      api.get('/community/posts', { params: { page, limit: 20 } }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  })
}

export function usePostComments(postId: string | null) {
  return useQuery({
    queryKey: ['community', 'comments', postId],
    queryFn: () =>
      api.get(`/community/posts/${postId}/comments`).then((r) => r.data.data),
    enabled: !!postId,
  })
}

export function useCommunityStats() {
  return useQuery<{ total: number; adminPosts: number }>({
    queryKey: ['community', 'stats'],
    queryFn: () => api.get('/community/stats').then((r) => r.data.data),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { content: string; image?: string; isAdminPost?: boolean }) =>
      api.post('/community/posts', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community'] })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/community/posts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community'] })
    },
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.post(`/community/posts/${postId}/comments`, { content }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['community', 'comments', variables.postId] })
      qc.invalidateQueries({ queryKey: ['community', 'posts'] })
    },
  })
}

// ─── Self Assessment ──────────────────────────────────────────────────────────

export interface SAQuestion {
  id: string
  textAr: string
  category: string
  dimensionLabel: string
  orderIndex: number
  isActive: boolean
  createdAt: string
}

export function useSAQuestions() {
  return useQuery<SAQuestion[]>({
    queryKey: ['self-assessment', 'questions'],
    queryFn: () =>
      api.get('/self-assessment/questions/admin').then((r) => r.data.data),
  })
}

export function useSAStats() {
  return useQuery<{ total: number; active: number; results: number }>({
    queryKey: ['self-assessment', 'stats'],
    queryFn: () => api.get('/self-assessment/stats').then((r) => r.data.data),
  })
}

export function useCreateSAQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { textAr: string; category: string; dimensionLabel: string; orderIndex?: number; isActive?: boolean }) =>
      api.post('/self-assessment/questions', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['self-assessment'] }),
  })
}

export function useUpdateSAQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; textAr?: string; category?: string; dimensionLabel?: string; orderIndex?: number; isActive?: boolean }) =>
      api.patch(`/self-assessment/questions/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['self-assessment'] }),
  })
}

export function useDeleteSAQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/self-assessment/questions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['self-assessment'] }),
  })
}

export function useSeedSAQuestions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/self-assessment/seed'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['self-assessment'] }),
  })
}

export function useToggleReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => api.post(`/community/posts/${postId}/reactions`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', 'posts'] })
    },
  })
}
