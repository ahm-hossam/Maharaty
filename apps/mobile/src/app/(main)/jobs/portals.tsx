import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useRef, useEffect, useMemo } from 'react'
import { COLORS, RADIUS, FONT } from '@/constants/theme'
import { useLanguage } from '../../../i18n/LanguageContext'
import { strings } from '../../../i18n/strings'

// ─── Portal Data ──────────────────────────────────────────────
// Portal marketing copy (tagline/description/features/badge) has English
// variants below, unlike backend-sourced content elsewhere in the app.

interface Portal {
  id: string
  nameAr: string
  nameEn: string
  tagline: string
  taglineEn: string
  description: string
  descriptionEn: string
  gradient: [string, string, string]
  accentColor: string
  icon: string
  url: string
  deepLink?: string
  jobCount: string
  features: string[]
  featuresEn: string[]
  badge?: string
  badgeEn?: string
}

const PORTALS: Portal[] = [
  {
    id: 'shaghalni',
    nameAr: 'شغلني',
    nameEn: 'Shaghlni',
    tagline: 'بيغير حياة الناس',
    taglineEn: "Changing people's lives",
    description: 'المنصة الرائدة في المملكة العربية السعودية للوظائف في جميع المجالات. تجربة تقديم سلسة مع إشعارات فورية بحالة طلبك.',
    descriptionEn: 'The leading platform in Saudi Arabia for jobs across every field. A seamless application experience with instant status notifications.',
    gradient: ['#0369A1', '#0EA5E9', '#38BDF8'],
    accentColor: '#0EA5E9',
    icon: 'briefcase',
    url: 'https://www.shaghalni.com',
    jobCount: '+50K',
    features: ['AI مطابقة ذكية', 'إشعارات فورية', 'رفع CV مباشر'],
    featuresEn: ['AI smart matching', 'Instant notifications', 'Direct CV upload'],
    badge: 'الأكثر استخداماً',
    badgeEn: 'Most Popular',
  },
  {
    id: 'wuzzuf',
    nameAr: 'وظّف',
    nameEn: 'Wuzzuf',
    tagline: 'وظّفك في ثوانٍ',
    taglineEn: 'Get hired in seconds',
    description: 'أكبر منصة توظيف في مصر والشرق الأوسط. آلاف الوظائف في جميع التخصصات مع بحث ذكي وتصفية متقدمة.',
    descriptionEn: 'The largest recruitment platform in Egypt and the Middle East. Thousands of jobs across every specialty with smart search and advanced filtering.',
    gradient: ['#00875A', '#00B87A', '#34D399'],
    accentColor: '#00B87A',
    icon: 'briefcase',
    url: 'https://wuzzuf.net/jobs/egypt',
    jobCount: '+70K',
    features: ['بحث ذكي متقدم', 'تصفية حسب التخصص', 'تنبيهات الوظائف'],
    featuresEn: ['Advanced smart search', 'Filter by specialty', 'Job alerts'],
    badge: 'مصر والشرق الأوسط',
    badgeEn: 'Egypt & Middle East',
  },
  {
    id: 'forasna',
    nameAr: 'فرصنا',
    nameEn: 'Forasna',
    tagline: 'فرصتك في انتظارك',
    taglineEn: 'Your opportunity is waiting',
    description: 'منصة مصرية متخصصة في الوظائف والفرص المهنية. تقديم سهل بنقرة واحدة مع تنبيهات فورية لأحدث الإعلانات.',
    descriptionEn: 'An Egyptian platform specialized in jobs and career opportunities. Easy one-click applications with instant alerts for the latest postings.',
    gradient: ['#0F52BA', '#1A73E8', '#4FC3F7'],
    accentColor: '#1A73E8',
    icon: 'star',
    url: 'https://www.forasna.com',
    jobCount: '+25K',
    features: ['وظائف محلية', 'تقديم بنقرة واحدة', 'تنبيهات فورية'],
    featuresEn: ['Local jobs', 'One-click applications', 'Instant alerts'],
  },
  {
    id: 'linkedin',
    nameAr: 'LinkedIn',
    nameEn: 'LinkedIn',
    tagline: 'شبكتك المهنية العالمية',
    taglineEn: 'Your global professional network',
    description: 'المنصة المهنية الأكبر عالمياً. ابنِ شبكتك، تواصل مع أصحاب العمل، وابحث عن فرص عمل محلية ودولية.',
    descriptionEn: 'The largest professional platform in the world. Build your network, connect with employers, and find local and international job opportunities.',
    gradient: ['#0A66C2', '#0077B5', '#00A0DC'],
    accentColor: '#0A66C2',
    icon: 'people',
    url: 'https://www.linkedin.com/jobs',
    deepLink: 'linkedin://jobs',
    jobCount: '+1M',
    features: ['شبكة عالمية', 'Easy Apply', 'تواصل مع مسؤولي التوظيف'],
    featuresEn: ['Global network', 'Easy Apply', 'Connect with recruiters'],
    badge: 'عالمي',
    badgeEn: 'Global',
  },
]

