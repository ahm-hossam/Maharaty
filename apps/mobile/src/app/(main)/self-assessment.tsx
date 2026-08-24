import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useRef, useEffect, useMemo } from 'react'
import { COLORS, RADIUS, SHADOW, FONT, FS } from '@/constants/theme'
import { useActivity } from '../../hooks/useActivity'
import { api } from '../../services/api'
import { useLanguage } from '../../i18n/LanguageContext'

// ─── Types ────────────────────────────────────────────────────

type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

interface AssessmentQuestion {
  id: string
  text: string
  category: RiasecType
  dimension: string
}

// ─── Fallback questions (used if API unavailable) ─────────────
// Question/dimension text stays Arabic — it's assessment content, not UI
// chrome, and the backend has no English variant (see UI-only i18n scope).

const FALLBACK_QUESTIONS: AssessmentQuestion[] = [
  { id: '1',  text: 'أستمتع بتنفيذ مشاريع تقنية أو يدوية ملموسة وأقيس تقدمي بنتائج واضحة.', category: 'R', dimension: 'البراعة التنفيذية' },
  { id: '2',  text: 'أتميز في تحليل البيانات والمعلومات المعقدة للوصول إلى استنتاجات دقيقة.', category: 'I', dimension: 'التفكير التحليلي' },
  { id: '3',  text: 'لديّ قدرة على ابتكار حلول وأساليب غير تقليدية في بيئة العمل.', category: 'A', dimension: 'الإبداع والابتكار' },
  { id: '4',  text: 'أتميز في بناء علاقات مهنية وأجد رضاً حقيقياً في دعم نمو الفريق.', category: 'S', dimension: 'الكفاءة التواصلية' },
  { id: '5',  text: 'أستطيع قيادة مبادرات، اتخاذ قرارات صعبة، وإقناع الآخرين بالرؤية الاستراتيجية.', category: 'E', dimension: 'الكفاءة القيادية' },
  { id: '6',  text: 'أُجيد إدارة المهام بدقة وفق إجراءات موثقة مع الحفاظ على جودة عالية.', category: 'C', dimension: 'الدقة التنظيمية' },
  { id: '7',  text: 'لديّ خلفية تقنية أو هندسية أعتمد عليها في بيئة العمل.', category: 'R', dimension: 'البراعة التنفيذية' },
  { id: '8',  text: 'أقضي وقتاً في البحث واستكشاف أسباب المشكلات قبل اقتراح الحلول.', category: 'I', dimension: 'التفكير التحليلي' },
  { id: '9',  text: 'أجد نفسي منجذباً للوظائف التي تتيح مساحة للتعبير والتجريب.', category: 'A', dimension: 'الإبداع والابتكار' },
  { id: '10', text: 'أُسهم في رفع الروح المعنوية وأحل النزاعات داخل الفريق بفاعلية.', category: 'S', dimension: 'الكفاءة التواصلية' },
  { id: '11', text: 'أستطيع تحديد فرص النمو وتنفيذ خطط عمل واضحة لتحقيقها.', category: 'E', dimension: 'الكفاءة القيادية' },
  { id: '12', text: 'أُتقن توثيق العمليات والتعامل مع الأرقام والتقارير بدقة.', category: 'C', dimension: 'الدقة التنظيمية' },
  { id: '13', text: 'أستمتع بالعمل في مشاريع تشترط التعامل مع الأدوات، الأنظمة، أو البيئات المادية.', category: 'R', dimension: 'البراعة التنفيذية' },
  { id: '14', text: 'يجذبني العمل في مجالات تتطلب فهماً عميقاً للعلوم أو التقنية.', category: 'I', dimension: 'التفكير التحليلي' },
  { id: '15', text: 'أُقدّر المرونة في بيئة العمل وأشعر بأفضل أداء عندما تتاح لي حرية الإبداع.', category: 'A', dimension: 'الإبداع والابتكار' },
]

