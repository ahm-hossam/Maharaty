import {
  createContext,
  useContext,
  useRef,
  useState,
  useMemo,
  ReactNode,
} from 'react'
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
import { useRouter } from 'expo-router'
import { COLORS, FONT, RADIUS, FS } from '../constants/theme'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../i18n/LanguageContext'
import * as StoreReview from 'expo-store-review'

const { width } = Dimensions.get('window')
const DRAWER_WIDTH = width * 0.82

const MENU_ITEMS = [
  { key: 'cvBuilder', icon: 'document-text-outline', route: '/(main)/cv/builder' },
  { key: 'selfAssessment', icon: 'bulb-outline', route: '/(main)/self-assessment' },
  { key: 'jobPortals', icon: 'briefcase-outline', route: '/(main)/jobs' },
  { key: 'interviewSimulator', icon: 'mic-outline', route: '/(main)/interview/simulator' },
  { key: 'learningHub', icon: 'trending-up-outline', route: '/(main)/learning/hub' },
  { key: 'community', icon: 'people-outline', route: '/(main)/community' },
  { key: 'rateUs', icon: 'star-outline', route: null },
] as const

type DrawerContextType = { openDrawer: () => void }
const DrawerContext = createContext<DrawerContextType>({ openDrawer: () => {} })

export function useDrawer() {
  return useContext(DrawerContext)
}

export function DrawerProvider({ children }: { children: ReactNode }) {
  const insets    = useSafeAreaInsets()
  const router    = useRouter()
  const { t, isRTL } = useLanguage()
  const S = useMemo(() => createStyles(isRTL), [isRTL])
  const [open, setOpen] = useState(false)
  const closedX = isRTL ? DRAWER_WIDTH : -DRAWER_WIDTH
  const slideAnim   = useRef(new Animated.Value(closedX)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  const openDrawer = () => {
    setOpen(true)
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 180 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start()
  }

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: closedX, duration: 240, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => setOpen(false))
  }

  return (
    <DrawerContext.Provider value={{ openDrawer }}>
      {children}
      <Modal visible={open} transparent animationType="none" onRequestClose={closeDrawer}>
        <Animated.View style={[S.overlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>

        <Animated.View style={[S.drawer, { transform: [{ translateX: slideAnim }] }]}>
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
            <Text style={S.drawerTitle}>{t('common.appName')}</Text>
            <Text style={S.drawerSub}>{t('drawer.tagline')}</Text>
          </View>

          <View style={S.drawerDivider} />

          <ScrollView style={S.drawerMenuScroll} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={S.menuRow}
                onPress={async () => {
                  closeDrawer()
                  if (item.route) {
                    router.push(item.route as any)
                  } else if (item.key === 'rateUs') {
                    const available = await StoreReview.isAvailableAsync()
                    if (available) await StoreReview.requestReview()
                  }
                }}
              >
                <View style={S.menuIconCircle}>
                  <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
                </View>
                <Text style={S.menuLabel}>{t(`drawer.${item.key}`)}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>

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
              <Text style={S.logoutText}>{t('drawer.logout')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </DrawerContext.Provider>
  )
}

const createStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const end: 'left' | 'right' = isRTL ? 'left' : 'right'

  return StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
    drawer: {
      position: 'absolute', top: 0, [start]: 0, bottom: 0,
      width: DRAWER_WIDTH,
      backgroundColor: '#FFFFFF',
      ...(isRTL
        ? { borderLeftWidth: 1, borderLeftColor: 'rgba(15,18,33,0.08)' }
        : { borderRightWidth: 1, borderRightColor: 'rgba(15,18,33,0.08)' }),
    } as any,
    drawerHeader: { paddingHorizontal: 24, paddingBottom: 24, alignItems: isRTL ? 'flex-end' : 'flex-start', position: 'relative' },
    drawerCloseBtn: {
      position: 'absolute', top: 24, [end]: 20,
      width: 36, height: 36, borderRadius: RADIUS.md,
      backgroundColor: COLORS.surface,
      borderWidth: 1, borderColor: COLORS.surfaceBorder,
      justifyContent: 'center', alignItems: 'center',
    } as any,
    drawerLogoWrap: { marginBottom: 14 },
    drawerLogo: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    drawerTitle: { fontSize: FS.h3, fontFamily: FONT.black, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
    drawerSub: { fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.medium, fontWeight: '500' },
    drawerDivider: { height: 1, backgroundColor: 'rgba(15,18,33,0.07)' },
    drawerMenuScroll: { flex: 1 },
    menuRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center',
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
    menuLabel: { flex: 1, fontSize: FS.md, fontFamily: FONT.semibold, fontWeight: '600', color: COLORS.textSecondary, textAlign: start },
    drawerFooter: { borderTopWidth: 1, borderTopColor: 'rgba(15,18,33,0.07)', padding: 24 },
    logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: isRTL ? 'flex-end' : 'flex-start', gap: 10 },
    logoutText: { fontSize: FS.md, fontFamily: FONT.bold, fontWeight: '700', color: COLORS.error },
  })
}
