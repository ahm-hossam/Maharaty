import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import NetInfo from '@react-native-community/netinfo'
import { COLORS, FONT, RADIUS, SHADOW } from '@/constants/theme'

const { width } = Dimensions.get('window')

type StepStatus = 'pending' | 'checking' | 'pass' | 'fail'

interface Step {
  id: string
  title: string
  subtitle: string
  icon: string
  checkingText: string
  passText: string
  failText: string
}

const STEPS: Step[] = [
  {
    id: 'internet',
    title: 'اتصال الإنترنت',
    subtitle: 'نحتاج اتصالاً نشطاً لتزامن بياناتك',
    icon: 'wifi',
    checkingText: 'جاري الفحص...',
    passText: 'الاتصال ممتاز',
    failText: 'لا يوجد اتصال — تحقق من الشبكة',
  },
  {
    id: 'microphone',
    title: 'إذن الميكروفون',
    subtitle: 'مطلوب لمحاكاة المقابلات الصوتية',
    icon: 'mic',
    checkingText: 'طلب الإذن...',
    passText: 'تم منح الإذن',
    failText: 'تم الرفض — يمكنك الاستخدام بدون صوت',
  },
  {
    id: 'vr',
    title: 'توافق VR',
    subtitle: 'فحص دعم الجيروسكوب لوضع الواقع الافتراضي',
    icon: 'glasses',
    checkingText: 'فحص المستشعرات...',
    passText: 'وضع VR متاح!',
    failText: 'VR غير متاح — سيعمل الوضع العادي',
  },
]

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({
    internet: 'pending',
    microphone: 'pending',
    vr: 'pending',
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)
  const progressAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start()
    runChecks()
  }, [])

  const setStatus = (id: string, status: StepStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  const runChecks = async () => {
    // Step 1: Internet
    setCurrentStep(0)
    setStatus('internet', 'checking')
    await delay(1200)
    const netState = await NetInfo.fetch().catch(() => null)
    const hasNet = netState?.isConnected ?? false
    setStatus('internet', hasNet ? 'pass' : 'fail')
    animateProgress(1 / 3)
    await delay(600)

    // Step 2: Microphone
    setCurrentStep(1)
    setStatus('microphone', 'checking')
    await delay(1000)
    // Simulate permission check (expo-av Audio.requestPermissionsAsync)
    // For demo, always pass after delay
    setStatus('microphone', 'pass')
    animateProgress(2 / 3)
    await delay(600)

    // Step 3: VR Gyroscope
    setCurrentStep(2)
    setStatus('vr', 'checking')
    await delay(1400)
    // Simulate gyroscope check
    // In production: use expo-sensors DeviceMotion.isAvailableAsync()
    setStatus('vr', 'pass')
    animateProgress(1)
    await delay(800)

    setDone(true)
  }

  const animateProgress = (toValue: number) => {
    Animated.spring(progressAnim, {
      toValue,
      useNativeDriver: false,
      damping: 14,
      stiffness: 120,
    }).start()
  }

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

  const getStatusIcon = (status: StepStatus): { name: string; color: string } => {
    switch (status) {
      case 'pass':    return { name: 'checkmark-circle', color: COLORS.success }
      case 'fail':    return { name: 'alert-circle', color: COLORS.warning }
      case 'checking':return { name: 'radio-button-on', color: COLORS.primary }
      default:        return { name: 'ellipse-outline', color: COLORS.textMuted }
    }
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bg, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.logoCircle}>
            <Ionicons name="bulb" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>مهاراتي</Text>
          <Text style={styles.appTagline}>نُعدّ بيئتك قبل الانطلاق</Text>
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          {STEPS.map((step, i) => {
            const status = statuses[step.id]
            const statusIcon = getStatusIcon(status)
            const isActive = i === currentStep && status === 'checking'

            return (
              <View key={step.id} style={[styles.stepRow, i < STEPS.length - 1 && styles.stepBorder]}>
                {/* Left: step icon */}
                <View style={[styles.stepIconCircle, isActive && styles.stepIconActive]}>
                  <Ionicons name={step.icon as any} size={22} color={isActive ? '#fff' : COLORS.primary} />
                </View>

                {/* Center: text */}
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepSub}>
                    {status === 'checking' ? step.checkingText
                      : status === 'pass' ? step.passText
                      : status === 'fail' ? step.failText
                      : step.subtitle}
                  </Text>
                </View>

                {/* Right: status */}
                <Ionicons
                  name={statusIcon.name as any}
                  size={24}
                  color={statusIcon.color}
                />
              </View>
            )
          })}
        </View>

        {/* CTA */}
        {done && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              onPress={() => router.replace('/(main)/home')}
              activeOpacity={0.88}
              style={styles.ctaBtn}
            >
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>ابدأ رحلتك المهنية</Text>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, paddingHorizontal: 24, paddingBottom: 48, justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  appName: { fontSize: 32, fontWeight: '800', fontFamily: FONT.extrabold, color: '#fff', marginBottom: 6 },
  appTagline: { fontSize: 15, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.65)' },

  progressWrap: { marginBottom: 24 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 3 },

  stepsCard: { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 32, overflow: 'hidden' },
  stepRow: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  stepIconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(79,70,229,0.25)', justifyContent: 'center', alignItems: 'center' },
  stepIconActive: { backgroundColor: COLORS.primary },
  stepText: { flex: 1, alignItems: 'flex-end' },
  stepTitle: { fontSize: 15, fontWeight: '700', fontFamily: FONT.bold, color: '#fff', textAlign: 'right', marginBottom: 3 },
  stepSub: { fontSize: 12, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },

  ctaBtn: { borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW.lg },
  ctaGradient: { height: 58, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  ctaText: { fontSize: 18, fontWeight: '800', fontFamily: FONT.extrabold, color: '#fff' },
})
