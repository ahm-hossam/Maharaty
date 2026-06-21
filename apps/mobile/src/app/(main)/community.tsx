import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '@/constants/theme'
import { useActivity } from '../../hooks/useActivity'
import { useAuthStore } from '../../store/authStore'

const POSTS = [
  {
    id: '1',
    author: 'سارة إبراهيم',
    time: 'منذ ساعتين',
    content: 'نصيحة ذهبية: خصص 30 دقيقة يومياً لتطوير مهارة جديدة. الاتساق هو المفتاح!',
    likes: 48,
    comments: 12,
    avatar: 'SI',
    avatarColor: '#8B5CF6',
  },
  {
    id: '2',
    author: 'محمد علي',
    time: 'منذ 4 ساعات',
    content: 'شاركت للتو في مقابلة عمل وانتهيت بنجاح 🎉 شكراً لمجتمع مهاراتي على الدعم والنصائح القيمة!',
    likes: 124,
    comments: 31,
    avatar: 'MA',
    avatarColor: '#06B6D4',
  },
  {
    id: '3',
    author: 'نور الحسن',
    time: 'أمس',
    content: 'هل هناك من يبحث عن شريك لتطوير مهارات البرمجة معاً؟ يمكننا تنظيم جلسات أسبوعية.',
    likes: 67,
    comments: 28,
    avatar: 'NH',
    avatarColor: '#F43F5E',
  },
]

export default function CommunityScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { trackActivity } = useActivity()
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated)
  const [likedPosts, setLikedPosts] = useState<string[]>([])

  useEffect(() => {
    trackActivity('VIEW_COMMUNITY')
  }, [])

  const toggleLike = (id: string) => {
    setLikedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerBadge}>
              <Ionicons name="people" size={20} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.headerTitle}>مجتمع مهاراتي</Text>
              <Text style={styles.headerSubtitle}>تواصل، شارك، تعلم</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.authContent}>
          {/* Preview of community */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>ماذا يحدث في المجتمع؟</Text>
            {POSTS.map(post => (
              <View key={post.id} style={[styles.postCard, styles.postCardRow, { opacity: 0.5 }]}>
                <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
                  <Text style={styles.avatarText}>{post.avatar}</Text>
                </View>
                <View style={styles.postBody}>
                  <Text style={styles.postAuthor}>{post.author}</Text>
                  <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Auth CTA */}
          <View style={styles.authCard}>
            <View style={styles.authIcon}>
              <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.authTitle}>انضم إلى المجتمع</Text>
            <Text style={styles.authDesc}>سجّل الدخول للوصول إلى كل المحتوى والتفاعل مع أعضاء المجتمع</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.88}>
              <LinearGradient
                colors={['#06B6D4', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.authLoginBtn}
              >
                <Text style={styles.authLoginText}>تسجيل الدخول</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.authRegisterBtn}>
              <Text style={styles.authRegisterText}>إنشاء حساب مجاني</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#06B6D4', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerBadge}>
            <Ionicons name="people" size={20} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>مجتمع مهاراتي</Text>
            <Text style={styles.headerSubtitle}>تواصل، شارك، تعلم</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.feedContent}>
        {POSTS.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postMeta}>
                <Text style={styles.postAuthor}>{post.author}</Text>
                <Text style={styles.postTime}>{post.time}</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
                <Text style={styles.avatarText}>{post.avatar}</Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
                <Text style={styles.actionCount}>{post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
                <Ionicons
                  name={likedPosts.includes(post.id) ? 'heart' : 'heart-outline'}
                  size={18}
                  color={likedPosts.includes(post.id) ? '#F43F5E' : '#64748B'}
                />
                <Text style={[styles.actionCount, likedPosts.includes(post.id) && { color: '#F43F5E' }]}>
                  {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  header: { paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)' },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
  headerBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(0,245,212,0.12)', borderWidth: 1, borderColor: 'rgba(0,245,212,0.25)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FS.h3, fontWeight: '900', fontFamily: FONT.black, color: COLORS.text, textAlign: 'right' },
  headerSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, marginTop: 2, textAlign: 'right' },

  authContent: { padding: 20, paddingBottom: 40, gap: 16 },
  previewSection: { gap: 10 },
  previewTitle: { fontSize: FS.md, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.textSecondary, textAlign: 'right', marginBottom: 4, letterSpacing: 0.5 },

  feedContent: { padding: 20, paddingBottom: 40, gap: 14 },

  postCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, padding: 18 },
  postCardRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 12 },
  postHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  postMeta: { alignItems: 'flex-end' },
  postAuthor: { fontSize: FS.md, fontWeight: '700', fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right' },
  postTime: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, marginTop: 2, textAlign: 'right' },
  postBody: { flex: 1, paddingLeft: 10 },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FS.md, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },
  postContent: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22 },
  postActions: { flexDirection: 'row-reverse', justifyContent: 'flex-start', gap: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(15,18,33,0.06)' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },

  authCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xxl, padding: 28, alignItems: 'center' },
  authIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(47,108,255,0.14)', borderWidth: 1, borderColor: 'rgba(47,108,255,0.28)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  authTitle: { fontSize: FS.xl, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.text, marginBottom: 8 },
  authDesc: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  authLoginBtn: { width: 280, height: 52, borderRadius: RADIUS.xl, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  authLoginText: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },
  authRegisterBtn: { height: 52, width: 280, borderRadius: RADIUS.xl, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.teal },
  authRegisterText: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: COLORS.teal },
})
