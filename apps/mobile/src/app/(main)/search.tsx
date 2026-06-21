import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '@/constants/theme'

const CATEGORIES = [
  { label: 'برمجة وتقنية', icon: 'code-slash', color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'تسويق رقمي', icon: 'megaphone', color: '#F97316', bg: '#FFF7ED' },
  { label: 'إدارة أعمال', icon: 'business', color: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'تصميم إبداعي', icon: 'color-palette', color: '#EC4899', bg: '#FDF2F8' },
  { label: 'مبيعات', icon: 'trending-up', color: '#10B981', bg: '#ECFDF5' },
  { label: 'موارد بشرية', icon: 'people', color: '#06B6D4', bg: '#ECFEFF' },
]

const TRENDING = [
  { title: 'مهارات الذكاء الاصطناعي 2026', icon: 'sparkles', views: '14K' },
  { title: 'كيف تكتب CV احترافي', icon: 'document-text', views: '9K' },
  { title: 'أسئلة المقابلة الأكثر شيوعاً', icon: 'mic', views: '21K' },
  { title: 'مهارات Excel المتقدمة', icon: 'grid', views: '7K' },
]

export default function SearchScreen() {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>اكتشف وتعلم</Text>
        <Text style={styles.headerSubtitle}>ابحث عن المهارات والدورات</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن مهارة، دورة، أو مجال..."
            placeholderTextColor={COLORS.textMuted}
            textAlign="right"
            selectionColor={COLORS.primary}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <Text style={styles.sectionTitle}>تصفح حسب المجال</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity key={i} style={[styles.categoryCard, { borderColor: cat.color + '35', backgroundColor: cat.color + '10' }]}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending */}
        <Text style={styles.sectionTitle}>الأكثر بحثاً</Text>
        <View style={styles.trendingList}>
          {TRENDING.map((item, i) => (
            <TouchableOpacity key={i} style={styles.trendingItem}>
              <Text style={styles.trendingViews}>{item.views} مشاهدة</Text>
              <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.trendingIconCircle}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="construct" size={32} color={COLORS.primary} />
          <Text style={styles.comingSoonTitle}>محتوى قيد التطوير</Text>
          <Text style={styles.comingSoonText}>
            نعمل على إضافة المزيد من الدورات والمهارات. ترقّب التحديثات!
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  header: { paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)' },
  headerTitle: { fontSize: FS.h3, fontWeight: '900', fontFamily: FONT.black, color: COLORS.text, textAlign: 'right', marginBottom: 4 },
  headerSubtitle: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', marginBottom: 16 },
  searchBox: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingHorizontal: 16, height: 52, gap: 10 },
  searchInput: { flex: 1, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text },

  content: { padding: 20, paddingBottom: 40, gap: 16 },
  sectionTitle: { fontSize: FS.sm, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.textMuted, textAlign: 'right', letterSpacing: 0.8, textTransform: 'uppercase' },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderRadius: RADIUS.xl, padding: 12, paddingHorizontal: 16, borderWidth: 1 },
  categoryIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  categoryLabel: { fontSize: FS.sm, fontWeight: '700', fontFamily: FONT.bold },

  trendingList: { gap: 10 },
  trendingItem: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, padding: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  trendingIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(47,108,255,0.14)', borderWidth: 1, borderColor: 'rgba(47,108,255,0.22)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  trendingTitle: { flex: 1, fontSize: FS.md, fontWeight: '600', fontFamily: FONT.semibold, color: COLORS.textSecondary, textAlign: 'right' },
  trendingViews: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '500', fontFamily: FONT.medium, flexShrink: 0 },

  comingSoonCard: { backgroundColor: 'rgba(47,108,255,0.08)', borderRadius: RADIUS.xl, padding: 24, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(47,108,255,0.2)' },
  comingSoonTitle: { fontSize: FS.lg, fontWeight: '700', fontFamily: FONT.bold, color: COLORS.primary },
  comingSoonText: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
})
