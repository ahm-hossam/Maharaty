import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '@/constants/theme'
import { api } from '../../services/api'
import { useActivity } from '../../hooks/useActivity'
import { useDrawer } from '../../context/DrawerContext'
import { useLanguage } from '../../i18n/LanguageContext'

// Sentinel for the "all categories" pill — stays Arabic since it's compared
// against backend category values, not displayed directly (label is translated).
const ALL_CATEGORY = 'الكل'

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  'تسويق رقمي': { icon: 'megaphone', color: '#F97316' },
  'برمجة وتقنية': { icon: 'code-slash', color: '#3B82F6' },
  'إدارة أعمال': { icon: 'business', color: '#8B5CF6' },
  'تصميم إبداعي': { icon: 'color-palette', color: '#EC4899' },
  'موارد بشرية': { icon: 'people', color: '#06B6D4' },
  'مبيعات': { icon: 'trending-up', color: '#10B981' },
  'مهارات مهنية': { icon: 'briefcase', color: '#0EA5E9' },
}
const FALLBACK_COLORS = ['#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#EAB308']

function getCategoryMeta(label: string, index: number) {
  if (CATEGORY_META[label]) return CATEGORY_META[label]
  return { icon: 'folder', color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }
}

interface ContentItem {
  id: string
  titleAr: string
  category?: string
  thumbnail?: string
  duration?: string
  type?: string
}

