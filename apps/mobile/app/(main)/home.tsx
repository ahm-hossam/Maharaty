import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  Pressable,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '@/constants/theme'

const { width } = Dimensions.get('window')
const CARD_SIZE = (width - 60) / 2

const FEATURES = [
  {
    id: 'cv',
    title: 'السيرة الذاتية',
    subtitle: 'إرشادات AI وخطاب التقديم',
    icon: 'document-text',
    accent: '#2F6CFF',
    accentAlt: '#00B4D8',
    route: '/(main)/cv/builder',
  },
  {
    id: 'skills',
    title: 'تقييم الذات',
    subtitle: 'اكتشف شخصيتك المهنية',
    icon: 'bulb',
    accent: '#9D4EDD',
    accentAlt: '#7B5EA7',
    route: '/(main)/self-assessment',
  },
  {
    id: 'interview',
    title: 'محاكاة المقابلة',
    subtitle: 'تحضير AI تفاعلي',
    icon: 'mic',
    accent: '#FF3B6B',
    accentAlt: '#C1121F',
    route: '/(main)/interview/simulator',
  },
  {
    id: 'jobs',
    title: 'بوابات التوظيف',
    subtitle: 'فرص عمل موصى بها',
    icon: 'briefcase',
    accent: '#F59E0B',
    accentAlt: '#E76F51',
    route: '/(main)/jobs',
  },
  {
    id: 'community',
    title: 'المجتمع',
    subtitle: 'تواصل مع المهنيين',
    icon: 'people',
    accent: '#00F5D4',
    accentAlt: '#0096C7',
    route: '/(main)/community',
  },
  {
    id: 'resources',
    title: 'موارد التطوير',
    subtitle: 'مسارات وظيفية متقدمة',
    icon: 'trending-up',
    accent: '#10B981',
    accentAlt: '#0D9488',
    route: '/(main)/learning/hub',
  },
]

const MENU_ITEMS = [
  { icon: 'document-text-outline', label: 'السيرة الذاتية', route: '/(main)/cv/builder' },
  { icon: 'bulb-outline',          label: 'تقييم المهارات', route: '/(main)/self-assessment' },
  { icon: 'briefcase-outline',     label: 'بوابات التوظيف', route: '/(main)/jobs' },
  { icon: 'mic-outline',           label: 'محاكاة المقابلة', route: '/(main)/interview/simulator' },
  { icon: 'trending-up-outline',   label: 'موارد التطوير', route: '/(main)/search' },
  { icon: 'people-outline',        label: 'مجتمع مهاراتي', route: '/(main)/community' },
  { icon: 'star-outline',          label: 'قيّمنا', route: null },
]

// ─── Feature Card ─────────────────────────────────────────────