// ─── Portal Detail Sheet ──────────────────────────────────────

function PortalDetailSheet({
  portal, visible, onClose, language, t, isRTL,
}: {
  portal: Portal | null
  visible: boolean
  onClose: () => void
  language: 'ar' | 'en'
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}) {
  const insets   = useSafeAreaInsets()
  const router   = useRouter()
  const slideAnim = useRef(new Animated.Value(700)).current
  const DS = useMemo(() => createDetailSheetStyles(isRTL), [isRTL])

  const open = () => Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }).start()
  const close = () => Animated.timing(slideAnim, { toValue: 700, duration: 260, useNativeDriver: true }).start(() => onClose())

  const handleOpen = () => {
    if (!portal) return
    onClose()
    const name = language === 'ar' ? portal.nameAr : portal.nameEn
    router.push({
      pathname: '/(main)/jobs/InternalBrowser',
      params: { url: portal.url, name: t('jobPortals.portalPageTitle', { name }), accent: portal.accentColor },
    } as any)
  }

  if (!portal) return null

  const name = language === 'ar' ? portal.nameAr : portal.nameEn
  const tagline = language === 'ar' ? portal.tagline : portal.taglineEn
  const description = language === 'ar' ? portal.description : portal.descriptionEn
  const features = language === 'ar' ? portal.features : portal.featuresEn
  const badge = language === 'ar' ? portal.badge : portal.badgeEn

  return (
    <Modal visible={visible} transparent animationType="none" onShow={open} onRequestClose={close}>
      <View style={DS.bg}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
      </View>
      <Animated.View style={[DS.sheet, { paddingBottom: insets.bottom + 24, transform: [{ translateY: slideAnim }] }]}>
        <View style={DS.inner}>
          {/* Handle */}
          <View style={DS.handle} />

          {/* Portal header */}
          <View style={DS.portalHeader}>
            <LinearGradient
              colors={portal.gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={DS.iconWrap}
            >
              <Ionicons name={portal.icon as any} size={28} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={DS.nameRow}>
                <Text style={DS.portalName}>{name}</Text>
                {badge && (
                  <View style={[DS.badgeChip, { backgroundColor: portal.accentColor + '22', borderColor: portal.accentColor + '55' }]}>
                    <Text style={[DS.badgeText, { color: portal.accentColor }]}>{badge}</Text>
                  </View>
                )}
              </View>
              <Text style={DS.tagline}>{tagline}</Text>
              <View style={DS.jobCountRow}>
                <Text style={[DS.jobCount, { color: portal.accentColor }]}>{portal.jobCount}</Text>
                <Text style={DS.jobCountLabel}>{t('jobPortals.jobCountAvailable')}</Text>
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={DS.content}>
            {/* Description */}
            <Text style={DS.description}>{description}</Text>

            {/* Features */}
            <Text style={DS.featuresLabel}>{t('jobPortals.featuresLabel')}</Text>
            <View style={DS.featuresList}>
              {features.map((f, i) => (
                <View key={i} style={[DS.featureRow, { borderColor: portal.accentColor + '30', backgroundColor: portal.accentColor + '08' }]}>
                  <Text style={[DS.featureText]}>{f}</Text>
                  <View style={[DS.featureIconWrap, { backgroundColor: portal.accentColor + '20' }]}>
                    <Ionicons name="checkmark" size={13} color={portal.accentColor} />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* CTA */}
          <View style={DS.cta}>
            <TouchableOpacity onPress={handleOpen} style={DS.ctaBtn} activeOpacity={0.88}>
              <LinearGradient
                colors={portal.gradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={DS.ctaGrad}
              >
                <Text style={DS.ctaText}>{t('jobPortals.openPlatform')}</Text>
                <Ionicons name="open-outline" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  )
}

const createDetailSheetStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  // These rows pack toward the reading start via justifyContent, so
  // flexDirection stays physically fixed — only the pack side toggles.
  const justifyStart = isRTL ? 'flex-end' : 'flex-start' as const

  return StyleSheet.create({
    bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
    sheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl,
      overflow: 'hidden', maxHeight: '82%',
    },
    inner: { flex: 1, paddingTop: 14, backgroundColor: '#FFFFFF' },
    handle: { width: 38, height: 4, backgroundColor: 'rgba(15,18,33,0.15)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },

    portalHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 18,
      paddingHorizontal: 24, marginBottom: 24,
    },
    iconWrap: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: justifyStart },
    portalName: { fontSize: 22, fontWeight: '900', color: COLORS.text, fontFamily: FONT.black },
    tagline: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold, textAlign: start },
    jobCountRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: justifyStart },
    jobCount: { fontSize: 18, fontWeight: '900', fontFamily: FONT.black },
    jobCountLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
    badgeChip: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 10, fontWeight: '800', fontFamily: FONT.extrabold },

    content: { paddingHorizontal: 24, paddingBottom: 16 },
    description: { fontSize: 14, color: COLORS.textSecondary, textAlign: start, lineHeight: 24, marginBottom: 24, fontFamily: FONT.regular },

    featuresLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '800', textAlign: start, marginBottom: 14, fontFamily: FONT.extrabold },
    featuresList: { gap: 10 },
    featureRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderWidth: 1, borderRadius: RADIUS.xl, padding: 14,
    },
    featureText: { fontSize: 14, color: COLORS.text, fontWeight: '600', textAlign: start, fontFamily: FONT.semibold },
    featureIconWrap: { width: 28, height: 28, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },

    cta: { paddingHorizontal: 24, paddingTop: 16 },
    ctaBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
    ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
    ctaText: { fontSize: 16, color: '#fff', fontWeight: '900', fontFamily: FONT.black },
  })
}