function ResultCard({
  item,
  index,
  onPress,
  S,
}: {
  item: ContentItem
  index: number
  onPress: () => void
  S: ReturnType<typeof createStyles>
}) {
  const meta = getCategoryMeta(item.category ?? '', index)

  return (
    <TouchableOpacity style={S.resultCard} onPress={onPress} activeOpacity={0.78}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={S.resultThumb} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[meta.color, meta.color + 'AA']}
          style={S.resultIconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={meta.icon as any} size={20} color="#fff" />
        </LinearGradient>
      )}
      <View style={S.resultTextBlock}>
        <Text style={S.resultTitle} numberOfLines={2}>{item.titleAr}</Text>
        {item.category && (
          <View style={[S.resultBadge, { backgroundColor: meta.color + '22', borderColor: meta.color + '55' }]}>
            <Text style={[S.resultBadgeText, { color: meta.color }]}>{item.category}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { openDrawer } = useDrawer()
  const { trackActivity } = useActivity()
  const { t, isRTL } = useLanguage()
  const S = useMemo(() => createStyles(isRTL), [isRTL])
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => clearTimeout(timer)
  }, [query])

  const { data: apiCategories = [] } = useQuery<string[]>({
    queryKey: ['content', 'categories'],
    queryFn: () => api.get('/content/categories').then((r) => r.data.data),
    staleTime: 60_000,
  })

  // "All" pill always first, matching the Learning Hub's category pills
  const categories = [
    { label: ALL_CATEGORY, icon: 'apps', color: COLORS.primary },
    ...apiCategories.map((label, i) => ({ label, ...getCategoryMeta(label, i) })),
  ]

  const categoryFilter = activeCategory === ALL_CATEGORY ? undefined : activeCategory

  const { data: results = [], isFetching } = useQuery<ContentItem[]>({
    queryKey: ['content', 'search', debouncedQuery, categoryFilter],
    queryFn: () =>
      api
        .get('/content', { params: { search: debouncedQuery || undefined, category: categoryFilter } })
        .then((r) => r.data.data?.content ?? []),
  })

  const handlePress = (item: ContentItem) => {
    trackActivity('VIEW_COURSE', { contentId: item.id, title: item.titleAr })
    router.push(`/(main)/learning/${item.id}`)
  }

  const isBrowsing = debouncedQuery.length === 0 && activeCategory === ALL_CATEGORY

  return (
    <View style={S.container}>
      <View style={[S.header, { paddingTop: insets.top + 16 }]}>
        <View style={S.headerRow}>
          <View>
            <Text style={S.headerTitle}>{t('search.title')}</Text>
            <Text style={S.headerSubtitle}>{t('search.subtitle')}</Text>
          </View>
          <TouchableOpacity style={S.menuBtn} onPress={openDrawer}>
            <Ionicons name="menu-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={S.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={S.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.searchPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            textAlign={isRTL ? 'right' : 'left'}
            selectionColor={COLORS.primary}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={S.categoriesGrid}>
          {categories.map((cat) => {
            const active = activeCategory === cat.label
            return (
              <TouchableOpacity
                key={cat.label}
                style={[
                  S.categoryPill,
                  active
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : { backgroundColor: COLORS.surface, borderColor: COLORS.surfaceBorder },
                ]}
                onPress={() => setActiveCategory(cat.label)}
                activeOpacity={0.75}
              >
                <Ionicons name={cat.icon as any} size={14} color={active ? '#fff' : COLORS.textMuted} />
                <Text style={[S.categoryPillText, { color: active ? '#fff' : COLORS.textMuted }]}>
                  {cat.label === ALL_CATEGORY ? t('search.all') : cat.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={S.sectionHeader}>
          <View style={S.sectionLine} />
          <Text style={S.sectionTitle}>{isBrowsing ? t('search.latest') : t('search.searchResults')}</Text>
        </View>

        {isFetching ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />
        ) : results.length === 0 ? (
          <View style={S.emptyCard}>
            <Ionicons name={isBrowsing ? 'construct-outline' : 'search-outline'} size={32} color={COLORS.primary} />
            <Text style={S.emptyTitle}>{isBrowsing ? t('search.emptyBrowsingTitle') : t('search.emptyResultsTitle')}</Text>
            <Text style={S.emptyText}>
              {isBrowsing ? t('search.emptyBrowsingText') : t('search.emptyResultsText')}
            </Text>
          </View>
        ) : (
          <View style={S.resultsList}>
            {results.map((item, i) => (
              <ResultCard key={item.id} item={item} index={i} onPress={() => handlePress(item)} S={S} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const createStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const row = isRTL ? 'row-reverse' : 'row'

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.canvas },
    header: { paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)' },
    headerRow: { flexDirection: row, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: FS.h3, fontWeight: '900', fontFamily: FONT.black, color: COLORS.text, textAlign: start },
    headerSubtitle: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: start },
    searchBox: { flexDirection: row, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingHorizontal: 16, height: 52, gap: 10 },
    searchInput: { flex: 1, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },

    content: { padding: 20, paddingBottom: 40, gap: 16 },
    sectionHeader: { flexDirection: row, alignItems: 'center', gap: 12 },
    sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(15,18,33,0.08)' },
    sectionTitle: { fontSize: FS.sm, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.textMuted, textAlign: start },

    categoriesGrid: { flexDirection: row, flexWrap: 'wrap', gap: 10, justifyContent: isRTL ? 'flex-end' : 'flex-start' },
    categoryPill: {
      flexDirection: row, alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1,
    },
    categoryPillText: { fontSize: FS.sm, fontFamily: FONT.semibold, textAlign: start },

    resultsList: { gap: 10 },
    resultCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, padding: 14, flexDirection: row, alignItems: 'center', gap: 12 },
    resultThumb: { width: 44, height: 44, borderRadius: 12 },
    resultIconCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    resultTextBlock: { flex: 1, gap: 6, alignItems: isRTL ? 'flex-end' : 'flex-start' },
    resultTitle: { fontSize: FS.md, fontWeight: '700', fontFamily: FONT.semibold, color: COLORS.text, textAlign: start },
    resultBadge: { borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
    resultBadgeText: { fontSize: FS.xs, fontWeight: '700', fontFamily: FONT.bold },

    emptyCard: { backgroundColor: 'rgba(47,108,255,0.08)', borderRadius: RADIUS.xl, padding: 24, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(47,108,255,0.2)' },
    emptyTitle: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: COLORS.primary },
    emptyText: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  })
}
