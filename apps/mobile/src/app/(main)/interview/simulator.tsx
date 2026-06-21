import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { COLORS, RADIUS, SHADOW, FONT, FS, TEXT_SHADOW, SCRIM } from '@/constants/theme'
import { evaluateAnswer, EvaluatorOutput } from '@/services/mockAi'

const { width, height } = Dimensions.get('window')

// ─── Question Bank ────────────────────────────────────────────

interface Question {
  id: string
  type: 'hr' | 'behavioral' | 'technical'
  text: string
  hint: string
  timeLimit: number
}

const QUESTIONS: Question[] = [
  {
    id: 'q1', type: 'hr',
    text: 'حدثني عن نفسك وعن مسيرتك المهنية حتى الآن.',
    hint: 'ابدأ بخلفيتك التعليمية، ثم انتقل لأبرز خبراتك، واختم بما تطمح إليه.',
    timeLimit: 90,
  },
  {
    id: 'q2', type: 'behavioral',
    text: 'أخبرني عن موقف واجهت فيه تحدياً كبيراً في العمل. كيف تعاملت معه؟',
    hint: 'استخدم بنية STAR: الموقف، المهمة، الإجراء، النتيجة.',
    timeLimit: 120,
  },
  {
    id: 'q3', type: 'hr',
    text: 'ما هي نقاط قوتك الرئيسية؟ وكيف تُعززها في بيئة العمل؟',
    hint: 'اذكر مهارة قابلة للقياس وادعمها بمثال حقيقي.',
    timeLimit: 90,
  },
  {
    id: 'q4', type: 'behavioral',
    text: 'أعطني مثالاً على وقت أثبتَّ فيه مهاراتك القيادية.',
    hint: 'ركّز على كيفية تحفيز الفريق وتحقيق الهدف.',
    timeLimit: 120,
  },
  {
    id: 'q5', type: 'technical',
    text: 'كيف تتعامل مع الضغط ومواعيد التسليم الضيقة؟',
    hint: 'اذكر أسلوبك في إدارة الأولويات وتجنب الإرهاق.',
    timeLimit: 90,
  },
]

const TYPE_META = {
  hr:         { label: 'موارد بشرية', color: COLORS.teal,    icon: 'person-circle' },
  behavioral: { label: 'سلوكي',       color: COLORS.primary,  icon: 'flash' },
  technical:  { label: 'تقني',        color: '#F59E0B',       icon: 'code-slash' },
} as const

// ─── Waveform Bars ────────────────────────────────────────────

function WaveformBars({ active, color = COLORS.primary }: { active: boolean; color?: string }) {
  const bars = useRef(
    Array.from({ length: 9 }, () => new Animated.Value(0.2))
  ).current

  useEffect(() => {
    if (!active) {
      bars.forEach((b) => Animated.timing(b, { toValue: 0.2, duration: 200, useNativeDriver: true }).start())
      return
    }
    const anims = bars.map((b, i) => {
      const peak = 0.35 + Math.random() * 0.65
      return Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: peak, duration: 180 + i * 40, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.2 + Math.random() * 0.25, duration: 180 + i * 40, useNativeDriver: true }),
        ])
      )
    })
    anims.forEach((a) => a.start())
    return () => anims.forEach((a) => a.stop())
  }, [active])

  return (
    <View style={WS.wrap}>
      {bars.map((scaleY, i) => (
        <Animated.View
          key={i}
          style={[WS.bar, { backgroundColor: color, transform: [{ scaleY }] }]}
        />
      ))}
    </View>
  )
}

const WS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 44 },
  bar:  { width: 4, height: 40, borderRadius: 2, transformOrigin: 'center' } as any,
})

// ─── Cockpit Backdrop ─────────────────────────────────────────