function FeatureCard({ feature, onPress }: { feature: typeof FEATURES[0]; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const press   = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 80 }).start()
  const release = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start()

  return (
    <Animated.View style={[S.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[S.cardInner, { borderColor: feature.accent + '28' }]}
        onPress={onPress}
        onPressIn={press}
        onPressOut={release}
        activeOpacity={1}
      >
        {/* Gradient orb */}
        <View style={[S.cardOrb, { backgroundColor: feature.accent }]} />

        {/* Icon */}
        <View style={[S.cardIconWrap, {
          backgroundColor: feature.accent + '22',
          borderColor: feature.accent + '45',
          shadowColor: feature.accent,
        }]}>
          <Ionicons name={feature.icon as any} size={26} color={feature.accent} />
        </View>

        {/* Text */}
        <View style={S.cardText}>
          <Text style={S.cardTitle}>{feature.title}</Text>
          <Text style={S.cardSub} numberOfLines={2}>{feature.subtitle}</Text>
        </View>

        {/* Arrow chip */}
        <View style={[S.cardArrow, { borderColor: feature.accent + '40', backgroundColor: feature.accent + '12' }]}>
          <Ionicons name="arrow-back" size={12} color={feature.accent} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Pulsing Neon Dot ─────────────────────────────────────────

function LiveDot() {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 12, height: 12, borderRadius: 6,
        backgroundColor: COLORS.teal + '40', transform: [{ scale: pulse }],
      }} />
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.teal }} />
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const slideAnim   = useRef(new Animated.Value(width * 0.82)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  const openDrawer = () => {
    setDrawerOpen(true)
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start()
  }

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: width * 0.82, duration: 240, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false))
  }

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={S.topBar}>
        {/* Hamburger */}
        <TouchableOpacity style={S.iconBtn} onPress={openDrawer}>
          <Ionicons name="menu-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={S.logoRow}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.teal]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.logoDot}
          />
          <Text style={S.logoText}>مهاراتي</Text>
        </View>

        {/* Bell */}
        <TouchableOpacity style={S.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
          <View style={S.badge}><Text style={S.badgeText}>3</Text></View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>

        {/* ── Greeting hero ── */}
        <View style={S.hero}>
          {/* Ambient glow */}
          <View style={S.heroGlow} />

          {/* <View style={S.heroLiveRow}>
            <Text style={S.heroLiveText}>متصل الآن</Text>
            <LiveDot />
          </View> */}

          <Text style={S.heroGreeting}>مرحباً، أحمد!</Text>
          <Text style={S.heroSub}>استمر في رحلة تطوير مهاراتك</Text>

          {/* Progress card */}
          <View style={S.progressCard}>
            <View style={S.progressRow}>
              <Text style={S.progressLabel}>0 / 6 مسارات مكتملة</Text>
              <Text style={S.progressPct}>0%</Text>
            </View>
            <View style={S.progressTrack}>
              <View style={S.progressFill} />
            </View>
            <Text style={S.progressHint}>أكمل مسارك الأول للبدء!</Text>
          </View>
        </View>

        {/* ── Quick stats strip ── */}
        <View style={S.statsRow}>
          {[
            { icon: 'flame', label: 'أيام متتالية', value: '0', color: '#F59E0B' },
            { icon: 'trophy', label: 'إنجازات',     value: '0', color: COLORS.teal },
            { icon: 'star',  label: 'نقاطك',        value: '0', color: COLORS.primary },
          ].map((stat, i) => (
            <View key={i} style={[S.statCard, { borderColor: stat.color + '28' }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text style={[S.statVal, { color: stat.color }]}>{stat.value}</Text>
              <Text style={S.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Feature grid ── */}
        <View style={S.sectionHeader}>
          <View style={S.sectionLine} />
          <Text style={S.sectionTitle}>استكشف الخدمات</Text>
        </View>

        <View style={S.grid}>
          {FEATURES.map((f) => (
            <FeatureCard key={f.id} feature={f} onPress={() => router.push(f.route as any)} />
          ))}
        </View>

        {/* ── Tip banner ── */}
        <View style={S.tipBanner}>
          <LinearGradient
            colors={[COLORS.primary + '18', COLORS.teal + '08']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.tipGrad}
          >
            <View style={S.tipIconWrap}>
              <Ionicons name="sparkles" size={18} color={COLORS.primary} />
            </View>
            <View style={S.tipText}>
              <Text style={S.tipTitle}>نصيحة اليوم</Text>
              <Text style={S.tipBody}>خصّص سيرتك الذاتية لكل وظيفة تتقدم لها لتضاعف فرصك ثلاثة أضعاف.</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* ── Drawer ── */}
      <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={closeDrawer}>
        {/* Overlay */}
        <Animated.View style={[S.overlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>

        {/* Panel — slides in from the right (RTL-native) */}
        <Animated.View style={[S.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={[S.drawerHeader, { paddingTop: insets.top + 24 }]}>
            <TouchableOpacity style={[S.drawerCloseBtn, { top: insets.top + 16 }]} onPress={closeDrawer}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={S.drawerLogoWrap}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={S.drawerLogo}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="bulb" size={28} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={S.drawerTitle}>مهاراتي</Text>
            <Text style={S.drawerSub}>منصة تطوير المهارات المهنية</Text>
          </View>

          <View style={S.drawerDivider} />

          {/* Menu */}
          <ScrollView style={S.drawerMenuScroll} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={S.menuRow}
                onPress={() => { closeDrawer(); if (item.route) router.push(item.route as any) }}
              >
                <View style={S.menuIconCircle}>
                  <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
                </View>
                <Text style={S.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={[S.drawerFooter, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={S.logoutRow}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              <Text style={S.logoutText}>تسجيل الخروج</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)',
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    width: 15, height: 15, borderRadius: 8,
    backgroundColor: COLORS.error,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: FS.micro, color: '#fff', fontFamily: FONT.extrabold, fontWeight: '800' },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot: { width: 8, height: 8, borderRadius: 4 },
  logoText: { fontSize: FS.xl, fontFamily: FONT.black, fontWeight: '900', color: COLORS.text, letterSpacing: 0.4 },

  scrollContent: { paddingBottom: 48 },

  // Hero
  hero: {
    marginHorizontal: 24, marginTop: 24, marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xxl, padding: 24, overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },
  heroLiveRow: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'flex-end', marginBottom: 16 },
  heroLiveText: { fontSize: FS.xs, color: COLORS.teal, fontFamily: FONT.bold, fontWeight: '700', letterSpacing: 0.8 },

  heroGreeting: { fontSize: FS.h2, fontFamily: FONT.black, fontWeight: '900', color: COLORS.text, textAlign: 'right', marginBottom: 6 },
  heroSub: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', marginBottom: 22 },

  progressCard: {
    backgroundColor: 'rgba(15,18,33,0.04)',
    borderRadius: RADIUS.xl, padding: 16,
    borderWidth: 1, borderColor: 'rgba(15,18,33,0.06)',
  },
  progressRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: FS.sm, color: COLORS.textSecondary, fontFamily: FONT.semibold, fontWeight: '600' },
  progressPct: { fontSize: FS.sm, color: COLORS.primary, fontFamily: FONT.black, fontWeight: '900' },
  progressTrack: { height: 4, backgroundColor: 'rgba(15,18,33,0.08)', borderRadius: 2, marginBottom: 10 },
  progressFill: {
    height: '100%', width: '0%', borderRadius: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6,
  },
  progressHint: { fontSize: FS.xs, color: COLORS.textMuted, textAlign: 'right', fontFamily: FONT.medium, fontWeight: '500' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 28 },
  statCard: {
    flex: 1, alignItems: 'center', gap: 5, paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderRadius: RADIUS.xl,
  },
  statVal: { fontSize: FS.xl, fontFamily: FONT.black, fontWeight: '900' },
  statLabel: { fontSize: FS.micro, color: COLORS.textMuted, fontFamily: FONT.semibold, fontWeight: '600', textAlign: 'center' },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 24, marginBottom: 16, justifyContent: 'flex-end',
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(15,18,33,0.08)' },
  sectionTitle: { fontSize: FS.sm, fontFamily: FONT.extrabold, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },

  // Feature grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: 24, marginBottom: 28,
  },
  card: { width: CARD_SIZE, borderRadius: RADIUS.xxl, overflow: 'hidden' },
  cardInner: {
    height: 160, borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl, padding: 18, overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardOrb: {
    position: 'absolute', top: -28, left: -28,
    width: 80, height: 80, borderRadius: 40, opacity: 0.12,
  },
  cardIconWrap: {
    width: 48, height: 48, borderRadius: 15,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
    alignSelf: 'flex-end',
  },
  cardText: { gap: 4 },
  cardTitle: { fontSize: FS.md, fontFamily: FONT.extrabold, fontWeight: '800', color: COLORS.text, textAlign: 'right' },
  cardSub: { fontSize: FS.xs, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', lineHeight: 16 },
  cardArrow: {
    position: 'absolute', bottom: 14, left: 14,
    width: 28, height: 28, borderRadius: 9,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },

  // Tip banner
  tipBanner: { marginHorizontal: 24, borderRadius: RADIUS.xxl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(47,108,255,0.2)' },
  tipGrad: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 14, padding: 18 },
  tipIconWrap: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(47,108,255,0.18)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  tipText: { flex: 1, gap: 5 },
  tipTitle: { fontSize: FS.sm, fontFamily: FONT.extrabold, fontWeight: '800', color: COLORS.primary, textAlign: 'right' },
  tipBody: { fontSize: FS.sm, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'right', lineHeight: 19 },

  // Drawer
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
  drawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: width * 0.82,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1, borderLeftColor: 'rgba(15,18,33,0.08)',
  },
  drawerHeader: { paddingHorizontal: 24, paddingBottom: 24, alignItems: 'flex-end', position: 'relative' },
  drawerCloseBtn: {
    position: 'absolute', top: 24, left: 20,
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  drawerLogoWrap: { marginBottom: 14 },
  drawerLogo: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  drawerTitle: { fontSize: FS.h3, fontFamily: FONT.black, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  drawerSub: { fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.medium, fontWeight: '500' },
  drawerDivider: { height: 1, backgroundColor: 'rgba(15,18,33,0.07)', marginHorizontal: 0 },

  drawerMenuScroll: { flex: 1 },
  menuRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.05)',
    gap: 12,
  },
  menuIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(47,108,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(47,108,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: FS.md, fontFamily: FONT.semibold, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'right' },

  drawerFooter: { borderTopWidth: 1, borderTopColor: 'rgba(15,18,33,0.07)', padding: 24 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  logoutText: { fontSize: FS.md, fontFamily: FONT.bold, fontWeight: '700', color: COLORS.error },
})
