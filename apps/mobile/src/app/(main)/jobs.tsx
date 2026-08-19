import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '@/constants/theme'
import { useEffect, useState } from 'react'
import { useActivity } from '../../hooks/useActivity'
import { useDrawer } from '../../context/DrawerContext'

const JOB_PORTALS = [
  {
    id: 'shaghalni',
    name: 'شغلني',
    nameEn: 'Shaghlni',
    tagline: 'ينغير حياة الناس',
    description: 'آلاف الوظائف في مختلف المجالات تنتظرك، اكتشف فرصتك الآن',
    color: '#0EA5E9',
    gradient: ['#0EA5E9', '#0284C7'] as const,
    icon: 'briefcase',
    url: 'https://shaghalni.com',
    count: '+12,000 وظيفة',
  },
  {
    id: 'wuzzuf',
    name: 'وظّف',
    nameEn: 'Wuzzuf',
    tagline: 'وظّفك في ثوانٍ',
    description: 'أكبر منصة توظيف في مصر والشرق الأوسط. آلاف الوظائف في جميع التخصصات مع بحث ذكي.',
    color: '#00B87A',
    gradient: ['#00875A', '#00B87A'] as const,
    icon: 'briefcase-outline',
    url: 'https://wuzzuf.net/jobs/egypt',
    count: '+70,000 وظيفة',
  },
  {
    id: 'forasna',
    name: 'فرصنا',
    nameEn: 'Forasna',
    tagline: 'فرصتك في انتظارك',
    description: 'منصة مصرية للتوظيف والفرص المهنية. تقديم سهل بنقرة واحدة مع تنبيهات فورية.',
    color: '#1A73E8',
    gradient: ['#0F52BA', '#1A73E8'] as const,
    icon: 'star-outline',
    url: 'https://www.forasna.com',
    count: '+25,000 وظيفة',
  },
]

export default function JobsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { trackActivity } = useActivity()
  const { openDrawer } = useDrawer()

  useEffect(() => {
    trackActivity('VIEW_JOBS')
  }, [])

  const handleBrowse = (url: string) => {
    Linking.openURL(url)
  }

  const filteredPortals = query.trim()
    ? JOB_PORTALS.filter((p) =>
        p.name.includes(query) ||
        p.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        p.description.includes(query)
      )
    : JOB_PORTALS

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14 }}>
            <View style={styles.headerBadge}>
              <Ionicons name="briefcase" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>فرص العمل</Text>
              <Text style={styles.headerSubtitle}>اكتشف الوظيفة المناسبة لك</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
            <Ionicons name="menu-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن وظيفة أو شركة..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            textAlign="right"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium portals entry */}
        {/* <TouchableOpacity
          style={styles.portalsEntryCard}
          activeOpacity={0.88}
          onPress={() => router.push('/(main)/jobs/portals' as any)}
        >
          <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.portalsEntryGrad}>
            <View style={{ flex: 1 }}>
              <Text style={styles.portalsEntryTitle}>بوابات التوظيف المتكاملة</Text>
              <Text style={styles.portalsEntrySub}>شغلني · iCareer — كلها في مكان واحد</Text>
            </View>
            <View style={styles.portalsEntryArrow}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity> */}

        <Text style={styles.sectionTitle}>مصادر الوظائف</Text>

        {filteredPortals.length === 0 && (
          <Text style={styles.noResults}>لا توجد نتائج لـ "{query}"</Text>
        )}
        {filteredPortals.map((portal) => (
          <View key={portal.id} style={styles.portalCard}>
            <LinearGradient
              colors={portal.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.portalHeader}
            >
              <View style={styles.portalInfo}>
                <Text style={styles.portalName}>{portal.name}</Text>
                <Text style={styles.portalTagline}>{portal.tagline}</Text>
              </View>
              <View style={styles.portalIconCircle}>
                <Ionicons name={portal.icon as any} size={28} color="#fff" />
              </View>
            </LinearGradient>

            <View style={styles.portalBody}>
              <Text style={styles.portalDesc}>{portal.description}</Text>
              <View style={styles.portalFooter}>
                <TouchableOpacity
                  style={[styles.browseBtn, { backgroundColor: portal.color }]}
                  onPress={() => handleBrowse(portal.url)}
                >
                  <Text style={styles.browseBtnText}>تصفح الوظائف</Text>
                  <Ionicons name="arrow-back" size={16} color="#fff" />
                </TouchableOpacity>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{portal.count}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Tips Card */}
        {/* <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={COLORS.primary} />
            <Text style={styles.tipsTitle}>نصيحة للباحثين عن عمل</Text>
          </View>
          <Text style={styles.tipsText}>
            قبل التقديم، تأكد من تحديث سيرتك الذاتية واستخدام كلمات مفتاحية مرتبطة بالوظيفة المطلوبة لزيادة فرص القبول.
          </Text>
        </View> */}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },

  header: { paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)' },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, marginBottom: 18, justifyContent: 'space-between' },
  menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  headerBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  headerText: {},
  headerTitle: { fontSize: FS.h3, fontWeight: '900', fontFamily: FONT.black, color: COLORS.text, textAlign: 'right' },
  headerSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, marginTop: 2, textAlign: 'right' },

  searchBar: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingHorizontal: 16, height: 48 },
  searchInput: { flex: 1, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text, textAlign: 'right' },
  noResults: { textAlign: 'center', color: COLORS.textMuted, fontFamily: FONT.regular, fontSize: FS.sm, paddingVertical: 32 },

  content: { padding: 20, paddingBottom: 40, gap: 16 },
  sectionTitle: { fontSize: FS.sm, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.textMuted, textAlign: 'right', letterSpacing: 0.8, textTransform: 'uppercase' },

  portalCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xxl, overflow: 'hidden' },
  portalHeader: { padding: 18, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  portalInfo: {},
  portalName: { fontSize: FS.xl, fontWeight: '800', fontFamily: FONT.extrabold, color: '#fff', marginBottom: 2, textAlign: 'right' },
  portalTagline: { fontSize: FS.sm, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  portalIconCircle: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },

  portalBody: { padding: 18 },
  portalDesc: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', lineHeight: 22, marginBottom: 16 },
  portalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  browseBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: RADIUS.full, paddingHorizontal: 18, paddingVertical: 10 },
  browseBtnText: { fontSize: FS.md, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },
  countBadge: { backgroundColor: COLORS.canvasAlt, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  countText: { fontSize: FS.sm, fontWeight: '600', fontFamily: FONT.semibold, color: COLORS.textMuted },

  tipsCard: { backgroundColor: 'rgba(47,108,255,0.08)', borderRadius: RADIUS.xl, padding: 18, borderWidth: 1, borderColor: 'rgba(47,108,255,0.22)' },
  tipsHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 10 },
  tipsTitle: { fontSize: FS.md, fontWeight: '700', fontFamily: FONT.bold, color: COLORS.primary },
  tipsText: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', lineHeight: 22 },

  portalsEntryCard: { borderRadius: RADIUS.xxl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(47,108,255,0.3)' },
  portalsEntryGrad: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20, gap: 12 },
  portalsEntryTitle: { fontSize: FS.lg, fontWeight: '800', fontFamily: FONT.extrabold, color: '#fff', textAlign: 'right' },
  portalsEntrySub: { fontSize: FS.sm, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: 3 },
  portalsEntryArrow: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
})