function CockpitBackdrop({ timerRatio }: { timerRatio: number }) {
  const pulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  // Color transitions: green → amber → red as time elapses
  const ringColor = timerRatio > 0.6
    ? '#FF3B6B'
    : timerRatio > 0.35
      ? '#F59E0B'
      : COLORS.teal

  const glowOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] })

  return (
    <View style={CB.root}>
      {/* Light studio gradient */}
      <LinearGradient
        colors={['#F5F7FF', '#EEF1FF', '#F0F4FF', '#F5F7FF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle grid lines for "bright studio" aesthetic */}
      {Array.from({ length: 8 }).map((_, i) => (
        <View
          key={`h${i}`}
          style={[CB.gridLine, CB.gridH, { top: (i + 1) * (height * 0.35 / 9) }]}
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={[CB.gridLine, CB.gridV, { left: i * (width / 5) }]}
        />
      ))}

      {/* Radial glow ring around mic area */}
      <Animated.View style={[CB.radialWrap, { opacity: glowOpacity }]}>
        <View style={[CB.radialRing, CB.radialRing1, { borderColor: ringColor + '30' }]} />
        <View style={[CB.radialRing, CB.radialRing2, { borderColor: ringColor + '20' }]} />
        <View style={[CB.radialRing, CB.radialRing3, { borderColor: ringColor + '10' }]} />
      </Animated.View>

      {/* Scan beam */}
      <Animated.View
        style={[
          CB.scanBeam,
          {
            opacity: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.3, 0] }),
            transform: [{
              translateY: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, height * 0.35] }),
            }],
          },
        ]}
      />
    </View>
  )
}

const CB = StyleSheet.create({
  root:   { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(15, 18, 33, 0.05)' },
  gridH:    { left: 0, right: 0, height: 1 },
  gridV:    { top: 0, bottom: 0, width: 1 },
  radialWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  radialRing: { position: 'absolute', borderWidth: 1, borderRadius: 9999 },
  radialRing1: { width: 220, height: 220 },
  radialRing2: { width: 320, height: 320 },
  radialRing3: { width: 420, height: 420 },
  scanBeam: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 12,
  },
})

// ─── Mic Button ───────────────────────────────────────────────

function MicButton({
  recording, onPress, timerRatio,
}: { recording: boolean; onPress: () => void; timerRatio: number }) {
  const pulseScale = useRef(new Animated.Value(1)).current
  const btnScale   = useRef(new Animated.Value(1)).current

  const ringColor = timerRatio > 0.6 ? '#FF3B6B' : timerRatio > 0.35 ? '#F59E0B' : COLORS.teal

  useEffect(() => {
    if (!recording) {
      pulseScale.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.22, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [recording])

  const press   = () => Animated.spring(btnScale, { toValue: 0.92, useNativeDriver: true, speed: 80 }).start()
  const release = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()

  return (
    <View style={MB.wrap}>
      {/* Outer pulse ring */}
      {recording && (
        <Animated.View
          style={[
            MB.pulse,
            {
              borderColor: ringColor,
              transform: [{ scale: pulseScale }],
              opacity: pulseScale.interpolate({ inputRange: [1, 1.22], outputRange: [0.6, 0] }),
            },
          ]}
        />
      )}

      {/* Main button */}
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <TouchableOpacity
          style={[MB.btn, recording && { backgroundColor: ringColor }]}
          onPress={onPress}
          onPressIn={press}
          onPressOut={release}
          activeOpacity={1}
        >
          {recording
            ? <View style={MB.stopSquare} />
            : <Ionicons name="mic" size={30} color="#fff" />
          }
        </TouchableOpacity>
      </Animated.View>

      <Text style={[MB.label, { color: recording ? ringColor : COLORS.textMuted }]}>
        {recording ? 'اضغط للإيقاف' : 'اضغط للتسجيل'}
      </Text>
    </View>
  )
}

const MB = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  btn: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 24, elevation: 14,
  },
  stopSquare: { width: 24, height: 24, borderRadius: 5, backgroundColor: '#fff' },
  pulse: {
    position: 'absolute', width: 88, height: 88,
    borderRadius: 44, borderWidth: 2, alignSelf: 'center',
  },
  label: { fontSize: FS.sm, fontWeight: '600', letterSpacing: 0.5, fontFamily: FONT.semibold },
})

