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
import { useState, useRef, useEffect } from 'react'
import { COLORS, RADIUS, FONT } from '@/constants/theme'

// ─── Portal Data ──────────────────────────────────────────────

interface Portal {
  id: string
  nameAr: string
  nameEn: string
  tagline: string
  description: string
  gradient: [string, string, string]
  accentColor: string
  icon: string
  url: string
  deepLink?: string
  jobCount: string
  features: string[]
  badge?: string
}

const PORTALS: Portal[] = [
  {
    id: 'shaghlni',
    nameAr: 'شغلني',
    nameEn: 'Shaghlni',
    tagline: 'بيغير حياة الناس',
    description: 'المنصة الرائدة في المملكة العربية السعودية للوظائف في جميع المجالات. تجربة تقديم سلسة مع إشعارات فورية بحالة طلبك.',
    gradient: ['#0369A1', '#0EA5E9', '#38BDF8'],
    accentColor: '#0EA5E9',
    icon: 'briefcase',
    url: 'https://www.shaghlni.com',
    jobCount: '+50K',
    features: ['AI مطابقة ذكية', 'إشعارات فورية', 'رفع CV مباشر'],
    badge: 'الأكثر استخداماً',
  },
  {
    id: 'icareer',
    nameAr: 'iCareer',
    nameEn: 'iCareer',
    tagline: 'طوّر مسارك المهني',
    description: 'منصة متكاملة للتطوير المهني توفر فرص عمل، تدريب مهني، وموارد لبناء مستقبلك.',
    gradient: ['#4F46E5', '#7B5EA7', '#9D4EDD'],
    accentColor: '#7B5EA7',
    icon: 'rocket',
    url: 'https://www.icareer.ai',
    jobCount: '+30K',
    features: ['تطوير مهني متكامل', 'دورات تدريبية', 'مرشد AI'],
  },
  {
    id: 'linkedin',
    nameAr: 'LinkedIn',
    nameEn: 'LinkedIn',
    tagline: 'شبكتك المهنية العالمية',
    description: 'المنصة المهنية الأكبر عالمياً. ابنِ شبكتك، تواصل مع أصحاب العمل، وابحث عن فرص عمل محلية ودولية.',
    gradient: ['#0A66C2', '#0077B5', '#00A0DC'],
    accentColor: '#0A66C2',
    icon: 'people',
    url: 'https://www.linkedin.com/jobs',
    deepLink: 'linkedin://jobs',
    jobCount: '+1M',
    features: ['شبكة عالمية', 'Easy Apply', 'تواصل مع مسؤولي التوظيف'],
    badge: 'عالمي',
  },
]

// ─── Tips ─────────────────────────────────────────────────────

const TIPS = [
  'خصّص سيرتك الذاتية لكل وظيفة تتقدم لها — زد نسبة قبولك ٣ أضعاف.',
  'أرسل طلبك خلال أول ٤٨ ساعة من نشر الإعلان للحصول على أفضل فرصة.',
  'إضافة خطاب تقديم شخصي تزيد فرصة المقابلة بنسبة ٢٩٪.',
  'تواصل مع موظف في الشركة قبل التقديم — يُفرق كثيراً.',
  'احرص على تحديث ملفك في LinkedIn كل ٣ أشهر.',
]

// ─── Portal Detail Sheet ──────────────────────────────────────

