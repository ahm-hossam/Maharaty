import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, FS } from '@/constants/theme'
import { useActivity } from '../../hooks/useActivity'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../services/api'
import { useDrawer } from '../../context/DrawerContext'
import { useLanguage } from '../../i18n/LanguageContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostAuthor {
  id: string
  name: string
  avatar?: string
  role: string
}

interface Post {
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

interface Comment {
  id: string
  content: string
  createdAt: string
  author: PostAuthor
}

// ─── Mock preview data (unauthenticated) — sample content, stays Arabic ──────

const MOCK_POSTS = [
  { id: '1', author: 'سارة إبراهيم', time: 'منذ ساعتين', content: 'نصيحة ذهبية: خصص 30 دقيقة يومياً لتطوير مهارة جديدة. الاتساق هو المفتاح!', likes: 48, comments: 12, avatar: 'SI', avatarColor: '#8B5CF6' },
  { id: '2', author: 'محمد علي', time: 'منذ 4 ساعات', content: 'شاركت للتو في مقابلة عمل وانتهيت بنجاح 🎉 شكراً لمجتمع مهاراتي على الدعم!', likes: 124, comments: 31, avatar: 'MA', avatarColor: '#06B6D4' },
  { id: '3', author: 'نور الحسن', time: 'أمس', content: 'هل هناك من يبحث عن شريك لتطوير مهارات البرمجة معاً؟', likes: 67, comments: 28, avatar: 'NH', avatarColor: '#F43F5E' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function getAvatarColor(name: string) {
  const colors = ['#8B5CF6', '#06B6D4', '#F43F5E', '#F59E0B', '#10B981', '#3B82F6']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return colors[Math.abs(hash) % colors.length]
}

// Relative time for backend post/comment timestamps — the label itself is
// UI copy so it follows the app language even though the post content stays Arabic.
function formatTime(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string) {
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diff < 60) return t('community.minutesAgo', { n: diff })
  const hours = Math.floor(diff / 60)
  if (hours < 24) return t('community.hoursAgo', { n: hours })
  return t('community.daysAgo', { n: Math.floor(hours / 24) })
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
  onToggleReaction,
  onOpenComments,
  onDelete,
  onEdit,
  t,
  S,
}: {
  post: Post
  currentUserId?: string
  onToggleReaction: (id: string) => void
  onOpenComments: (post: Post) => void
  onDelete: (id: string) => void
  onEdit: (post: Post) => void
  t: (key: string, params?: Record<string, string | number>) => string
  S: ReturnType<typeof createStyles>
}) {
  return (
    <View style={[S.postCard, post.isAdminPost && S.adminPostCard]}>
      {post.isAdminPost && (
        <View style={S.adminBadgeRow}>
          <View style={S.adminBadge}>
            <Ionicons name="shield-checkmark" size={11} color="#D97706" />
            <Text style={S.adminBadgeText}>{t('community.adminBadge')}</Text>
          </View>
        </View>
      )}

      <View style={S.postHeader}>
        <View style={S.postMeta}>
          <Text style={S.postAuthor}>{post.author.name}</Text>
          <Text style={S.postTime}>{formatTime(post.createdAt, t)}</Text>
        </View>
        <View style={S.postHeaderActions}>
          {currentUserId === post.author.id && (
            <>
              <TouchableOpacity onPress={() => onEdit(post)} style={S.deleteBtn}>
                <Ionicons name="pencil-outline" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(post.id)} style={S.deleteBtn}>
                <Ionicons name="trash-outline" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            </>
          )}
          <View
            style={[
              S.avatar,
              {
                backgroundColor: post.isAdminPost
                  ? '#F59E0B'
                  : getAvatarColor(post.author.name),
              },
            ]}
          >
            <Text style={S.avatarText}>{getInitials(post.author.name)}</Text>
          </View>
        </View>
      </View>

      <Text style={S.postContent}>{post.content}</Text>

      <View style={S.postActions}>
        <TouchableOpacity style={S.actionBtn} onPress={() => onOpenComments(post)}>
          <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
          <Text style={S.actionCount}>{post._count.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.actionBtn} onPress={() => onToggleReaction(post.id)}>
          <Ionicons
            name={post.hasReacted ? 'heart' : 'heart-outline'}
            size={18}
            color={post.hasReacted ? '#F43F5E' : '#64748B'}
          />
          <Text style={[S.actionCount, post.hasReacted && { color: '#F43F5E' }]}>
            {post._count.reactions}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { openDrawer } = useDrawer()
  const { trackActivity } = useActivity()
  const { t, isRTL } = useLanguage()
  const S = useMemo(() => createStyles(isRTL), [isRTL])
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated)
  const currentUser = useAuthStore((s) => s.user)

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [creating, setCreating] = useState(false)

  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    trackActivity('VIEW_COMMUNITY')
    if (isLoggedIn) fetchPosts()
  }, [isLoggedIn])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/community/posts')
      setPosts(res.data.data?.posts ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }, [fetchPosts])

  const toggleReaction = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              hasReacted: !p.hasReacted,
              _count: {
                ...p._count,
                reactions: p._count.reactions + (p.hasReacted ? -1 : 1),
              },
            }
          : p,
      ),
    )
    try {
      await api.post(`/community/posts/${postId}/reactions`)
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                hasReacted: !p.hasReacted,
                _count: {
                  ...p._count,
                  reactions: p._count.reactions + (p.hasReacted ? 1 : -1),
                },
              }
            : p,
        ),
      )
    }
  }

  const openComments = async (post: Post) => {
    setSelectedPost(post)
    setCommentsLoading(true)
    try {
      const res = await api.get(`/community/posts/${post.id}/comments`)
      setComments(res.data.data?.comments ?? [])
    } catch {
      // silent
    } finally {
      setCommentsLoading(false)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || !selectedPost) return
    setSubmittingComment(true)
    try {
      const res = await api.post(`/community/posts/${selectedPost.id}/comments`, {
        content: newComment.trim(),
      })
      setComments((prev) => [...prev, res.data.data])
      setNewComment('')
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } }
            : p,
        ),
      )
    } catch (err: any) {
      Alert.alert(t('community.error'), err?.response?.data?.message ?? t('community.failedToComment'))
    } finally {
      setSubmittingComment(false)
    }
  }

  const createPost = async () => {
    if (!newPostContent.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/community/posts', { content: newPostContent.trim() })
      setPosts((prev) => [res.data.data, ...prev])
      setNewPostContent('')
      setShowCreate(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t('community.failedToPost')
      Alert.alert(t('community.error'), msg)
    } finally {
      setCreating(false)
    }
  }

  const saveEditPost = async () => {
    if (!editingPost || !newPostContent.trim()) return
    setCreating(true)
    try {
      await api.patch(`/community/posts/${editingPost.id}`, { content: newPostContent.trim() })
      setPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? { ...p, content: newPostContent.trim() } : p)),
      )
      setEditingPost(null)
      setNewPostContent('')
      setShowCreate(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t('community.failedToEdit')
      Alert.alert(t('community.error'), msg)
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePost = (postId: string) => {
    Alert.alert(t('community.deletePost'), t('community.deleteConfirm'), [
      { text: t('community.cancel'), style: 'cancel' },
      {
        text: t('community.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/community/posts/${postId}`)
            setPosts((prev) => prev.filter((p) => p.id !== postId))
          } catch {
            // silent
          }
        },
      },
    ])
  }

  // ── Unauthenticated view ──────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <View style={S.container}>
        <View style={[S.header, { paddingTop: insets.top + 16 }]}>
          <View style={S.headerRow}>
            <View style={S.headerInfo}>
              <View style={S.headerBadge}>
                <Ionicons name="people" size={20} color={COLORS.teal} />
              </View>
              <View>
                <Text style={S.headerTitle}>{t('community.title')}</Text>
                <Text style={S.headerSubtitle}>{t('community.subtitle')}</Text>
              </View>
            </View>
            <TouchableOpacity style={[S.menuBtn, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder }]} onPress={openDrawer}>
              <Ionicons name="menu-outline" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={S.authContent}>
          <View style={S.previewSection}>
            <Text style={S.previewTitle}>{t('community.whatsHappening')}</Text>
            {MOCK_POSTS.map((post) => (
              <View key={post.id} style={[S.postCard, S.postCardRow, { opacity: 0.5 }]}>
                <View style={[S.avatar, { backgroundColor: post.avatarColor }]}>
                  <Text style={S.avatarText}>{post.avatar}</Text>
                </View>
                <View style={S.postBody}>
                  <Text style={S.postAuthor}>{post.author}</Text>
                  <Text style={S.postContent} numberOfLines={2}>
                    {post.content}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={S.authCard}>
            <View style={S.authIcon}>
              <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
            </View>
            <Text style={S.authTitle}>{t('community.joinCommunity')}</Text>
            <Text style={S.authDesc}>{t('community.joinDesc')}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.88}>
              <LinearGradient
                colors={['#06B6D4', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={S.authLoginBtn}
              >
                <Text style={S.authLoginText}>{t('community.login')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={S.authRegisterBtn}
            >
              <Text style={S.authRegisterText}>{t('community.createFreeAccount')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }

  // ── Authenticated view ────────────────────────────────────────────────────

  return (
    <View style={S.container}>
      <LinearGradient
        colors={['#06B6D4', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[S.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={S.headerRow}>
          <View style={S.headerInfo}>
            <View style={S.headerBadge}>
              <Ionicons name="people" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[S.headerTitle, { color: '#fff' }]}>{t('community.title')}</Text>
              <Text style={S.headerSubtitle}>{t('community.subtitle')}</Text>
            </View>
          </View>
          <TouchableOpacity style={S.menuBtn} onPress={openDrawer}>
            <Ionicons name="menu-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.teal} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={S.feedContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />
          }
        >
          {posts.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
              <Text style={{ fontSize: FS.lg, color: COLORS.textMuted, fontFamily: FONT.regular }}>
                {t('community.noPostsYet')}
              </Text>
              <Text
                style={{ fontSize: FS.sm, color: COLORS.textMuted, marginTop: 6, fontFamily: FONT.regular }}
              >
                {t('community.beFirstToPost')}
              </Text>
            </View>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onToggleReaction={toggleReaction}
              onOpenComments={openComments}
              onDelete={handleDeletePost}
              onEdit={(p) => {
                setEditingPost(p)
                setNewPostContent(p.content)
                setShowCreate(true)
              }}
              t={t}
              S={S}
            />
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[S.fab, { bottom: 20 }]}
        onPress={() => setShowCreate(true)}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#06B6D4', '#0284C7']} style={S.fabInner}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={S.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={S.createModal}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>{editingPost ? t('community.editPost') : t('community.newPost')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCreate(false)
                    setNewPostContent('')
                    setEditingPost(null)
                  }}
                >
                  <Ionicons name="close" size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={S.createInput}
                value={newPostContent}
                onChangeText={setNewPostContent}
                placeholder={t('community.newPostPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                multiline
                textAlign={isRTL ? 'right' : 'left'}
                textAlignVertical="top"
                autoFocus
              />
              <TouchableOpacity
                onPress={editingPost ? saveEditPost : createPost}
                disabled={!newPostContent.trim() || creating}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    !newPostContent.trim() || creating
                      ? ['#94A3B8', '#94A3B8']
                      : ['#06B6D4', '#0284C7']
                  }
                  style={S.submitBtn}
                >
                  {creating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={S.submitBtnText}>{editingPost ? t('community.save') : t('community.publish')}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal visible={!!selectedPost} animationType="slide" transparent>
        <View style={S.modalOverlay}>
          <View style={[S.commentsModal, { paddingBottom: insets.bottom + 16 }]}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>{t('community.comments')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedPost(null)
                  setComments([])
                  setNewComment('')
                }}
              >
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {commentsLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.teal} />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(c) => c.id}
                contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
                ListEmptyComponent={
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
                    <Text style={{ color: COLORS.textMuted, fontFamily: FONT.regular, fontSize: FS.md }}>
                      {t('community.noCommentsYet')}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={S.commentCard}>
                    <View
                      style={[
                        S.smallAvatar,
                        { backgroundColor: getAvatarColor(item.author.name) },
                      ]}
                    >
                      <Text style={S.smallAvatarText}>{getInitials(item.author.name)}</Text>
                    </View>
                    <View style={S.commentBody}>
                      <Text style={S.commentAuthor}>{item.author.name}</Text>
                      <Text style={S.commentText}>{item.content}</Text>
                      <Text style={S.commentTime}>{formatTime(item.createdAt, t)}</Text>
                    </View>
                  </View>
                )}
              />
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={S.commentInputRow}>
                <TouchableOpacity
                  onPress={submitComment}
                  disabled={!newComment.trim() || submittingComment}
                  style={[S.sendBtn, { opacity: newComment.trim() ? 1 : 0.4 }]}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={S.commentInput}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder={t('community.commentPlaceholder')}
                  placeholderTextColor={COLORS.textMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  onSubmitEditing={submitComment}
                  returnKeyType="send"
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const row = isRTL ? 'row-reverse' : 'row'

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.canvas },

    header: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(15,18,33,0.07)',
    },
    headerRow: { flexDirection: row, alignItems: 'center', gap: 14, justifyContent: 'space-between' },
    headerInfo: { flexDirection: row, alignItems: 'center', gap: 14 },
    menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerBadge: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: 'rgba(0,245,212,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(0,245,212,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: FS.h3,
      fontWeight: '900',
      fontFamily: FONT.black,
      color: COLORS.text,
      textAlign: start,
    },
    headerSubtitle: {
      fontSize: FS.sm,
      fontFamily: FONT.regular,
      color: COLORS.textMuted,
      marginTop: 2,
      textAlign: start,
    },

    authContent: { padding: 20, paddingBottom: 40, gap: 16 },
    previewSection: { gap: 10 },
    previewTitle: {
      fontSize: FS.md,
      fontWeight: '800',
      fontFamily: FONT.extrabold,
      color: COLORS.textSecondary,
      textAlign: start,
      marginBottom: 4,
    },
    authCard: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.surfaceBorder,
      borderRadius: RADIUS.xxl,
      padding: 28,
      alignItems: 'center',
    },
    authIcon: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: 'rgba(47,108,255,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(47,108,255,0.28)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    authTitle: {
      fontSize: FS.xl,
      fontWeight: '800',
      fontFamily: FONT.extrabold,
      color: COLORS.text,
      marginBottom: 8,
    },
    authDesc: {
      fontSize: FS.md,
      fontFamily: FONT.regular,
      color: COLORS.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    authLoginBtn: {
      width: 280,
      height: 52,
      borderRadius: RADIUS.xl,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    authLoginText: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },
    authRegisterBtn: {
      height: 52,
      width: 280,
      borderRadius: RADIUS.xl,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: COLORS.teal,
    },
    authRegisterText: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: COLORS.teal },

    feedContent: { padding: 20, paddingBottom: 120, gap: 14 },

    postCard: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.surfaceBorder,
      borderRadius: RADIUS.xl,
      padding: 18,
    },
    adminPostCard: {
      borderColor: '#FCD34D',
      borderWidth: 1.5,
      backgroundColor: '#FFFBEB',
    },
    postCardRow: { flexDirection: row, alignItems: 'flex-start', gap: 12 },

    adminBadgeRow: { flexDirection: row, marginBottom: 10 },
    adminBadge: {
      flexDirection: row,
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#FEF3C7',
      borderWidth: 1,
      borderColor: '#FDE68A',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    adminBadgeText: {
      fontSize: 11,
      fontFamily: FONT.bold,
      fontWeight: '700',
      color: '#D97706',
    },

    postHeader: {
      flexDirection: row,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    postMeta: { alignItems: isRTL ? 'flex-end' : 'flex-start' },
    postHeaderActions: { flexDirection: row, alignItems: 'center', gap: 8 },
    postAuthor: {
      fontSize: FS.md,
      fontWeight: '700',
      fontFamily: FONT.bold,
      color: COLORS.text,
      textAlign: start,
    },
    postTime: {
      fontSize: FS.sm,
      fontFamily: FONT.regular,
      color: COLORS.textMuted,
      marginTop: 2,
      textAlign: start,
    },
    postBody: { flex: 1 },
    avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: FS.md, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },
    deleteBtn: { padding: 4 },
    postContent: {
      fontSize: FS.md,
      fontFamily: FONT.regular,
      color: COLORS.textSecondary,
      textAlign: start,
      lineHeight: 22,
    },
    postActions: {
      flexDirection: row,
      justifyContent: 'flex-start',
      gap: 16,
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: 'rgba(15,18,33,0.06)',
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionCount: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },

    fab: { position: 'absolute', right: 20, zIndex: 10 },
    fabInner: {
      width: 56,
      height: 56,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#0284C7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 8,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    createModal: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      gap: 14,
    },
    commentsModal: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '75%',
      flex: 0,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(15,18,33,0.07)',
    },
    modalTitle: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: COLORS.text },

    createInput: {
      borderWidth: 2,
      borderColor: 'rgba(15,18,33,0.1)',
      borderRadius: RADIUS.xl,
      padding: 14,
      minHeight: 120,
      fontFamily: FONT.regular,
      fontSize: FS.md,
      color: COLORS.text,
      backgroundColor: '#F8FAFC',
    },
    submitBtn: {
      height: 52,
      borderRadius: RADIUS.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitBtnText: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },

    commentCard: { flexDirection: row, gap: 10, alignItems: 'flex-start' },
    smallAvatar: {
      width: 34,
      height: 34,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    smallAvatarText: { fontSize: FS.sm, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },
    commentBody: { flex: 1 },
    commentAuthor: {
      fontSize: FS.sm,
      fontWeight: '700',
      fontFamily: FONT.bold,
      color: COLORS.text,
      textAlign: start,
    },
    commentText: {
      fontSize: FS.sm,
      fontFamily: FONT.regular,
      color: COLORS.textSecondary,
      textAlign: start,
      marginTop: 2,
      lineHeight: 18,
    },
    commentTime: {
      fontSize: 11,
      fontFamily: FONT.regular,
      color: COLORS.textMuted,
      textAlign: start,
      marginTop: 4,
    },

    commentInputRow: {
      flexDirection: row,
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(15,18,33,0.07)',
    },
    commentInput: {
      flex: 1,
      height: 42,
      borderWidth: 1.5,
      borderColor: 'rgba(15,18,33,0.1)',
      borderRadius: 14,
      paddingHorizontal: 14,
      fontFamily: FONT.regular,
      fontSize: FS.sm,
      color: COLORS.text,
      backgroundColor: '#F8FAFC',
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: COLORS.teal,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
  })
}
