import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '../../../constants/theme'
import { api } from '../../../services/api'
import { useActivity } from '../../../hooks/useActivity'

const { width } = Dimensions.get('window')

// ─── Data ─────────────────────────────────────────────────────

// Icon + color mapping for known categories (fallback for unknown ones)
const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  'تسويق رقمي':  { icon: 'megaphone',      color: '#F97316' },
  'برمجة وتقنية': { icon: 'code-slash',    color: '#3B82F6' },
  'إدارة أعمال': { icon: 'business',        color: '#8B5CF6' },
  'تصميم إبداعي': { icon: 'color-palette', color: '#EC4899' },
  'موارد بشرية':  { icon: 'people',         color: '#06B6D4' },
  'مبيعات':       { icon: 'trending-up',   color: '#10B981' },
  'مهارات مهنية': { icon: 'briefcase',     color: '#0EA5E9' },
}
const FALLBACK_COLORS = ['#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#EAB308']

function getCategoryMeta(label: string, index: number) {
  if (CATEGORY_META[label]) return CATEGORY_META[label]
  return { icon: 'folder', color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }
}

// Static fallback data shown when API returns empty or during development
const STATIC_COURSES = [
  {
    id: 'static-1',
    titleAr: 'مهارات الذكاء الاصطناعي 2026',
    icon: 'sparkles',
    views: '14K',
    category: 'برمجة وتقنية',
    color: COLORS.primary,
  },
  {
    id: 'static-2',
    titleAr: 'كيف تكتب CV احترافي',
    icon: 'document-text',
    views: '9K',
    category: 'مهارات مهنية',
    color: '#10B981',
  },
  {
    id: 'static-3',
    titleAr: 'أسئلة المقابلة الأكثر شيوعاً',
    icon: 'mic',
    views: '21K',
    category: 'مهارات مهنية',
    color: COLORS.secondary,
  },
  {
    id: 'static-4',
    titleAr: 'أساسيات التسويق الرقمي',
    icon: 'megaphone',
    views: '7K',
    category: 'تسويق رقمي',
    color: '#F97316',
  },
  {
    id: 'static-5',
    titleAr: 'مهارات Excel المتقدمة',
    icon: 'grid',
    views: '7K',
    category: 'إدارة أعمال',
    color: '#8B5CF6',
  },
]

// ─── Course Card ──────────────────────────────────────────────

interface CourseItem {
  id: string
  titleAr: string
  icon?: string
  views?: string
  category: string
  color: string
  duration?: string
  thumbnail?: string
  type?: string
}