// ─── Result Profiles ──────────────────────────────────────────
// Profile content (titles, traits, careers) stays Arabic — same content
// scope reasoning as the questions above.

interface CareerProfile {
  type: string; title: string; subtitle: string; gradient: [string, string]; icon: string
  traits: string[]; careers: string[]; strengths: string[]; developmentAreas: string[]
}

const PROFILES: Record<RiasecType, CareerProfile> = {
  R: {
    type: 'R', title: 'المنفذ البراغماتي', subtitle: 'Realistic — التنفيذ والإنتاج',
    gradient: ['#F59E0B', '#E76F51'], icon: 'construct',
    traits: ['عملي وواقعي', 'يتقن التعامل مع الآلات والأنظمة', 'يفضل المهام الملموسة'],
    careers: ['هندسة ميكانيكية', 'تقنية المعلومات', 'العمارة والبناء', 'الصناعات التحويلية'],
    strengths: ['التخطيط العملي', 'إدارة المشاريع', 'الصبر والدقة'],
    developmentAreas: ['التواصل اللفظي', 'القيادة الإبداعية', 'التفكير الاستراتيجي'],
  },
  I: {
    type: 'I', title: 'المحلل المدقق', subtitle: 'Investigative — التحليل والبحث',
    gradient: ['#2F6CFF', '#7B5EA7'], icon: 'search',
    traits: ['منهجي وتحليلي', 'فضولي ويحب البحث', 'يحل المشكلات بمنطق'],
    careers: ['البحث العلمي', 'تحليل البيانات', 'الطب والصيدلة', 'الذكاء الاصطناعي'],
    strengths: ['التفكير النقدي', 'استخلاص الأنماط', 'الاستقلالية المعرفية'],
    developmentAreas: ['مهارات العرض', 'التعاون الجماعي', 'إدارة الوقت'],
  },
  A: {
    type: 'A', title: 'المبدع الاستثنائي', subtitle: 'Artistic — الإبداع والتعبير',
    gradient: ['#EC4899', '#F59E0B'], icon: 'color-palette',
    traits: ['تعبيري وخيالي', 'يقدر الجمال والأصالة', 'يثق بحدسه'],
    careers: ['تصميم الجرافيك', 'التسويق الإبداعي', 'الكتابة والمحتوى', 'تجربة المستخدم UX'],
    strengths: ['التفكير الإبداعي', 'التعبير والإقناع', 'الانتباه للتفاصيل البصرية'],
    developmentAreas: ['التنظيم والترتيب', 'تلبية المواعيد النهائية', 'القياس والتحليل'],
  },
  S: {
    type: 'S', title: 'الموصّل الاجتماعي', subtitle: 'Social — التواصل والتأثير',
    gradient: ['#00F5D4', '#0096C7'], icon: 'people',
    traits: ['تعاوني وذكي عاطفياً', 'يُلهم الفرق ويبني الثقة', 'يتقن التعليم والإرشاد'],
    careers: ['الموارد البشرية', 'التدريب والتطوير', 'العلاقات العامة', 'الرعاية الاجتماعية'],
    strengths: ['الذكاء العاطفي', 'الاستماع الفعال', 'بناء الفرق'],
    developmentAreas: ['صنع القرار بحزم', 'حماية الحدود المهنية', 'التحليل الموضوعي'],
  },
  E: {
    type: 'E', title: 'القائد الاستراتيجي', subtitle: 'Enterprising — القيادة والإنجاز',
    gradient: ['#FF3B6B', '#7B5EA7'], icon: 'trending-up',
    traits: ['طموح ومحفوز للإنجاز', 'يقنع ويتفاوض بمهارة', 'يرى الصورة الكبيرة'],
    careers: ['إدارة الأعمال', 'ريادة الأعمال', 'المبيعات والتفاوض', 'تطوير الأعمال'],
    strengths: ['القيادة التحفيزية', 'صنع القرار السريع', 'الرؤية الاستراتيجية'],
    developmentAreas: ['الصبر والتأمل', 'التعمق في التفاصيل', 'إدارة الضغط'],
  },
  C: {
    type: 'C', title: 'المنظّم الدقيق', subtitle: 'Conventional — الدقة والتنظيم',
    gradient: ['#10B981', '#0D9488'], icon: 'checkmark-circle',
    traits: ['دقيق ومنهجي', 'يُتقن اتباع الإجراءات', 'يحرص على الجودة'],
    careers: ['المحاسبة والمالية', 'الإدارة والتوثيق', 'التدقيق والرقابة', 'إدارة المخزون'],
    strengths: ['الدقة والتفاصيل', 'الانضباط والالتزام', 'الموثوقية والاتساق'],
    developmentAreas: ['التكيف مع التغيير', 'الإبداع في الحل', 'مهارات القيادة'],
  },
}

