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
import { useEffect, useMemo, useState } from 'react'
import { useActivity } from '../../hooks/useActivity'
import { useDrawer } from '../../context/DrawerContext'
import { useLanguage } from '../../i18n/LanguageContext'

const JOB_PORTALS = [
  {
    id: 'shaghalni',
    name: 'شغلني',
    nameEn: 'Shaghalni',
    tagline: 'ينغير حياة الناس',
    taglineEn: "Changing people's lives",
    description: 'آلاف الوظائف في مختلف المجالات تنتظرك، اكتشف فرصتك الآن',
    descriptionEn: 'Thousands of jobs across every field are waiting for you — discover your opportunity now.',
    color: '#0EA5E9',
    gradient: ['#0EA5E9', '#0284C7'] as const,
    icon: 'briefcase',
    url: 'https://shaghalni.com',
    count: '+12,000 وظيفة',
    countEn: '+12,000 jobs',
  },
  {
    id: 'wuzzuf',
    name: 'وظّف',
    nameEn: 'Wuzzuf',
    tagline: 'وظّفك في ثوانٍ',
    taglineEn: 'Get hired in seconds',
    description: 'أكبر منصة توظيف في مصر والشرق الأوسط. آلاف الوظائف في جميع التخصصات مع بحث ذكي.',
    descriptionEn: 'The largest recruitment platform in Egypt and the Middle East. Thousands of jobs across every specialty with smart search.',
    color: '#00B87A',
    gradient: ['#00875A', '#00B87A'] as const,
    icon: 'briefcase-outline',
    url: 'https://wuzzuf.net/jobs/egypt',
    count: '+70,000 وظيفة',
    countEn: '+70,000 jobs',
  },
  {
    id: 'forasna',
    name: 'فرصنا',
    nameEn: 'Forasna',
    tagline: 'فرصتك في انتظارك',
    taglineEn: 'Your opportunity is waiting',
    description: 'منصة مصرية للتوظيف والفرص المهنية. تقديم سهل بنقرة واحدة مع تنبيهات فورية.',
    descriptionEn: 'An Egyptian recruitment and career-opportunities platform. Easy one-click applications with instant alerts.',
    color: '#1A73E8',
    gradient: ['#0F52BA', '#1A73E8'] as const,
    icon: 'star-outline',
    url: 'https://www.forasna.com',
    count: '+25,000 وظيفة',
    countEn: '+25,000 jobs',
  },
]

export default function JobsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { t, isRTL, language } = useLanguage()
  const styles = useMemo(() => createStyles(isRTL), [isRTL])
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
        p.description.includes(query) ||
        p.descriptionEn.toLowerCase().includes(query.toLowerCase())
      )
    : JOB_PORTALS

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <View style={styles.headerBadge}>
              <Ionicons name="briefcase" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{t('jobs.title')}</Text>
              <Text style={styles.headerSubtitle}>{t('jobs.subtitle')}</Text>
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
            placeholder={t('jobs.searchPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            textAlign={isRTL ? 'right' : 'left'}
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
        <Text style={styles.sectionTitle}>{t('jobs.sectionTitle')}</Text>

        {filteredPortals.length === 0 && (
          <Text style={styles.noResults}>{t('jobs.noResults', { query })}</Text>
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
                <Text style={styles.portalName}>{language === 'ar' ? portal.name : portal.nameEn}</Text>
                <Text style={styles.portalTagline}>{language === 'ar' ? portal.tagline : portal.taglineEn}</Text>
              </View>
              <View style={styles.portalIconCircle}>
                <Ionicons name={portal.icon as any} size={28} color="#fff" />
              </View>
            </LinearGradient>

            <View style={styles.portalBody}>
              <Text style={styles.portalDesc}>{language === 'ar' ? portal.description : portal.descriptionEn}</Text>
              <View style={styles.portalFooter}>
                <TouchableOpacity
                  style={[styles.browseBtn, { backgroundColor: portal.color }]}
                  onPress={() => handleBrowse(portal.url)}
                >
                  <Text style={styles.browseBtnText}>{t('jobs.browseJobs')}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{language === 'ar' ? portal.count : portal.countEn}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
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
    headerRow: { flexDirection: row, alignItems: 'center', gap: 14, marginBottom: 18, justifyContent: 'space-between' },
    headerInfo: { flexDirection: row, alignItems: 'center', gap: 14 },
    menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
    headerBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
    headerText: {},
    headerTitle: { fontSize: FS.h3, fontWeight: '900', fontFamily: FONT.black, color: COLORS.text, textAlign: start },
    headerSubtitle: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, marginTop: 2, textAlign: start },

    searchBar: { flexDirection: row, alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingHorizontal: 16, height: 48 },
    searchInput: { flex: 1, fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.text, textAlign: start },
    noResults: { textAlign: 'center', color: COLORS.textMuted, fontFamily: FONT.regular, fontSize: FS.sm, paddingVertical: 32 },

    content: { padding: 20, paddingBottom: 40, gap: 16 },
    sectionTitle: { fontSize: FS.sm, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.textMuted, textAlign: start },

    portalCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xxl, overflow: 'hidden' },
    portalHeader: { padding: 18, flexDirection: row, justifyContent: 'space-between', alignItems: 'center' },
    portalInfo: {},
    portalName: { fontSize: FS.xl, fontWeight: '800', fontFamily: FONT.extrabold, color: '#fff', marginBottom: 2, textAlign: start },
    portalTagline: { fontSize: FS.sm, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.75)', textAlign: start },
    portalIconCircle: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },

    portalBody: { padding: 18 },
    portalDesc: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: start, lineHeight: 22, marginBottom: 16 },
    portalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    browseBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: RADIUS.full, paddingHorizontal: 18, paddingVertical: 10 },
    browseBtnText: { fontSize: FS.md, fontWeight: '700', fontFamily: FONT.bold, color: '#fff' },
    countBadge: { backgroundColor: COLORS.canvasAlt, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.surfaceBorder },
    countText: { fontSize: FS.sm, fontWeight: '600', fontFamily: FONT.semibold, color: COLORS.textMuted },
  })
}