// ─── Timer Ring ───────────────────────────────────────────────

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const ratio = 1 - seconds / total
  const color = ratio > 0.6 ? COLORS.error : ratio > 0.35 ? '#F59E0B' : COLORS.teal

  return (
    <View style={TR.wrap}>
      <View style={[TR.track, { borderColor: 'rgba(15,18,33,0.10)' }]} />
      <View style={[TR.fill, { borderColor: color, transform: [{ rotate: `${ratio * 360}deg` }] }]} />
      <View style={TR.center}>
        <Text style={[TR.num, { color }]}>{seconds}</Text>
        <Text style={TR.sub}>ثانية</Text>
      </View>
    </View>
  )
}

const TR = StyleSheet.create({
  wrap:   { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  track:  { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
  fill:   { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  center: { alignItems: 'center' },
  num:    { fontSize: FS.h3, fontWeight: '900', fontFamily: FONT.black },
  sub:    { fontSize: FS.micro, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
})

// ─── Feedback Sheet ───────────────────────────────────────────

function FeedbackSheet({ visible, onClose, evaluation, question }: {
  visible: boolean
  onClose: () => void
  evaluation: EvaluatorOutput | null
  question: Question | null
}) {
  const slideAnim = useRef(new Animated.Value(600)).current

  const open = useCallback(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }).start()
  }, [])

  const close = () => {
    Animated.timing(slideAnim, { toValue: 600, duration: 260, useNativeDriver: true }).start(() => onClose())
  }

  if (!evaluation || !question) return null

  const scoreColor = evaluation.overallScore >= 80 ? COLORS.teal : evaluation.overallScore >= 60 ? COLORS.primary : COLORS.error

  return (
    <Modal visible={visible} transparent animationType="none" onShow={open} onRequestClose={close}>
      <View style={FBS.bg}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
      </View>
      <Animated.View style={[FBS.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={FBS.inner}>
          <View style={FBS.handle} />

          {/* Score header */}
          <View style={FBS.scoreRow}>
            <View style={[FBS.scoreBadge, { borderColor: scoreColor + '60', backgroundColor: scoreColor + '18' }]}>
              <Text style={[FBS.scoreNum, { color: scoreColor }]}>{evaluation.overallScore}</Text>
              <Text style={[FBS.scoreOf, { color: scoreColor }]}>%</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={FBS.title}>تقييم إجابتك</Text>
              <Text style={FBS.questionSnip} numberOfLines={2}>{question.text}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={FBS.scroll}>
            {/* Strengths (green feedback) */}
            {evaluation.green.length > 0 && (
              <View style={FBS.block}>
                <View style={FBS.blockHeader}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                  <Text style={FBS.blockTitle}>نقاط القوة</Text>
                </View>
                {evaluation.green.map((s: string, i: number) => (
                  <View key={i} style={FBS.bullet}>
                    <View style={[FBS.dot, { backgroundColor: COLORS.teal }]} />
                    <Text style={FBS.bulletText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Improvements (red feedback) */}
            {evaluation.red.length > 0 && (
              <View style={FBS.block}>
                <View style={FBS.blockHeader}>
                  <Ionicons name="trending-up" size={16} color={COLORS.primary} />
                  <Text style={FBS.blockTitle}>فرص التحسين</Text>
                </View>
                {evaluation.red.map((imp: string, i: number) => (
                  <View key={i} style={FBS.bullet}>
                    <View style={[FBS.dot, { backgroundColor: COLORS.primary }]} />
                    <Text style={FBS.bulletText}>{imp}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Amber tips */}
            {evaluation.amber.length > 0 && (
              <View style={[FBS.block, FBS.modelBlock]}>
                <View style={FBS.blockHeader}>
                  <Ionicons name="sparkles" size={16} color="#F59E0B" />
                  <Text style={[FBS.blockTitle, { color: '#F59E0B' }]}>نصائح للتطوير</Text>
                </View>
                {evaluation.amber.map((tip: string, i: number) => (
                  <Text key={i} style={[FBS.blockBody, { color: COLORS.textSecondary, marginBottom: 6 }]}>{tip}</Text>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={FBS.nextBtn} onPress={close}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={FBS.nextGrad}
            >
              <Text style={FBS.nextText}>السؤال التالي</Text>
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  )
}

const FBS = StyleSheet.create({
  bg:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl, overflow: 'hidden', maxHeight: '85%' },
  inner: { flex: 1, paddingTop: 14, paddingBottom: 36, backgroundColor: COLORS.surface },
  handle: { width: 38, height: 4, backgroundColor: 'rgba(15,18,33,0.12)', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },

  scoreRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 18, paddingHorizontal: 24, marginBottom: 24 },
  scoreBadge: {
    width: 76, height: 76, borderRadius: 20, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 2,
  },
  scoreNum: { fontSize: FS.h2, fontWeight: '900', fontFamily: FONT.black },
  scoreOf: { fontSize: FS.md, fontWeight: '700', alignSelf: 'flex-end', marginBottom: 6, fontFamily: FONT.bold },
  title: { fontSize: FS.xl, fontWeight: '900', color: COLORS.text, textAlign: 'right', marginBottom: 6, fontFamily: FONT.black },
  questionSnip: { fontSize: FS.sm, color: COLORS.textMuted, textAlign: 'right', fontFamily: FONT.regular },

  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  block: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xl, padding: 18, marginBottom: 14,
  },
  modelBlock: { borderColor: 'rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.06)' },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'flex-end' },
  blockTitle: { fontSize: FS.md, fontWeight: '800', color: COLORS.text, textAlign: 'right', fontFamily: FONT.extrabold },
  blockBody:  { fontSize: FS.sm, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'right', fontFamily: FONT.regular },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8, justifyContent: 'flex-end' },
  dot:    { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { fontSize: FS.sm, color: COLORS.textSecondary, flex: 1, textAlign: 'right', lineHeight: 20, fontFamily: FONT.regular },

  nextBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginHorizontal: 24, marginTop: 8 },
  nextGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: RADIUS.full },
  nextText: { fontSize: FS.lg, color: '#fff', fontWeight: '800', fontFamily: FONT.extrabold },
})

// ─── Summary Screen ───────────────────────────────────────────

function SessionSummary({ scores, onRestart }: { scores: EvaluatorOutput[]; onRestart: () => void }) {
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b.overallScore, 0) / scores.length) : 0
  const avgColor = avg >= 80 ? COLORS.teal : avg >= 60 ? COLORS.primary : COLORS.error

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
      <View style={SS.hero}>
        <LinearGradient
          colors={[COLORS.primary + '22', COLORS.teal + '11', 'transparent']}
          style={SS.heroBg}
        />
        <Text style={SS.heroTitle}>جلسة مكتملة</Text>
        <View style={[SS.avgBadge, { borderColor: avgColor + '60', backgroundColor: avgColor + '18' }]}>
          <Text style={[SS.avgNum, { color: avgColor }]}>{avg}</Text>
          <Text style={[SS.avgOf, { color: avgColor }]}>/10</Text>
        </View>
        <Text style={SS.avgLabel}>متوسط التقييم</Text>
      </View>

      {scores.map((ev, i) => {
        const c = ev.overallScore >= 80 ? COLORS.teal : ev.overallScore >= 60 ? COLORS.primary : COLORS.error
        return (
          <View key={i} style={SS.scoreRow}>
            <View style={[SS.scoreChip, { backgroundColor: c + '18', borderColor: c + '50' }]}>
              <Text style={[SS.scoreChipNum, { color: c }]}>{ev.overallScore}%</Text>
            </View>
            <Text style={SS.scoreQ} numberOfLines={2}>{QUESTIONS[i]?.text}</Text>
          </View>
        )
      })}

      <TouchableOpacity style={SS.restartBtn} onPress={onRestart}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={SS.restartGrad}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={SS.restartText}>جلسة جديدة</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  )
}

const SS = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 40, overflow: 'hidden', borderRadius: RADIUS.xxl, marginBottom: 28 },
  heroBg: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS.xxl },
  heroTitle: { fontSize: FS.h2, fontWeight: '900', color: COLORS.text, marginBottom: 24, fontFamily: FONT.black },
  avgBadge: { borderWidth: 2, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 10 },
  avgNum: { fontSize: FS.d2, fontWeight: '900', fontFamily: FONT.black },
  avgOf: { fontSize: FS.xl, fontWeight: '700', marginBottom: 6, fontFamily: FONT.bold },
  avgLabel: { fontSize: FS.md, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xl, padding: 16, marginBottom: 12,
  },
  scoreChip: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  scoreChipNum: { fontSize: FS.xl, fontWeight: '900', fontFamily: FONT.black },
  scoreQ: { flex: 1, fontSize: FS.sm, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 20, fontFamily: FONT.regular },
  restartBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: 12 },
  restartGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  restartText: { fontSize: FS.lg, color: '#fff', fontWeight: '800', fontFamily: FONT.extrabold },
})

// ─── Hint Drawer (NEW) ────────────────────────────────────────

function HintDrawer({ visible, onClose, hint }: { visible: boolean; onClose: () => void; hint: string }) {
  const slideAnim = useRef(new Animated.Value(500)).current

  const open = useCallback(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }).start()
  }, [])

  const close = () => {
    Animated.timing(slideAnim, { toValue: 500, duration: 240, useNativeDriver: true }).start(() => onClose())
  }

  return (
    <Modal visible={visible} transparent animationType="none" onShow={open} onRequestClose={close}>
      <View style={HD.bg}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
      </View>
      <Animated.View style={[HD.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={HD.inner}>
          {/* Handle */}
          <View style={HD.handle} />

          {/* Header */}
          <View style={HD.headerRow}>
            <Ionicons name={'sparkles' as any} size={20} color="#F59E0B" />
            <Text style={HD.headerText}>تلميح AI</Text>
          </View>

          {/* Hint content */}
          <View style={HD.hintBox}>
            <Text style={HD.hintText}>{hint}</Text>
          </View>

          {/* Close button */}
          <TouchableOpacity style={HD.closeBtn} onPress={close}>
            <Text style={HD.closeBtnText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  )
}

const HD = StyleSheet.create({
  bg:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.70)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: RADIUS.xxxl, borderTopRightRadius: RADIUS.xxxl,
    overflow: 'hidden',
  },
  inner: { paddingTop: 14, paddingBottom: 40, paddingHorizontal: 24, backgroundColor: COLORS.surface },
  handle: {
    width: 38, height: 4, backgroundColor: 'rgba(15,18,33,0.12)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 10, marginBottom: 20,
  },
  headerText: {
    fontSize: FS.xl, fontWeight: '900', color: COLORS.text, fontFamily: FONT.black,
  },
  hintBox: {
    backgroundColor: 'rgba(245,158,11,0.07)',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.22)',
    borderRadius: RADIUS.xl, padding: 20, marginBottom: 28,
  },
  hintText: {
    fontSize: FS.md, color: COLORS.textSecondary, textAlign: 'right',
    lineHeight: 26, fontFamily: FONT.regular,
  },
  closeBtn: {
    borderRadius: RADIUS.full, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.canvasAlt,
    paddingVertical: 16, alignItems: 'center',
  },
  closeBtnText: {
    fontSize: FS.md, color: COLORS.textSecondary, fontWeight: '700', fontFamily: FONT.bold,
  },
})