// ─── Score computation ────────────────────────────────────────

function computeTopProfile(answers: Record<string, number>, questions: AssessmentQuestion[]): RiasecType {
  const totals: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  questions.forEach((q) => { totals[q.category] = (totals[q.category] || 0) + (answers[q.id] || 0) })
  return (Object.entries(totals).sort(([, a], [, b]) => b - a)[0][0] as RiasecType)
}

// ─── Intro Screen ─────────────────────────────────────────────

function IntroScreen({
  onStart,
  questionCount,
  t,
  S,
}: {
  onStart: () => void
  questionCount: number
  t: (key: string, params?: Record<string, string | number>) => string
  S: ReturnType<typeof createIntroStyles>
}) {
  const glowAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const features = [
    { icon: 'bulb-outline',      text: t('selfAssessment.feature1', { n: questionCount }) },
    { icon: 'analytics-outline', text: t('selfAssessment.feature2') },
    { icon: 'compass-outline',   text: t('selfAssessment.feature3') },
  ]

  return (
    <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
      <View style={S.orbWrap}>
        <Animated.View style={[S.orbGlow, { opacity: glowAnim }]} />
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={S.orb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="compass" size={52} color="#fff" />
        </LinearGradient>
      </View>

      <Text style={S.title}>{t('selfAssessment.introTitle')}</Text>
      <Text style={S.subtitle}>
        {t('selfAssessment.introSubtitle')}
      </Text>

      <View style={S.featuresList}>
        {features.map((f, i) => (
          <View key={i} style={S.featureRow}>
            <View style={S.featureIcon}>
              <Ionicons name={f.icon as any} size={18} color={COLORS.primary} />
            </View>
            <Text style={S.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={S.statsCard}>
        <Text style={S.statsCardLabel}>{t('selfAssessment.overviewLabel')}</Text>
        <View style={S.statsRow}>
          {[
            { num: String(questionCount), label: t('selfAssessment.statQuestions') },
            { num: '6', label: t('selfAssessment.statDimensions') },
            { num: t('selfAssessment.statTime'), label: t('selfAssessment.statTimeLabel') },
          ].map((s, i) => (
            <View key={i} style={S.statChip}>
              <Text style={S.statNum}>{s.num}</Text>
              <Text style={S.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={onStart} activeOpacity={0.9} style={S.startBtnWrap}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.startBtn}>
          <Text style={S.startBtnText}>{t('selfAssessment.startBtn')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  )
}

const createIntroStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const row = isRTL ? 'row-reverse' : 'row' as const

  return StyleSheet.create({
    content: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 60, alignItems: 'center' },
    orbWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 36, width: 140, height: 140 },
    orbGlow: {
      position: 'absolute', width: 140, height: 140, borderRadius: 70,
      backgroundColor: COLORS.primary, opacity: 0.25,
      shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 40,
    },
    orb: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: FS.h2, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 14, fontFamily: FONT.black },
    subtitle: { fontSize: FS.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 26, marginBottom: 36, fontFamily: FONT.regular },
    featuresList: { width: '100%', gap: 14, marginBottom: 32 },
    featureRow: { flexDirection: row, alignItems: 'center', gap: 14 },
    featureIcon: {
      width: 44, height: 44, borderRadius: RADIUS.lg,
      backgroundColor: 'rgba(47,108,255,0.14)', borderWidth: 1, borderColor: 'rgba(47,108,255,0.28)',
      justifyContent: 'center', alignItems: 'center',
    },
    featureText: { flex: 1, fontSize: FS.md, color: COLORS.textSecondary, textAlign: start, lineHeight: 22, fontFamily: FONT.regular },
    statsCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xxl, padding: 20, width: '100%', marginBottom: 40 },
    statsCardLabel: { fontSize: FS.xs, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.textMuted, textAlign: start, marginBottom: 16 },
    statsRow: { flexDirection: row, gap: 12 },
    statChip: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingVertical: 16, alignItems: 'center', gap: 4 },
    statNum: { fontSize: FS.xl, fontWeight: '900', color: COLORS.primary, fontFamily: FONT.black },
    statLabel: { fontSize: FS.xs, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
    startBtnWrap: { width: '100%', borderRadius: RADIUS.full, overflow: 'hidden' },
    startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20, borderRadius: RADIUS.full },
    startBtnText: { fontSize: FS.lg, color: '#fff', fontWeight: '900', fontFamily: FONT.black },
  })
}

// ─── Question Screen ──────────────────────────────────────────
// Swipe metaphor (right=yes, left=no) and its badges/buttons/hints are kept
// physically fixed regardless of language, like a media control — only the
// text on them is translated.

const DIMENSION_COLORS: Record<string, string> = {
  'البراعة التنفيذية': '#F59E0B',
  'التفكير التحليلي': COLORS.primary,
  'الإبداع والابتكار': '#EC4899',
  'الكفاءة التواصلية': COLORS.teal,
  'الكفاءة القيادية': '#FF3B6B',
  'الدقة التنظيمية': '#10B981',
}

const SWIPE_THRESHOLD = 90

function QuestionScreen({
  question, qIndex, total, selected, onSelect, t,
}: {
  question: AssessmentQuestion; qIndex: number; total: number; selected: number | undefined; onSelect: (v: number) => void
  t: (key: string) => string
}) {
  const translateX  = useRef(new Animated.Value(0)).current
  const slideAnim   = useRef(new Animated.Value(60)).current
  const fadeAnim    = useRef(new Animated.Value(0)).current
  const onSelectRef = useRef(onSelect)
  const flyOutRef   = useRef<(dir: 1 | -1, val: number) => void>(() => {})

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  useEffect(() => {
    translateX.setValue(0)
    slideAnim.setValue(60); fadeAnim.setValue(0)
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start()
  }, [qIndex])

  const cardRotate = translateX.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-12deg', '0deg', '12deg'] })
  const yesOpacity = translateX.interpolate({ inputRange: [20, 90], outputRange: [0, 1], extrapolate: 'clamp' })
  const noOpacity  = translateX.interpolate({ inputRange: [-90, -20], outputRange: [1, 0], extrapolate: 'clamp' })
  const cardBgColor = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['rgba(254,226,226,0.95)', 'rgba(248,249,255,0.98)', 'rgba(220,252,231,0.95)'],
  })

  const flyOut = (dir: 1 | -1, val: number) => {
    Animated.timing(translateX, { toValue: dir * 500, duration: 200, useNativeDriver: false }).start(() => {
      fadeAnim.setValue(0)
      translateX.setValue(0)
      onSelectRef.current(val)
    })
  }
  flyOutRef.current = flyOut

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 80,
    onPanResponderMove: (_, g) => { translateX.setValue(g.dx) },
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD)        flyOutRef.current(1, 1)
      else if (g.dx < -SWIPE_THRESHOLD)  flyOutRef.current(-1, 0)
      else Animated.spring(translateX, { toValue: 0, useNativeDriver: false, damping: 15, stiffness: 220 }).start()
    },
  })).current

  const dimColor = DIMENSION_COLORS[question.dimension] || COLORS.primary

  return (
    <Animated.View style={[QS.wrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={QS.content}>
        {/* Progress bar */}
        <View style={QS.progressTrack}>
          <View style={[QS.progressFill, { width: `${((qIndex + 1) / total) * 100}%` as any }]} />
        </View>
        <View style={QS.progressMeta}>
          <Text style={QS.progressText}>{qIndex + 1} / {total}</Text>
          <Text style={[QS.dimensionTag, { color: dimColor, borderColor: dimColor + '50', backgroundColor: dimColor + '12' }]}>
            {question.dimension}
          </Text>
        </View>

        {/* Swipeable card */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[QS.card, { backgroundColor: cardBgColor, transform: [{ translateX }, { rotate: cardRotate }] }]}
        >
          {/* Yes badge — appears on right swipe */}
          <Animated.View style={[QS.swipeBadge, QS.yesBadge, { opacity: yesOpacity }]}>
            <Text style={QS.yesBadgeText}>{t('selfAssessment.yesBadge')}</Text>
          </Animated.View>
          {/* No badge — appears on left swipe */}
          <Animated.View style={[QS.swipeBadge, QS.noBadge, { opacity: noOpacity }]}>
            <Text style={QS.noBadgeText}>{t('selfAssessment.noBadge')}</Text>
          </Animated.View>

          <Text style={QS.questionText}>{question.text}</Text>
        </Animated.View>

        {/* Swipe hint — row so labels align with buttons below */}
        <View style={QS.swipeHintRow}>
          <Text style={QS.swipeHintSide}>{t('selfAssessment.swipeHintNo')}</Text>
          <Text style={QS.swipeHintCenter}>{t('selfAssessment.swipeHintCenter')}</Text>
          <Text style={QS.swipeHintSide}>{t('selfAssessment.swipeHintYes')}</Text>
        </View>

        {/* Yes / No buttons */}
        <View style={QS.btnRow}>
          <TouchableOpacity
            onPress={() => flyOut(-1, 0)}
            activeOpacity={0.82}
            style={[QS.actionBtn, QS.noBtn, selected === 0 && QS.noBtnActive]}
          >
            <Ionicons name="close" size={30} color={selected === 0 ? '#fff' : '#EF4444'} />
            <Text style={[QS.actionBtnText, { color: selected === 0 ? '#fff' : '#EF4444' }]}>{t('selfAssessment.no')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => flyOut(1, 1)}
            activeOpacity={0.82}
            style={[QS.actionBtn, QS.yesBtn, selected === 1 && QS.yesBtnActive]}
          >
            <Ionicons name="checkmark" size={30} color={selected === 1 ? '#fff' : '#10B981'} />
            <Text style={[QS.actionBtnText, { color: selected === 1 ? '#fff' : '#10B981' }]}>{t('selfAssessment.yes')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}

const QS = StyleSheet.create({
  wrapper: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, flex: 1 },

  progressTrack: { height: 3, backgroundColor: 'rgba(15,18,33,0.08)', borderRadius: 2, marginBottom: 14, flexDirection: 'row-reverse' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 6 },
  progressMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  progressText: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '700', fontFamily: FONT.bold },
  dimensionTag: { fontSize: FS.xs, fontWeight: '800', borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5, fontFamily: FONT.extrabold },

  card: {
    flex: 1,
    borderRadius: RADIUS.xxl,
    borderWidth: 1, borderColor: 'rgba(15,18,33,0.09)',
    padding: 28,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  questionText: { fontSize: FS.xl, fontWeight: '700', color: COLORS.text, textAlign: 'center', lineHeight: 34, fontFamily: FONT.bold },

  swipeBadge: { position: 'absolute', top: 24, borderRadius: RADIUS.lg, paddingHorizontal: 18, paddingVertical: 9, borderWidth: 2.5 },
  yesBadge: { left: 20, backgroundColor: '#10B981', borderColor: '#059669', transform: [{ rotate: '-12deg' }] },
  noBadge:  { right: 20, backgroundColor: '#EF4444', borderColor: '#DC2626', transform: [{ rotate: '12deg' }] },
  yesBadgeText: { fontSize: FS.md, fontWeight: '900', color: '#fff', fontFamily: FONT.black },
  noBadgeText:  { fontSize: FS.md, fontWeight: '900', color: '#fff', fontFamily: FONT.black },

  swipeHintRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingHorizontal: 4 },
  swipeHintSide: { fontSize: FS.xs, color: COLORS.textMuted, fontFamily: FONT.semibold },
  swipeHintCenter: { fontSize: FS.xs, color: COLORS.textMuted, fontFamily: FONT.regular },

  btnRow: { flexDirection: 'row', gap: 14 },
  actionBtn: { flex: 1, height: 72, borderRadius: RADIUS.xxl, justifyContent: 'center', alignItems: 'center', gap: 4, borderWidth: 2 },
  noBtn:       { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  noBtnActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  yesBtn:       { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  yesBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  actionBtnText: { fontSize: FS.md, fontWeight: '800', fontFamily: FONT.extrabold },
})

// ─── Result Screen ────────────────────────────────────────────
// Section headers (chrome) are translated and mirrored; profile content
// (traits/careers/strengths) stays Arabic and keeps its original RTL layout.

function ResultScreen({
  profile,
  onRetake,
  t,
  RB,
}: {
  profile: CareerProfile
  onRetake: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  RB: ReturnType<typeof createResultBlockStyles>
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current
  const fadeAnim  = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 160 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <ScrollView contentContainerStyle={RS.content} showsVerticalScrollIndicator={false}>
        <View style={RS.hero}>
          <LinearGradient colors={profile.gradient} style={RS.heroBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={RS.heroIcon}>
            <Ionicons name={profile.icon as any} size={42} color="#fff" />
          </View>
          <Text style={RS.profileType}>{t('selfAssessment.typePrefix', { type: profile.type })}</Text>
          <Text style={RS.profileTitle}>{profile.title}</Text>
          <Text style={RS.profileSub}>{profile.subtitle}</Text>
        </View>

        <ResultBlock title={t('selfAssessment.yourTraits')} icon="person-circle-outline" color={COLORS.primary} RB={RB}>
          {profile.traits.map((tr, i) => <TraitRow key={i} text={tr} accent={COLORS.primary} />)}
        </ResultBlock>

        <ResultBlock title={t('selfAssessment.yourStrengths')} icon="flash-outline" color={COLORS.teal} RB={RB}>
          {profile.strengths.map((s, i) => <TraitRow key={i} text={s} accent={COLORS.teal} />)}
        </ResultBlock>

        <ResultBlock title={t('selfAssessment.recommendedCareers')} icon="briefcase-outline" color="#F59E0B" RB={RB}>
          <View style={RS.careerGrid}>
            {profile.careers.map((c, i) => (
              <View key={i} style={RS.careerChip}><Text style={RS.careerChipText}>{c}</Text></View>
            ))}
          </View>
        </ResultBlock>

        <ResultBlock title={t('selfAssessment.developmentAreas')} icon="trending-up-outline" color="#EC4899" RB={RB}>
          {profile.developmentAreas.map((d, i) => <TraitRow key={i} text={d} accent="#EC4899" />)}
        </ResultBlock>

        <TouchableOpacity style={RS.retakeBtn} onPress={onRetake}>
          <View style={RS.retakeInner}>
            <Ionicons name="refresh" size={17} color={COLORS.textMuted} />
            <Text style={RS.retakeText}>{t('selfAssessment.retake')}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  )
}

function TraitRow({ text, accent }: { text: string; accent: string }) {
  return (
    <View style={TR.row}>
      <View style={[TR.dot, { backgroundColor: accent }]} />
      <Text style={TR.text}>{text}</Text>
    </View>
  )
}

// Arabic content (trait/career text) always reads right-to-left, regardless
// of the app's current UI language — layout stays fixed here.
const TR = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10, justifyContent: 'flex-end' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  text: { fontSize: FS.md, color: COLORS.textSecondary, flex: 1, textAlign: 'right', lineHeight: 22, fontFamily: FONT.regular },
})

function ResultBlock({ title, icon, color, children, RB }: { title: string; icon: string; color: string; children: React.ReactNode; RB: ReturnType<typeof createResultBlockStyles> }) {
  return (
    <View style={[RB.wrap, { borderColor: color + '28', backgroundColor: color + '08' }]}>
      <View style={RB.header}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={[RB.title, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

const createResultBlockStyles = (isRTL: boolean) => {
  const row = isRTL ? 'row-reverse' : 'row' as const
  return StyleSheet.create({
    wrap: { borderWidth: 1, borderRadius: RADIUS.xxl, padding: 22, marginBottom: 16 },
    header: { flexDirection: row, alignItems: 'center', gap: 10, marginBottom: 16, justifyContent: isRTL ? 'flex-end' : 'flex-start' },
    title: { fontSize: FS.md, fontWeight: '800', fontFamily: FONT.extrabold },
  })
}

const RS = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 60 },
  hero: { borderRadius: RADIUS.xxl, overflow: 'hidden', alignItems: 'center', paddingVertical: 44, marginBottom: 24 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroIcon: { width: 88, height: 88, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  profileType: { fontSize: FS.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '800', marginBottom: 8, fontFamily: FONT.extrabold },
  profileTitle: { fontSize: FS.h2, fontWeight: '900', color: '#fff', marginBottom: 6, fontFamily: FONT.black },
  profileSub: { fontSize: FS.md, color: 'rgba(255,255,255,0.72)', fontWeight: '600', fontFamily: FONT.semibold },
  careerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' },
  careerChip: { borderRadius: RADIUS.full, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', paddingHorizontal: 14, paddingVertical: 7 },
  careerChipText: { fontSize: FS.sm, color: '#F59E0B', fontWeight: '700', fontFamily: FONT.bold },
  retakeBtn: { borderWidth: 1, borderColor: 'rgba(15,18,33,0.12)', borderRadius: RADIUS.xl, overflow: 'hidden', marginTop: 8 },
  retakeInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  retakeText: { fontSize: FS.md, color: COLORS.textMuted, fontWeight: '700', fontFamily: FONT.bold },
})

// ─── Main Screen ──────────────────────────────────────────────

type Phase = 'intro' | 'quiz' | 'result'

export default function SelfAssessmentScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { trackActivity } = useActivity()
  const { t, isRTL } = useLanguage()
  const SC = useMemo(() => createScreenStyles(isRTL), [isRTL])
  const introStyles = useMemo(() => createIntroStyles(isRTL), [isRTL])
  const RB = useMemo(() => createResultBlockStyles(isRTL), [isRTL])

  const [questions, setQuestions] = useState<AssessmentQuestion[]>(FALLBACK_QUESTIONS)
  const [phase, setPhase]         = useState<Phase>('intro')
  const [qIndex, setQIndex]       = useState(0)
  const [answers, setAnswers]     = useState<Record<string, number>>({})
  const [profile, setProfile]     = useState<CareerProfile | null>(null)
  const autoAdvanceTimer          = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch questions from API, fall back to hardcoded on error
  useEffect(() => {
    api.get('/self-assessment/questions')
      .then((r) => {
        const fetched = r.data?.data
        if (Array.isArray(fetched) && fetched.length > 0) {
          setQuestions(fetched.map((q: any) => ({
            id: q.id,
            text: q.textAr,
            category: q.category as RiasecType,
            dimension: q.dimensionLabel,
          })))
        }
      })
      .catch(() => { /* use fallback */ })
  }, [])

  useEffect(() => {
    trackActivity('START_ASSESSMENT')
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [])

  const finishQuiz = (finalAnswers: Record<string, number>) => {
    const topType = computeTopProfile(finalAnswers, questions)
    setProfile(PROFILES[topType])
    setPhase('result')
    trackActivity('COMPLETE_ASSESSMENT', { riasecType: topType })

    // Submit to backend (fire and forget)
    const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    questions.forEach((q) => { scores[q.category] = (scores[q.category] || 0) + (finalAnswers[q.id] || 0) })
    api.post('/self-assessment/results', { topType, scores }).catch(() => {})
  }

  const handleSelect = (value: number) => {
    const newAnswers = { ...answers, [questions[qIndex].id]: value }
    setAnswers(newAnswers)

    // Auto-advance after brief delay (swipe animation already provides visual feedback)
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setQIndex((i) => i + 1)
      } else {
        finishQuiz(newAnswers)
      }
    }, 300)
  }

  const goPrev = () => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    if (qIndex > 0) setQIndex((i) => i - 1)
    else setPhase('intro')
  }

  const retake = () => { setPhase('intro'); setQIndex(0); setAnswers({}); setProfile(null) }

  return (
    <View style={[SC.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={SC.header}>
        <TouchableOpacity style={SC.backBtn} onPress={() => (phase === 'quiz' ? goPrev() : router.back())}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={SC.headerTitle}>
          {phase === 'intro' ? t('selfAssessment.headerTitleIntro') : phase === 'quiz' ? t('selfAssessment.headerTitleQuiz') : t('selfAssessment.headerTitleResult')}
        </Text>
        <View style={{ width: 42 }} />
      </View>

      {/* Content */}
      {phase === 'intro' && (
        <IntroScreen questionCount={questions.length} onStart={() => setPhase('quiz')} t={t} S={introStyles} />
      )}

      {phase === 'quiz' && (
        <>
          <QuestionScreen
            question={questions[qIndex]}
            qIndex={qIndex}
            total={questions.length}
            selected={answers[questions[qIndex]?.id]}
            onSelect={handleSelect}
            t={t}
          />
          {/* Footer */}
          <View style={[SC.footer, { paddingBottom: insets.bottom + 14 }]}>
            <Text style={SC.footerHint}>
              {answers[questions[qIndex]?.id] !== undefined
                ? t('selfAssessment.autoAdvanceHint')
                : t('selfAssessment.selectHint')}
            </Text>
            <TouchableOpacity style={SC.prevBtn} onPress={goPrev} activeOpacity={0.75}>
              <Ionicons name="chevron-back" size={16} color={COLORS.textSecondary} />
              <Text style={SC.prevBtnText}>{t('selfAssessment.previous')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {phase === 'result' && profile && <ResultScreen profile={profile} onRetake={retake} t={t} RB={RB} />}
    </View>
  )
}

const createScreenStyles = (isRTL: boolean) => {
  const start: 'left' | 'right' = isRTL ? 'right' : 'left'
  const row = isRTL ? 'row-reverse' : 'row' as const

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.canvas },
    header: {
      flexDirection: row, alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 18, gap: 14,
      borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)',
    },
    backBtn: {
      width: 42, height: 42, borderRadius: RADIUS.lg,
      backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder,
      justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { flex: 1, fontSize: FS.xl, fontWeight: '800', color: COLORS.text, textAlign: start, fontFamily: FONT.extrabold },

    footer: {
      flexDirection: isRTL ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 24, paddingTop: 14,
      backgroundColor: COLORS.canvas,
      borderTopWidth: 1, borderTopColor: 'rgba(15,18,33,0.07)',
      gap: 12,
    },
    footerHint: { flex: 1, fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.regular, textAlign: start },
    prevBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder,
      borderRadius: RADIUS.xl, paddingHorizontal: 16, paddingVertical: 10,
    },
    prevBtnText: { fontSize: FS.sm, fontWeight: '700', color: COLORS.textSecondary, fontFamily: FONT.bold },
  })
}