function PortalDetailSheet({
  portal, visible, onClose,
}: { portal: Portal | null; visible: boolean; onClose: () => void }) {
  const insets   = useSafeAreaInsets()
  const router   = useRouter()
  const slideAnim = useRef(new Animated.Value(700)).current

  const open = () => Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }).start()
  const close = () => Animated.timing(slideAnim, { toValue: 700, duration: 260, useNativeDriver: true }).start(() => onClose())

  const handleOpen = () => {
    if (!portal) return
    onClose()
    router.push({
      pathname: '/(main)/jobs/InternalBrowser',
      params: { url: portal.url, name: `بوابة ${portal.nameAr} الإلكترونية`, accent: portal.accentColor },
    } as any)
  }

  if (!portal) return null

  return (
    <Modal visible={visible} transparent animationType="none" onShow={open} onRequestClose={close}>
      <View style={DS.bg}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
      </View>
      <Animated.View style={[DS.sheet, { paddingBottom: insets.bottom + 24, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['rgba(10,14,30,0.99)', 'rgba(7,10,19,1)']} style={DS.inner}>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <Text style={DS.portalName}>{portal.nameAr}</Text>
                {portal.badge && (
                  <View style={[DS.badgeChip, { backgroundColor: portal.accentColor + '22', borderColor: portal.accentColor + '55' }]}>
                    <Text style={[DS.badgeText, { color: portal.accentColor }]}>{portal.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={DS.tagline}>{portal.tagline}</Text>
              <View style={DS.jobCountRow}>
                <Text style={[DS.jobCount, { color: portal.accentColor }]}>{portal.jobCount}</Text>
                <Text style={DS.jobCountLabel}>وظيفة متاحة</Text>
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={DS.content}>
            {/* Description */}
            <Text style={DS.description}>{portal.description}</Text>

            {/* Features */}
            <Text style={DS.featuresLabel}>المميزات</Text>
            <View style={DS.featuresList}>
              {portal.features.map((f, i) => (
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
                <Text style={DS.ctaText}>افتح المنصة</Text>
                <Ionicons name="open-outline" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  )
}

const DS = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl,
    overflow: 'hidden', maxHeight: '82%',
  },
  inner: { flex: 1, paddingTop: 14 },
  handle: { width: 38, height: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },

  portalHeader: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 18,
    paddingHorizontal: 24, marginBottom: 24,
  },
  iconWrap: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  portalName: { fontSize: 22, fontWeight: '900', color: '#fff', fontFamily: FONT.black },
  tagline: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
  jobCountRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  jobCount: { fontSize: 18, fontWeight: '900', fontFamily: FONT.black },
  jobCountLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
  badgeChip: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3, fontFamily: FONT.extrabold },

  content: { paddingHorizontal: 24, paddingBottom: 16 },
  description: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 24, marginBottom: 24, fontFamily: FONT.regular },

  featuresLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '800', letterSpacing: 0.8, textAlign: 'right', marginBottom: 14, textTransform: 'uppercase', fontFamily: FONT.extrabold },
  featuresList: { gap: 10 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: RADIUS.xl, padding: 14,
  },
  featureText: { fontSize: 14, color: '#fff', fontWeight: '600', textAlign: 'right', fontFamily: FONT.semibold },
  featureIconWrap: { width: 28, height: 28, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },

  cta: { paddingHorizontal: 24, paddingTop: 16 },
  ctaBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  ctaText: { fontSize: 16, color: '#fff', fontWeight: '900', fontFamily: FONT.black },
})

// ─── Bento Portal Card ────────────────────────────────────────

function BentoPortalCard({
  portal, onPress, large = false,
}: { portal: Portal; onPress: () => void; large?: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const press   = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 80 }).start()
  const release = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start()

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, large ? BPC.cardLarge : BPC.cardSmall]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        onPressIn={press}
        onPressOut={release}
        activeOpacity={1}
      />

      {/* Glass surface */}
      <View style={[BPC.glass, { borderColor: portal.accentColor + '22' }]}>
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
            <Text style={[BPC.name, large && BPC.nameLarge]}>{portal.nameAr}</Text>
            {portal.badge && (
              <View style={[BPC.badge, { backgroundColor: portal.accentColor + '25' }]}>
                <Text style={[BPC.badgeLabel, { color: portal.accentColor }]}>{portal.badge}</Text>
              </View>
            )}
          </View>
          <Text style={BPC.tagline} numberOfLines={1}>{portal.tagline}</Text>
          <Text style={[BPC.jobCount, { color: portal.accentColor }]}>{portal.jobCount} وظيفة</Text>
        </View>

        {/* Arrow */}
        <View style={[BPC.arrowBtn, { borderColor: portal.accentColor + '40', backgroundColor: portal.accentColor + '10' }]}>
          <Ionicons name="arrow-back" size={14} color={portal.accentColor} />
        </View>
      </View>
    </Animated.View>
  )
}

