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
  RefreshControl,
  AppState,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { COLORS, FONT, RADIUS, SHADOW, FS } from '../../constants/theme'
import { usePathStore } from '../../store/pathStore'
import { useAuthStore } from '../../store/authStore'
import { useActivity } from '../../hooks/useActivity'
import { api } from '../../services/api'

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

const PATHS = [
  { step: 1, title: 'تقييم المهارات واكتشاف الذات', icon: 'bulb',          color: '#9D4EDD', route: '/(main)/self-assessment' },
  { step: 2, title: 'بناء السيرة الذاتية',           icon: 'document-text', color: '#2F6CFF', route: '/(main)/cv/builder' },
  { step: 3, title: 'تدريب المقابلات',                icon: 'mic',           color: '#FF3B6B', route: '/(main)/interview/simulator' },
  { step: 4, title: 'البحث عن الدورات',               icon: 'school',        color: '#00A896', route: '/(main)/jobs' },
  { step: 5, title: 'التقديم للوظائف',                icon: 'briefcase',     color: '#F59E0B', route: '/(main)/jobs/portals' },
  { step: 6, title: 'التفاعل مع المجتمع',             icon: 'people',        color: '#2F6CFF', route: '/(main)/community' },
]

// Fallback notifications shown when API hasn't loaded yet
function notifIcon(title: string): string {
  if (title.includes('وظيف')) return 'briefcase'
  if (title.includes('تقييم') || title.includes('اختبار')) return 'star'
  if (title.includes('مجتمع') || title.includes('تعليق')) return 'people'
  if (title.includes('سير')) return 'document-text'
  if (title.includes('مقابل')) return 'mic'
  return 'notifications'
}

function notifColor(title: string): string {
  if (title.includes('وظيف')) return '#F59E0B'
  if (title.includes('تقييم') || title.includes('اختبار')) return '#2F6CFF'
  if (title.includes('مجتمع') || title.includes('تعليق')) return '#9D4EDD'
  if (title.includes('سير')) return '#00A896'
  if (title.includes('مقابل')) return '#FF3B6B'
  return '#2F6CFF'
}

function notifTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'الآن'
  if (m < 60) return `منذ ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} ساعة`
  const d = Math.floor(h / 24)
  if (d < 7) return `منذ ${d} يوم`
  return new Date(createdAt).toLocaleDateString('ar-SA')
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { completed, completeStep } = usePathStore()
  const { user } = useAuthStore()
  const { trackActivity } = useActivity()
  const doneCount = completed.length
  const pct = Math.round((doneCount / PATHS.length) * 100)

  // Track LOGIN activity once on mount
  useEffect(() => {
    trackActivity('LOGIN')
  }, [])

  // Fetch notifications from API — poll every 30s, refetch on foreground
  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data.data),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refetchNotifs()
    })
    return () => sub.remove()
  }, [refetchNotifs])

  const qc = useQueryClient()
  const rawNotifs: any[] = Array.isArray(notifData) ? notifData : []
  const notifs = rawNotifs.map((n) => ({
    ...n,
    icon:  notifIcon(n.title ?? ''),
    color: notifColor(n.title ?? ''),
    time:  notifTime(n.createdAt ?? new Date().toISOString()),
  }))
  const unreadCount = notifs.filter((n) => !n.isRead).length

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = async () => {
    setRefreshing(true)
    await refetchNotifs()
    setRefreshing(false)
  }

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const slideAnim   = useRef(new Animated.Value(width * 0.82)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  // Notifications sheet
  const [notifOpen, setNotifOpen] = useState(false)
  const notifSlide   = useRef(new Animated.Value(600)).current
  const notifOverlay = useRef(new Animated.Value(0)).current

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

  // Path sheet
  const [pathOpen, setPathOpen] = useState(false)
  const pathSlide   = useRef(new Animated.Value(600)).current
  const pathOverlay = useRef(new Animated.Value(0)).current

  const openPath = () => {
    setPathOpen(true)
    Animated.parallel([
      Animated.spring(pathSlide, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
      Animated.timing(pathOverlay, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start()
  }

  const closePath = () => {
    Animated.parallel([
      Animated.timing(pathSlide, { toValue: 600, duration: 240, useNativeDriver: true }),
      Animated.timing(pathOverlay, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => setPathOpen(false))
  }

  const openNotif = () => {
    setNotifOpen(true)
    Animated.parallel([
      Animated.spring(notifSlide, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
      Animated.timing(notifOverlay, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start()
  }

  const closeNotif = () => {
    Animated.parallel([
      Animated.timing(notifSlide, { toValue: 600, duration: 240, useNativeDriver: true }),
      Animated.timing(notifOverlay, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => setNotifOpen(false))
  }

  const handleNotifPress = async (notif: any) => {
    if (notif.isRead) return
    try {
      await api.patch(`/notifications/${notif.id}/read`)
      qc.invalidateQueries({ queryKey: ['notifications'] })
    } catch { /* fire-and-forget */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      qc.invalidateQueries({ queryKey: ['notifications'] })
    } catch { /* fire-and-forget */ }
  }

  // First name from user store (fall back gracefully)
  const firstName = user?.name?.split(' ')[0] ?? 'أهلاً'

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={S.topBar}>
        {/* Bell — left (end in RTL) */}
        <TouchableOpacity style={S.iconBtn} onPress={openNotif}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
          {unreadCount > 0 && (
            <View style={S.badge}><Text style={S.badgeText}>{unreadCount}</Text></View>
          )}
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

        {/* Hamburger — right (start in RTL) */}
        <TouchableOpacity style={S.iconBtn} onPress={openDrawer}>
          <Ionicons name="menu-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >

        {/* ── Greeting hero ── */}
        <View style={S.hero}>
          {/* Ambient glow */}
          <View style={S.heroGlow} />

          <Text style={S.heroGreeting}>مرحباً، {firstName}!</Text>
          <Text style={S.heroSub}>استمر في رحلة تطوير مهاراتك</Text>

          {/* Progress card */}
          <TouchableOpacity style={S.progressCard} onPress={openPath} activeOpacity={0.78}>
            <View style={S.progressRow}>
              <Text style={S.progressLabel}>{doneCount} / {PATHS.length} مسارات مكتملة</Text>
              <Text style={S.progressPct}>{pct}%</Text>
            </View>
            <View style={S.progressTrack}>
              <View style={[S.progressFill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={S.progressHint}>
              {doneCount === 0
                ? 'أكمل مسارك الأول للبدء!'
                : doneCount === PATHS.length
                ? '🎉 أتممت جميع المسارات!'
                : `تبقّى ${PATHS.length - doneCount} خطوات`}
            </Text>
          </TouchableOpacity>
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
            <TouchableOpacity
              style={S.logoutRow}
              onPress={async () => {
                closeDrawer()
                setTimeout(async () => {
                  await useAuthStore.getState().logout()
                  router.replace('/(auth)/login')
                }, 260)
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              <Text style={S.logoutText}>تسجيل الخروج</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* ── Career Path Sheet ── */}
      <Modal visible={pathOpen} transparent animationType="none" onRequestClose={closePath}>
        <Animated.View style={[S.overlay, { opacity: pathOverlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closePath} />
        </Animated.View>
        <Animated.View style={[S.pathSheet, { paddingBottom: insets.bottom + 20, transform: [{ translateY: pathSlide }] }]}>
          <View style={S.notifHandle} />

          {/* Header */}
          <View style={S.pathHeader}>
            <TouchableOpacity onPress={closePath} style={S.notifCloseBtn}>
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={S.pathTitle}>مسار التطوير المهني</Text>
              <Text style={S.pathSub}>6 خطوات نحو وظيفة أحلامك</Text>
            </View>
          </View>

          <View style={S.notifDivider} />

          {/* Steps */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
            {PATHS.map((p, i) => {
              const done = completed.includes(p.step)
              return (
                <TouchableOpacity
                  key={p.step}
                  style={[S.pathRow, done && S.pathRowDone]}
                  activeOpacity={0.75}
                  onPress={() => { completeStep(p.step); closePath(); router.push(p.route as any) }}
                >
                  {/* Connector line */}
                  {i < PATHS.length - 1 && (
                    <View style={[S.pathConnector, { borderColor: done ? p.color + '60' : p.color + '30' }]} />
                  )}

                  {/* Step circle */}
                  <View style={[
                    S.pathCircle,
                    { backgroundColor: done ? p.color + '22' : p.color + '18', borderColor: done ? p.color : p.color + '40' },
                  ]}>
                    {done
                      ? <Ionicons name="checkmark" size={20} color={p.color} />
                      : <Ionicons name={p.icon as any} size={20} color={p.color} />
                    }
                  </View>

                  {/* Text */}
                  <View style={S.pathBody}>
                    <Text style={S.pathStep}>{done ? 'مكتملة ✓' : `الخطوة ${p.step}`}</Text>
                    <Text style={[S.pathStepTitle, done && { color: COLORS.textSecondary }]}>{p.title}</Text>
                  </View>

                  {!done && <Ionicons name="chevron-back" size={16} color={COLORS.textMuted} />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* ── Notifications Sheet ── */}
      <Modal visible={notifOpen} transparent animationType="none" onRequestClose={closeNotif}>
        <Animated.View style={[S.overlay, { opacity: notifOverlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeNotif} />
        </Animated.View>
        <Animated.View style={[S.notifSheet, { paddingBottom: insets.bottom + 16, transform: [{ translateY: notifSlide }] }]}>
          {/* Handle */}
          <View style={S.notifHandle} />

          {/* Header */}
          <View style={S.notifHeader}>
            <TouchableOpacity onPress={closeNotif} style={S.notifCloseBtn}>
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <Text style={S.notifTitle}>الإشعارات</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead} style={S.notifBadgePill}>
                <Text style={S.notifBadgePillText}>قراءة الكل</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={S.notifDivider} />

          {/* List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {notifs.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="notifications-off-outline" size={40} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textMuted, marginTop: 12, fontFamily: FONT.regular }}>لا توجد إشعارات</Text>
              </View>
            )}
            {notifs.map((n: any) => (
              <TouchableOpacity
                key={n.id}
                style={[S.notifRow, !n.isRead && S.notifRowUnread]}
                activeOpacity={0.75}
                onPress={() => handleNotifPress(n)}
              >
                {/* Icon circle */}
                <View style={[S.notifIcon, { backgroundColor: n.color + '18' }]}>
                  <Ionicons name={n.icon as any} size={18} color={n.color} />
                </View>
                {/* Text */}
                <View style={S.notifBody}>
                  <Text style={S.notifRowTitle}>{n.title}</Text>
                  <Text style={S.notifRowBody}>{n.body}</Text>
                  <Text style={S.notifTime}>{n.time}</Text>
                </View>
                {/* Unread dot */}
                {!n.isRead && <View style={S.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
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

  // ── Career path sheet ────────────────────────────────────────
  pathSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl,
    maxHeight: '80%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 24,
  },
  pathHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 12,
  },
  pathTitle: {
    fontSize: FS.lg, fontFamily: FONT.black, fontWeight: '900', color: COLORS.text,
  },
  pathSub: {
    fontSize: FS.xs, fontFamily: FONT.medium, color: COLORS.textMuted, marginTop: 2,
  },
  pathRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 14, position: 'relative',
  },
  pathRowDone: {
    backgroundColor: 'rgba(15,18,33,0.025)',
  },
  pathConnector: {
    position: 'absolute', right: 47, top: 62, bottom: -16,
    width: 2, borderLeftWidth: 2, borderStyle: 'dashed',
  },
  pathCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  pathBody: { flex: 1, gap: 2 },
  pathStep: {
    fontSize: FS.xs, fontFamily: FONT.semibold, color: COLORS.textMuted,
    textAlign: 'right', letterSpacing: 0.4,
  },
  pathStepTitle: {
    fontSize: FS.md, fontFamily: FONT.bold, fontWeight: '700',
    color: COLORS.text, textAlign: 'right',
  },

  // ── Notifications sheet ──────────────────────────────────────
  notifSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl,
    maxHeight: '75%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 24,
  },
  notifHandle: {
    width: 38, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(15,18,33,0.15)',
    alignSelf: 'center', marginTop: 14, marginBottom: 4,
  },
  notifHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: 20, paddingVertical: 14, gap: 10,
  },
  notifCloseBtn: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder,
    justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' as any,
  },
  notifTitle: {
    flex: 1, fontSize: FS.lg, fontFamily: FONT.black, fontWeight: '900',
    color: COLORS.text, textAlign: 'right',
  },
  notifBadgePill: {
    backgroundColor: 'rgba(47,108,255,0.12)', borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center',
  },
  notifBadgePillText: {
    fontSize: FS.xs, fontFamily: FONT.bold, fontWeight: '700', color: COLORS.primary,
  },
  notifDivider: { height: 1, backgroundColor: 'rgba(15,18,33,0.07)' },
  notifRow: {
    flexDirection: 'row-reverse', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.05)', gap: 14,
  },
  notifRowUnread: { backgroundColor: 'rgba(47,108,255,0.04)' },
  notifIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  notifBody: { flex: 1, gap: 3 },
  notifRowTitle: {
    fontSize: FS.md, fontFamily: FONT.bold, fontWeight: '700',
    color: COLORS.text, textAlign: 'right',
  },
  notifRowBody: {
    fontSize: FS.sm, fontFamily: FONT.regular,
    color: COLORS.textSecondary, textAlign: 'right', lineHeight: 19,
  },
  notifTime: {
    fontSize: FS.xs, fontFamily: FONT.medium,
    color: COLORS.textMuted, textAlign: 'right',
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary, marginTop: 4, flexShrink: 0,
  },
})