function CourseCard({ course, onPress }: { course: CourseItem; onPress: () => void }) {
  const color = course.color || COLORS.primary
  const icon  = course.icon || 'school'

  return (
    <TouchableOpacity style={S.courseCard} onPress={onPress} activeOpacity={0.78}>
      <View style={S.courseRow}>
        {/* Thumbnail or gradient icon */}
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} style={S.courseThumb} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[color, color + 'AA']}
            style={S.courseIconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={icon as any} size={20} color="#fff" />
          </LinearGradient>
        )}

        {/* Text block */}
        <View style={S.courseTextBlock}>
          <Text style={S.courseTitle} numberOfLines={2}>
            {course.titleAr}
          </Text>
          <View style={S.courseMeta}>
            {(course.views || course.duration) && (
              <View style={S.courseViewsRow}>
                <Ionicons name="eye-outline" size={12} color={COLORS.textMuted} />
                <Text style={S.courseViews}>{course.views || course.duration}</Text>
              </View>
            )}
            <View style={[S.courseBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
              <Text style={[S.courseBadgeText, { color }]}>{course.category}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─── Skeleton shimmer card ────────────────────────────────────

function SkeletonCard() {
  return (
    <View style={[S.courseCard, S.skeletonCard]}>
      <View style={S.courseRow}>
        <View style={S.skeletonIcon} />
        <View style={S.skeletonTextBlock}>
          <View style={S.skeletonLine} />
          <View style={[S.skeletonLine, { width: '60%', marginTop: 8 }]} />
        </View>
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────

export default function LearningHubScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { trackActivity } = useActivity()
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')

  const [refreshing, setRefreshing] = useState(false)

  const { data: apiResponse, isLoading, refetch: refetchContent } = useQuery({
    queryKey: ['content', 'published'],
    queryFn: () => api.get('/content').then((r) => r.data.data),
  })

  const { data: apiCategories = [], refetch: refetchCategories } = useQuery<string[]>({
    queryKey: ['content', 'categories'],
    queryFn: () => api.get('/content/categories').then((r) => r.data.data),
    staleTime: 60_000,
  })

  const { data: bannerConfig, refetch: refetchBanner } = useQuery({
    queryKey: ['banner'],
    queryFn: () => api.get('/banner').then((r) => r.data.data),
    staleTime: 30_000,
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchContent(), refetchCategories(), refetchBanner()])
    setRefreshing(false)
  }

  // Build category list: "الكل" always first, then API categories
  const categories = [
    { label: 'الكل', icon: 'apps', color: COLORS.primary },
    ...apiCategories.map((label, i) => ({ label, ...getCategoryMeta(label, i) })),
  ]

  // API returns { content: [...], pagination: {...} }
  const rawCourses: CourseItem[] = Array.isArray(apiResponse)
    ? apiResponse
    : (apiResponse?.content ?? [])

  const courses = rawCourses.filter((c: CourseItem) =>
    activeCategory === 'الكل' || c.category === activeCategory
  ).filter((c: CourseItem) =>
    !searchQuery || c.titleAr?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCoursePress = (course: CourseItem) => {
    trackActivity('VIEW_COURSE', { contentId: course.id, title: course.titleAr })
    router.push(`/(main)/learning/${course.id}`)
  }

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >

        {/* ── Header ── */}
        <View style={S.header}>
          {/* Top row: back button + title */}
          <View style={S.headerTopRow}>
            {/* Title (right) */}
            <Text style={S.headerTitle}>اكتشف وتعلّم</Text>
            {/* Back button (left) */}
            <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={S.headerSubtitle}>
            طوّر مهاراتك مع أفضل الدورات والمحتوى
          </Text>

          {/* Search bar */}
          <View style={S.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} style={S.searchIcon} />
            <TextInput
              style={S.searchInput}
              placeholder="ابحث عن مهارة، دورة، أو مجال..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>
        </View>

        {/* ── Category Pills ── */}
        <View style={S.categoryGrid}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.label
            return (
              <TouchableOpacity
                key={cat.label}
                style={[
                  S.categoryPill,
                  isActive
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : { backgroundColor: COLORS.surface, borderColor: COLORS.surfaceBorder },
                ]}
                onPress={() => setActiveCategory(cat.label)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isActive ? '#fff' : COLORS.textMuted}
                />
                <Text
                  style={[
                    S.categoryPillText,
                    { color: isActive ? '#fff' : COLORS.textMuted },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── Configurable Banner (from dashboard) ── */}
        {bannerConfig?.isActive && (
          <TouchableOpacity
            style={S.featuredWrapper}
            activeOpacity={0.88}
            onPress={() => {
              if (bannerConfig.contentId) {
                router.push(`/(main)/learning/${bannerConfig.contentId}`)
              }
            }}
            activeOpacity={bannerConfig.contentId ? 0.88 : 1}
          >
            <LinearGradient
              colors={[bannerConfig.bgColor1 || COLORS.primary, bannerConfig.bgColor2 || COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={S.featuredCard}
            >
              <View style={S.featuredOverlay} />

              <View style={S.featuredIconTop}>
                <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.85)" />
              </View>

              <View style={S.featuredContent}>
                {bannerConfig.title ? (
                  <Text style={S.featuredTitle} numberOfLines={2}>{bannerConfig.title}</Text>
                ) : null}
                {bannerConfig.subtitle ? (
                  <Text style={S.featuredSubtitle} numberOfLines={2}>{bannerConfig.subtitle}</Text>
                ) : null}
              </View>

              <View style={S.featuredBottom}>
                {bannerConfig.contentTitle ? (
                  <View style={S.featuredViewsChip}>
                    <Ionicons name="folder-outline" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={S.featuredViewsText}>{bannerConfig.contentTitle}</Text>
                  </View>
                ) : <View />}
                {bannerConfig.ctaText ? (
                  <TouchableOpacity
                    style={S.featuredCTA}
                    activeOpacity={0.8}
                    onPress={() => bannerConfig.contentId && router.push(`/(main)/learning/${bannerConfig.contentId}`)}
                  >
                    <Text style={S.featuredCTAText}>{bannerConfig.ctaText}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Section Title ── */}
        <View style={S.sectionHeader}>
          <View style={S.sectionLine} />
          <Text style={S.sectionTitle}>الدورات الموصى بها</Text>
        </View>

        {/* ── Course Cards ── */}
        <View style={S.courseList}>
          {isLoading
            ? [1, 2, 3].map((k) => <SkeletonCard key={k} />)
            : courses.length === 0
              ? (
                <View style={S.emptyState}>
                  <Ionicons name="school-outline" size={40} color={COLORS.textMuted} />
                  <Text style={S.emptyText}>لا توجد دورات منشورة حالياً</Text>
                  <Text style={S.emptySubText}>ترقّب! قريباً سيتم إضافة محتوى جديد</Text>
                </View>
              )
              : courses.map((course: CourseItem) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onPress={() => handleCoursePress(course)}
                />
              ))}
        </View>

        {/* ── Coming Soon Card ── */}
        <View style={S.comingSoonWrapper}>
          <View style={S.comingSoonCard}>
            <LinearGradient
              colors={[COLORS.primary + '22', COLORS.primary + '08']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={S.comingSoonGrad}
            >
              <View style={S.comingSoonIconWrap}>
                <Ionicons name="construct" size={28} color={COLORS.primary} />
              </View>
              <Text style={S.comingSoonText}>المزيد من المحتوى قريباً</Text>
              <Text style={S.comingSoonSub}>نعمل على إضافة دورات ومسارات تعليمية جديدة</Text>
            </LinearGradient>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },

  scrollContent: {
    paddingBottom: 60,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.sm,
  },

  headerTitle: {
    fontSize: FS.h2,
    fontFamily: FONT.black,
    color: COLORS.text,
    textAlign: 'right',
  },

  headerSubtitle: {
    fontSize: FS.sm,
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
    textAlign: 'right',
    lineHeight: 20,
  },

  // ── Search bar ──
  searchBar: {
    height: 52,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    gap: 10,
  },

  searchIcon: {
    flexShrink: 0,
  },

  searchInput: {
    flex: 1,
    fontSize: FS.md,
    fontFamily: FONT.regular,
    color: COLORS.text,
    textAlign: 'right',
    paddingVertical: 0,
  },

  // ── Category pills ──
  categoryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  categoryPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },

  categoryPillText: {
    fontSize: FS.sm,
    fontFamily: FONT.semibold,
    textAlign: 'right',
  },

  // ── Featured card ──
  featuredWrapper: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },

  featuredCard: {
    height: 220,
    borderRadius: RADIUS.xxl,
    padding: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...SHADOW.md,
  },

  featuredIconTop: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.9,
  },

  featuredContent: {
    gap: 8,
    marginTop: 4,
  },

  featuredTitle: {
    fontSize: FS.h2,
    fontFamily: FONT.black,
    color: '#fff',
    textAlign: 'right',
  },

  featuredSubtitle: {
    fontSize: FS.sm,
    fontFamily: FONT.regular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    lineHeight: 19,
  },

  featuredBottom: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  featuredViewsChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },

  featuredViewsText: {
    fontSize: FS.xs,
    fontFamily: FONT.medium,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
  },

  featuredCTA: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  featuredCTAText: {
    fontSize: FS.sm,
    fontFamily: FONT.bold,
    color: '#fff',
    textAlign: 'right',
  },

  // ── Section title ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    justifyContent: 'flex-end',
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(15,18,33,0.08)',
  },

  sectionTitle: {
    fontSize: FS.sm,
    fontFamily: FONT.extrabold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'right',
  },

  // ── Course list ──
  courseList: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: FS.md,
    fontFamily: FONT.bold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: FS.sm,
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  courseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },

  courseRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },

  courseThumb: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    flexShrink: 0,
    backgroundColor: COLORS.surfaceBorder,
  },

  courseIconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  featuredBgImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xxl,
    opacity: 0.35,
  },

  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: RADIUS.xxl,
  },

  courseTextBlock: {
    flex: 1,
    gap: 8,
  },

  courseTitle: {
    fontSize: FS.md,
    fontFamily: FONT.bold,
    color: COLORS.text,
    textAlign: 'right',
    lineHeight: 22,
  },

  courseMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  courseViewsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },

  courseViews: {
    fontSize: FS.xs,
    fontFamily: FONT.medium,
    color: COLORS.textMuted,
    textAlign: 'right',
  },

  courseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },

  courseBadgeText: {
    fontSize: FS.xs,
    fontFamily: FONT.semibold,
    textAlign: 'right',
  },

  // ── Skeleton shimmer ──
  skeletonCard: {
    backgroundColor: COLORS.surface,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(15,18,33,0.07)',
    flexShrink: 0,
  },
  skeletonTextBlock: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(15,18,33,0.07)',
    width: '85%',
    alignSelf: 'flex-end',
  },

  // ── Coming soon ──
  comingSoonWrapper: {
    paddingHorizontal: 24,
  },

  comingSoonCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },

  comingSoonGrad: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },

  comingSoonIconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary + '18',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  comingSoonText: {
    fontSize: FS.md,
    fontFamily: FONT.extrabold,
    color: COLORS.text,
    textAlign: 'center',
  },

  comingSoonSub: {
    fontSize: FS.sm,
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
})