const BPC = StyleSheet.create({
  cardSmall: { flex: 1, minHeight: 180, borderRadius: RADIUS.xxl, overflow: 'hidden' },
  cardLarge: { width: '100%', height: 140, borderRadius: RADIUS.xxl, overflow: 'hidden' },

  glass: {
    flex: 1, backgroundColor: COLORS.surface,
    borderWidth: 1, borderRadius: RADIUS.xxl,
    padding: 20, gap: 10, overflow: 'hidden',
  },
  gradientOrb: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },

  icon: {
    width: 50, height: 50, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 12, elevation: 8,
  },
  textWrap: { gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
  name: { fontSize: 16, fontWeight: '900', color: COLORS.text, textAlign: 'right', fontFamily: FONT.black },
  nameLarge: { fontSize: 18, fontFamily: FONT.black },
  badge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, fontFamily: FONT.extrabold },
  tagline: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textAlign: 'right', fontFamily: FONT.semibold },
  jobCount: { fontSize: 13, fontWeight: '800', textAlign: 'right', fontFamily: FONT.extrabold },
  arrowBtn: {
    position: 'absolute', bottom: 16, left: 16,
    width: 30, height: 30, borderRadius: 10,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
})

// ─── Tip Carousel ─────────────────────────────────────────────

function TipsCarousel() {
  const [tipIdx, setTipIdx] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start()
      setTipIdx((i) => (i + 1) % TIPS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <View style={TC.wrap}>
      <View style={TC.iconWrap}>
        <Ionicons name="bulb" size={16} color="#F59E0B" />
      </View>
      <Animated.Text style={[TC.text, { opacity: fadeAnim }]} numberOfLines={2}>
        {TIPS[tipIdx]}
      </Animated.Text>
    </View>
  )
}

const TC = StyleSheet.create({
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
  text: { flex: 1, fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 21, fontWeight: '500', fontFamily: FONT.medium },
})

// ─── Main Screen ──────────────────────────────────────────────

export default function JobPortalsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  const openPortal = (portal: Portal) => {
    setSelectedPortal(portal)
    setSheetVisible(true)
  }

  const shaghlni = PORTALS.find((p) => p.id === 'shaghlni')!
  const icareer  = PORTALS.find((p) => p.id === 'icareer')!
  const linkedin = PORTALS.find((p) => p.id === 'linkedin')!

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={S.headerTitle}>بوابات التوظيف</Text>
          <Text style={S.headerSub}>اختر المنصة الأنسب لك</Text>
        </View>
        <View style={S.totalBadge}>
          <Text style={S.totalNum}>+1.5M</Text>
          <Text style={S.totalLabel}>وظيفة</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>

        {/* ── Section label ── */}
        <View style={S.sectionRow}>
          <View style={S.sectionLine} />
          <Text style={S.sectionLabel}>المنصات الموصى بها</Text>
        </View>

        {/* ── Bento Grid ── */}
        {/* Row 1: Shaghlni (large) + iCareer (small) */}
        <View style={S.bentoRow}>
          <BentoPortalCard portal={shaghlni} onPress={() => openPortal(shaghlni)} />
          <BentoPortalCard portal={icareer}  onPress={() => openPortal(icareer)} />
        </View>

        {/* Row 2: LinkedIn (full width) */}
        <BentoPortalCard portal={linkedin} onPress={() => openPortal(linkedin)} large />

        {/* ── Tip carousel ── */}
        <View style={S.sectionRow}>
          <View style={S.sectionLine} />
          <Text style={S.sectionLabel}>نصيحة اليوم</Text>
        </View>
        <TipsCarousel />

        {/* ── Quick stats ── */}
        <View style={S.statsGrid}>
          {[
            { icon: 'briefcase-outline', value: '+1.5M', label: 'وظيفة متاحة', color: COLORS.primary },
            { icon: 'business-outline',  value: '+50K',  label: 'شركة توظيف',   color: COLORS.teal },
            { icon: 'time-outline',      value: '48س',   label: 'متوسط الرد',   color: '#F59E0B' },
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
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20, gap: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)',
  },
  backBtn: {
    width: 42, height: 42, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right', marginBottom: 2, fontFamily: FONT.black },
  headerSub: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', textAlign: 'right', fontFamily: FONT.semibold },
  totalBadge: {
    backgroundColor: 'rgba(47,108,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(47,108,255,0.3)',
    borderRadius: RADIUS.xl, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
  },
  totalNum: { fontSize: 16, fontWeight: '900', color: COLORS.primary, fontFamily: FONT.black },
  totalLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },

  content: { paddingTop: 28, paddingHorizontal: 24, paddingBottom: 60, gap: 16 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4, justifyContent: 'flex-end' },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(15,18,33,0.07)' },
  sectionLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', fontFamily: FONT.extrabold },

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