// ─── Bento Portal Card ────────────────────────────────────────

function BentoPortalCard({
  portal, onPress, large = false, language, t, BPC,
}: {
  portal: Portal
  onPress: () => void
  large?: boolean
  language: 'ar' | 'en'
  t: (key: string, params?: Record<string, string | number>) => string
  BPC: ReturnType<typeof createBentoStyles>
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const press   = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 80 }).start()
  const release = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start()

  const name = language === 'ar' ? portal.nameAr : portal.nameEn
  const tagline = language === 'ar' ? portal.tagline : portal.taglineEn
  const badge = language === 'ar' ? portal.badge : portal.badgeEn

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, large ? BPC.cardLarge : BPC.cardSmall]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        onPressIn={press}
        onPressOut={release}
        activeOpacity={1}
      />

      {/* Glass surface — box-none so its empty space doesn't block the
          absoluteFill TouchableOpacity beneath it (it renders on top in
          native z-order since it's the later sibling) */}
      <View style={[BPC.glass, { borderColor: portal.accentColor + '22' }]} pointerEvents="none">
        {/* Gradient orb bg */}
        <View style={BPC.gradientOrb}>
          <LinearGradient
            colors={[portal.accentColor + '30', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Icon */}
        <LinearGradient
          colors={portal.gradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[BPC.icon, { shadowColor: portal.accentColor }]}
        >
          <Ionicons name={portal.icon as any} size={large ? 26 : 22} color="#fff" />
        </LinearGradient>

        {/* Content */}
        <View style={BPC.textWrap}>
          <View style={BPC.nameRow}>
            <Text style={[BPC.name, large && BPC.nameLarge]}>{name}</Text>
            {badge && (
              <View style={[BPC.badge, { backgroundColor: portal.accentColor + '25' }]}>
                <Text style={[BPC.badgeLabel, { color: portal.accentColor }]}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={BPC.tagline} numberOfLines={1}>{tagline}</Text>
          <Text style={[BPC.jobCount, { color: portal.accentColor }]}>{portal.jobCount} {t('jobPortals.jobCountSuffix')}</Text>
        </View>

        {/* Arrow */}
        <View style={[BPC.arrowBtn, { borderColor: portal.accentColor + '40', backgroundColor: portal.accentColor + '10' }]}>
          <Ionicons name="arrow-forward" size={14} color={portal.accentColor} />
        </View>
      </View>
    </Animated.View>
  )
}

const createBentoStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const justifyStart = isRTL ? 'flex-end' : 'flex-start' as const

  return StyleSheet.create({
    cardSmall: { flex: 1, minHeight: 180, borderRadius: RADIUS.xxl, overflow: 'hidden' },
    cardLarge: { width: '100%', height: 140, borderRadius: RADIUS.xxl, overflow: 'hidden' },

    glass: {
      flex: 1, backgroundColor: COLORS.surface,
      borderWidth: 1, borderRadius: RADIUS.xxl,
      padding: 20, gap: 10, overflow: 'hidden',
    },
    // Decorative only — position doesn't carry reading-direction meaning, kept fixed.
    gradientOrb: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },

    icon: {
      width: 50, height: 50, borderRadius: 16,
      justifyContent: 'center', alignItems: 'center',
      shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 12, elevation: 8,
    },
    textWrap: { gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: justifyStart },
    name: { fontSize: 16, fontWeight: '900', color: COLORS.text, textAlign: start, fontFamily: FONT.black },
    nameLarge: { fontSize: 18, fontFamily: FONT.black },
    badge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    badgeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, fontFamily: FONT.extrabold },
    tagline: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textAlign: start, fontFamily: FONT.semibold },
    jobCount: { fontSize: 13, fontWeight: '800', textAlign: start, fontFamily: FONT.extrabold },
    // Forward-CTA arrow — physically fixed bottom-left with a right-pointing
    // icon, like the "Browse Jobs" button on the jobs list screen.
    arrowBtn: {
      position: 'absolute', bottom: 16, left: 16,
      width: 30, height: 30, borderRadius: 10,
      borderWidth: 1, justifyContent: 'center', alignItems: 'center',
    },
  })
}