// ─── Main Simulator Screen ────────────────────────────────────

type SimState = 'ready' | 'thinking' | 'answering' | 'evaluating' | 'feedback' | 'done'

export default function InterviewSimulatorScreen() {
  const insets  = useSafeAreaInsets()
  const router  = useRouter()

  const [state, setState]       = useState<SimState>('ready')
  const [qIndex, setQIndex]     = useState(0)
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [evaluation, setEvaluation] = useState<EvaluatorOutput | null>(null)
  const [allScores, setAllScores]   = useState<EvaluatorOutput[]>([])
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const question = QUESTIONS[qIndex]
  const timerRatio = question ? 1 - timeLeft / question.timeLimit : 0

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const startTimer = useCallback((total: number) => {
    setTimeLeft(total)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearTimer(); stopRecording(); return 0 }
        return t - 1
      })
    }, 1000)
  }, [])

  const startRecording = () => {
    if (!question) return
    setRecording(true)
    setState('answering')
    startTimer(question.timeLimit)
  }

  const stopRecording = useCallback(async () => {
    clearTimer()
    setRecording(false)
    setState('evaluating')

    const durationSec = question ? question.timeLimit - timeLeft : 30
    const mockTranscript = `محاكاة إجابة على: ${question?.text ?? ''}`

    const result = await evaluateAnswer({
      questionId: question?.id ?? '',
      questionType: question?.type ?? 'hr',
      transcript: mockTranscript,
      durationSec,
    })
    setEvaluation(result)
    setAllScores((prev) => [...prev, result])
    setState('feedback')
    setFeedbackOpen(true)
  }, [question, timeLeft])

  const handleFeedbackClose = () => {
    setFeedbackOpen(false)
    if (qIndex + 1 >= QUESTIONS.length) {
      setState('done')
    } else {
      setQIndex((i) => i + 1)
      setState('ready')
      setEvaluation(null)
    }
  }

  const restart = () => {
    setQIndex(0); setState('ready'); setAllScores([]); setEvaluation(null)
  }

  useEffect(() => () => clearTimer(), [])

  const meta = TYPE_META[question?.type || 'hr']

  if (state === 'done') {
    return (
      <View style={[S.root, { paddingTop: insets.top }]}>
        <CockpitBackdrop timerRatio={0} />
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-forward" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>ملخص الجلسة</Text>
          <View style={{ width: 42 }} />
        </View>
        <SessionSummary scores={allScores} onRestart={restart} />
      </View>
    )
  }

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>
      <CockpitBackdrop timerRatio={timerRatio} />

      {/* ── Header ribbon ── */}
      <View style={S.header}>
        {/* Far LEFT: back button */}
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* CENTER: specialty badge + title stacked */}
        <View style={S.headerCenter}>
          <View style={[S.specialtyBadge, { borderColor: meta.color + '50', backgroundColor: meta.color + '14' }]}>
            <Ionicons name={meta.icon as any} size={12} color={meta.color} />
            <Text style={[S.specialtyBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={S.headerTitle}>محاكاة المقابلة</Text>
        </View>

        {/* Far RIGHT: AI Hint button */}
        <TouchableOpacity style={S.hintBtn} onPress={() => setHintOpen(true)}>
          <Ionicons name={'bulb-outline' as any} size={14} color={COLORS.primary} />
          <Text style={S.hintBtnText}>تلميح AI</Text>
        </TouchableOpacity>
      </View>

      {/* ── Progress strip ── */}
      <View style={S.progressStrip}>
        {QUESTIONS.map((_, i) => (
          <View
            key={i}
            style={[
              S.progressSeg,
              i < qIndex && { backgroundColor: COLORS.teal },
              i === qIndex && { backgroundColor: COLORS.primary, opacity: 0.9 },
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Question card ── */}
        <View style={S.questionCard}>
          <View style={S.questionGlass}>
            {/* Holographic AR label */}
            <View style={S.arLabel}>
              <View style={S.arDot} />
              <Text style={S.arLabelText}>LIVE QUESTION</Text>
            </View>

            <Text style={S.questionText}>{question?.text}</Text>
          </View>
        </View>

        {/* ── Waveform + timer row ── */}
        <View style={S.waveRow}>
          <TimerRing seconds={timeLeft || (question?.timeLimit || 90)} total={question?.timeLimit || 90} />
          <View style={S.waveCenter}>
            <WaveformBars
              active={recording}
              color={timerRatio > 0.6 ? COLORS.error : timerRatio > 0.35 ? '#F59E0B' : COLORS.teal}
            />
            {state === 'evaluating' && (
              <View style={S.evalRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={S.evalText}>يحلل AI إجابتك...</Text>
              </View>
            )}
          </View>
          <View style={{ width: 100 }} />
        </View>

        {/* ── Mic area ── */}
        <MicButton
          recording={recording}
          onPress={recording ? stopRecording : startRecording}
          timerRatio={timerRatio}
        />

        {/* ── State Ribbon ── */}
        <View style={S.stateRibbon}>
          {/* Left half: STANDBY */}
          <View style={S.ribbonHalf}>
            <View style={[S.ribbonDot, { backgroundColor: recording ? '#FF3B6B' : 'rgba(15,18,33,0.2)' }]} />
            <Text style={S.ribbonText}>STANDBY</Text>
          </View>

          {/* Divider */}
          <View style={S.ribbonDivider} />

          {/* Right half: AI READY */}
          <View style={S.ribbonHalf}>
            {state === 'evaluating'
              ? <ActivityIndicator size="small" color={COLORS.teal} style={{ marginRight: 4 }} />
              : <View style={[S.ribbonDot, { backgroundColor: COLORS.teal }]} />
            }
            <Text style={S.ribbonText}>AI READY</Text>
          </View>
        </View>

        {/* ── Past scores mini strip ── */}
        {allScores.length > 0 && (
          <View style={S.pastScores}>
            <Text style={S.pastScoresLabel}>التقييمات السابقة</Text>
            <View style={S.pastScoresRow}>
              {allScores.map((s, i) => {
                const c = s.overallScore >= 80 ? COLORS.teal : s.overallScore >= 60 ? COLORS.primary : COLORS.error
                return (
                  <View key={i} style={[S.pastScore, { borderColor: c + '60', backgroundColor: c + '14' }]}>
                    <Text style={[S.pastScoreNum, { color: c }]}>{s.overallScore}%</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <FeedbackSheet
        visible={feedbackOpen}
        onClose={handleFeedbackClose}
        evaluation={evaluation}
        question={question}
      />

      <HintDrawer
        visible={hintOpen}
        onClose={() => setHintOpen(false)}
        hint={question?.hint || ''}
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },

  // Header ribbon
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)',
  },
  backBtn: {
    width: 42, height: 42, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  headerTitle: {
    fontSize: FS.lg, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', fontFamily: FONT.extrabold,
  },
  specialtyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  specialtyBadgeText: {
    fontSize: FS.xs, fontWeight: '700', fontFamily: FONT.bold, letterSpacing: 0.3,
  },
  hintBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(47,108,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(47,108,255,0.30)',
    borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 8,
  },
  hintBtnText: {
    fontSize: FS.sm, color: COLORS.primary, fontWeight: '700', fontFamily: FONT.bold,
  },

  progressStrip: { flexDirection: 'row', gap: 4, paddingHorizontal: 24, paddingVertical: 10 },
  progressSeg: {
    flex: 1, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(15,18,33,0.08)',
  },

  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60, gap: 28, alignItems: 'center' },

  questionCard: { width: '100%', borderRadius: RADIUS.xxl, overflow: 'hidden', ...SHADOW.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  questionGlass: {
    paddingHorizontal: 28, paddingTop: 28, paddingBottom: 32,
    borderRadius: RADIUS.xxl,
  },
  arLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18, justifyContent: 'flex-end' },
  arDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.teal },
  arLabelText: { fontSize: FS.micro, color: COLORS.teal, fontWeight: '800', letterSpacing: 2, fontFamily: FONT.extrabold },
  questionText: { fontSize: FS.xl, fontWeight: '700', color: COLORS.text, textAlign: 'right', lineHeight: 30, fontFamily: FONT.bold },

  waveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  waveCenter: { alignItems: 'center', gap: 8 },
  evalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  evalText: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },

  // State ribbon (full-width)
  stateRibbon: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', height: 46,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.surfaceBorder,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  ribbonHalf: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  ribbonDivider: {
    width: 1, height: '60%', backgroundColor: 'rgba(15,18,33,0.08)',
  },
  ribbonDot: { width: 7, height: 7, borderRadius: 3.5 },
  ribbonText: {
    fontSize: FS.xs, color: COLORS.textMuted,
    fontWeight: '700', fontFamily: FONT.bold,
    letterSpacing: 1.5,
  },

  pastScores: { width: '100%', alignItems: 'flex-end', gap: 10 },
  pastScoresLabel: { fontSize: FS.xs, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 0.5, fontFamily: FONT.bold },
  pastScoresRow: { flexDirection: 'row', gap: 8 },
  pastScore: {
    width: 38, height: 38, borderRadius: 12, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  pastScoreNum: { fontSize: FS.md, fontWeight: '900', fontFamily: FONT.black },
})