// ─── Tip Carousel ─────────────────────────────────────────────

function TipsCarousel({ tips, TC }: { tips: readonly string[]; TC: ReturnType<typeof createTipsStyles> }) {
  const [tipIdx, setTipIdx] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    setTipIdx(0)
  }, [tips])

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start()
      setTipIdx((i) => (i + 1) % tips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [tips])

  return (
    <View style={TC.wrap}>
      <View style={TC.iconWrap}>
        <Ionicons name="bulb" size={16} color="#F59E0B" />
      </View>
      <Animated.Text style={[TC.text, { opacity: fadeAnim }]} numberOfLines={2}>
        {tips[tipIdx]}
      </Animated.Text>
    </View>
  )
}

const createTipsStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      backgroundColor: 'rgba(245,158,11,0.08)',
      borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
      borderRadius: RADIUS.xl, padding: 16, marginHorizontal: 24, marginBottom: 24,
    },
    iconWrap: {
      width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.18)',
      justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    text: { flex: 1, fontSize: 13, color: COLORS.textSecondary, textAlign: start, lineHeight: 21, fontWeight: '500', fontFamily: FONT.medium },
  })
}

// ─── Main Screen ──────────────────────────────────────────────

export default function JobPortalsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { t, isRTL, language } = useLanguage()
  const S = useMemo(() => createStyles(isRTL), [isRTL])
  const BPC = useMemo(() => createBentoStyles(isRTL), [isRTL])
  const TC = useMemo(() => createTipsStyles(isRTL), [isRTL])
  const tips = strings[language].jobPortals.tips
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  const openPortal = (portal: Portal) => {
    setSelectedPortal(portal)
    setSheetVisible(true)
  }

  const shaghalni = PORTALS.find((p) => p.id === 'shaghalni')!
  const wuzzuf    = PORTALS.find((p) => p.id === 'wuzzuf')!
  const forasna   = PORTALS.find((p) => p.id === 'forasna')!
  const linkedin  = PORTALS.find((p) => p.id === 'linkedin')!

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={S.totalBadge}>
          <Text style={S.totalNum}>+1.5M</Text>
          <Text style={S.totalLabel}>{t('jobPortals.totalLabel')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.headerTitle}>{t('jobPortals.headerTitle')}</Text>
          <Text style={S.headerSub}>{t('jobPortals.headerSub')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>

        {/* ── Section label ── */}
        <View style={S.sectionRow}>
          <View style={S.sectionLine} />
          <Text style={S.sectionLabel}>{t('jobPortals.recommendedPlatforms')}</Text>
        </View>

        {/* ── Bento Grid ── */}
        {/* Row 1: Shaghalni (full width, featured) */}
        <BentoPortalCard portal={shaghalni} onPress={() => openPortal(shaghalni)} large language={language} t={t} BPC={BPC} />

        {/* Row 2: Wuzzuf + Forasna (side by side) */}
        <View style={S.bentoRow}>
          <BentoPortalCard portal={wuzzuf}  onPress={() => openPortal(wuzzuf)} language={language} t={t} BPC={BPC} />
          <BentoPortalCard portal={forasna} onPress={() => openPortal(forasna)} language={language} t={t} BPC={BPC} />
        </View>

        {/* Row 3: LinkedIn (full width) */}
        <BentoPortalCard portal={linkedin} onPress={() => openPortal(linkedin)} large language={language} t={t} BPC={BPC} />

        {/* ── Tip carousel ── */}
        <View style={S.sectionRow}>
          <View style={S.sectionLine} />
          <Text style={S.sectionLabel}>{t('jobPortals.tipOfDay')}</Text>
        </View>
        <TipsCarousel tips={tips} TC={TC} />

        {/* ── Quick stats ── */}
        <View style={S.statsGrid}>
          {[
            { icon: 'briefcase-outline', value: '+1.5M', label: t('jobPortals.statAvailableJobs'), color: COLORS.primary },
            { icon: 'business-outline',  value: '+50K',  label: t('jobPortals.statHiringCompanies'), color: COLORS.teal },
            { icon: 'time-outline',      value: t('jobPortals.statAvgResponseValue'), label: t('jobPortals.statAvgResponse'), color: '#F59E0B' },
          ].map((stat, i) => (
            <View key={i} style={[S.statCard, { borderColor: stat.color + '28' }]}>
              <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              <Text style={[S.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={S.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <PortalDetailSheet
        portal={selectedPortal}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        language={language}
        t={t}
        isRTL={isRTL}
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const createStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const row = isRTL ? 'row-reverse' : 'row' as const

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.canvas },

    header: {
      flexDirection: row, alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 20, gap: 14,
      borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)',
    },
    backBtn: {
      width: 42, height: 42, borderRadius: RADIUS.lg,
      backgroundColor: COLORS.surface,
      borderWidth: 1, borderColor: COLORS.surfaceBorder,
      justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: start, marginBottom: 2, fontFamily: FONT.black },
    headerSub: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textAlign: start, fontFamily: FONT.semibold },
    totalBadge: {
      backgroundColor: 'rgba(47,108,255,0.14)',
      borderWidth: 1, borderColor: 'rgba(47,108,255,0.3)',
      borderRadius: RADIUS.xl, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
    },
    totalNum: { fontSize: 16, fontWeight: '900', color: COLORS.primary, fontFamily: FONT.black },
    totalLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },

    content: { paddingTop: 28, paddingHorizontal: 24, paddingBottom: 60, gap: 16 },

    sectionRow: { flexDirection: row, alignItems: 'center', gap: 12, marginBottom: 4 },
    sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(15,18,33,0.07)' },
    sectionLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '800', fontFamily: FONT.extrabold },

    bentoRow: { flexDirection: 'row', gap: 12, height: 200 },

    statsGrid: { flexDirection: 'row', gap: 12 },
    statCard: {
      flex: 1, backgroundColor: COLORS.surface,
      borderWidth: 1, borderRadius: RADIUS.xl,
      padding: 16, alignItems: 'center', gap: 8,
    },
    statValue: { fontSize: 18, fontWeight: '900', fontFamily: FONT.black },
    statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center', fontFamily: FONT.semibold },
  })
}
