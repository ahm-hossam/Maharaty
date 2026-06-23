import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useRef, useEffect } from 'react'
import { COLORS, RADIUS, SHADOW, FONT, FS } from '@/constants/theme'
import { useActivity } from '@/hooks/useActivity'
import { api } from '@/services/api'

// ─── Types ────────────────────────────────────────────────────

type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

interface AssessmentQuestion {
  id: string
  text: string
  category: RiasecType
  dimension: string
}

// ─── Fallback questions ───────────────────────────────────────

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

function IntroScreen({ onStart, questionCount }: { onStart: () => void; questionCount: number }) {
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
    { icon: 'bulb-outline',      text: `${questionCount} سؤالاً مُصمَّماً بعناية لكشف نمطك المهني` },
    { icon: 'analytics-outline', text: 'تحليل RIASEC الذي يستخدمه 2000+ مرشد مهني' },
    { icon: 'compass-outline',   text: 'مسارات وظيفية مُوصى بها بناءً على شخصيتك' },
  ]

  return (
    <ScrollView contentContainerStyle={IS.content} showsVerticalScrollIndicator={false}>
      <View style={IS.orbWrap}>
        <Animated.View style={[IS.orbGlow, { opacity: glowAnim }]} />
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={IS.orb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="compass" size={52} color="#fff" />
        </LinearGradient>
      </View>

      <Text style={IS.title}>اكتشف شخصيتك المهنية</Text>
      <Text style={IS.subtitle}>
        تقييم علمي يبني خارطة مهنية دقيقة لمسارك الوظيفي، مستنداً إلى منهج Holland RIASEC المُعتمد دولياً.
      </Text>

      <View style={IS.featuresList}>
        {features.map((f, i) => (
          <View key={i} style={IS.featureRow}>
            <View style={IS.featureIcon}>
              <Ionicons name={f.icon as any} size={18} color={COLORS.primary} />
            </View>
            <Text style={IS.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={IS.statsCard}>
        <Text style={IS.statsCardLabel}>نظرة عامة على التقييم</Text>
        <View style={IS.statsRow}>
          {[
            { num: String(questionCount), label: 'سؤال' },
            { num: '6', label: 'أبعاد' },
            { num: '5 دق', label: 'تقريباً' },
          ].map((s, i) => (
            <View key={i} style={IS.statChip}>
              <Text style={IS.statNum}>{s.num}</Text>
              <Text style={IS.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={onStart} activeOpacity={0.9} style={IS.startBtnWrap}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={IS.startBtn}>
          <Text style={IS.startBtnText}>ابدأ التقييم</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  )
}

const IS = StyleSheet.create({
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
  featureRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 44, height: 44, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(47,108,255,0.14)', borderWidth: 1, borderColor: 'rgba(47,108,255,0.28)',
    justifyContent: 'center', alignItems: 'center',
  },
  featureText: { flex: 1, fontSize: FS.md, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22, fontFamily: FONT.regular },
  statsCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xxl, padding: 20, width: '100%', marginBottom: 40 },
  statsCardLabel: { fontSize: FS.xs, fontWeight: '800', fontFamily: FONT.extrabold, color: COLORS.textMuted, textAlign: 'right', marginBottom: 16, letterSpacing: 0.8 },
  statsRow: { flexDirection: 'row-reverse', gap: 12 },
  statChip: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingVertical: 16, alignItems: 'center', gap: 4 },
  statNum: { fontSize: FS.xl, fontWeight: '900', color: COLORS.primary, fontFamily: FONT.black },
  statLabel: { fontSize: FS.xs, color: COLORS.textMuted, fontWeight: '600', fontFamily: FONT.semibold },
  startBtnWrap: { width: '100%', borderRadius: RADIUS.full, overflow: 'hidden' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20, borderRadius: RADIUS.full },
  startBtnText: { fontSize: FS.lg, color: '#fff', fontWeight: '900', fontFamily: FONT.black },
})

// ─── Question Screen ──────────────────────────────────────────

const DIMENSION_COLORS: Record<string, string> = {
  'البراعة التنفيذية': '#F59E0B',
  'التفكير التحليلي': COLORS.primary,
  'الإبداع والابتكار': '#EC4899',
  'الكفاءة التواصلية': COLORS.teal,
  'الكفاءة القيادية': '#FF3B6B',
  'الدقة التنظيمية': '#10B981',
}

function QuestionScreen({
  question, qIndex, total, selected, onSelect,
}: {
  question: AssessmentQuestion; qIndex: number; total: number; selected: number | undefined; onSelect: (v: number) => void
}) {
  const slideAnim = useRef(new Animated.Value(60)).current
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const circleScales = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current

  useEffect(() => {
    slideAnim.setValue(60); fadeAnim.setValue(0)
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start()
  }, [qIndex])

  const dimColor = DIMENSION_COLORS[question.dimension] || COLORS.primary

  const handlePress = (v: number) => {
    const idx = v - 1
    Animated.sequence([
      Animated.spring(circleScales[idx], { toValue: 0.82, useNativeDriver: true, speed: 80 }),
      Animated.spring(circleScales[idx], { toValue: 1,    useNativeDriver: true, speed: 50 }),
    ]).start()
    onSelect(v)
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <ScrollView contentContainerStyle={QS.content} showsVerticalScrollIndicator={false}>
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

        {/* Question card */}
        <View style={QS.card}>
          <LinearGradient colors={['rgba(248,249,255,0.98)', 'rgba(240,244,255,1.0)']} style={QS.cardInner}>
            <Text style={QS.questionText}>{question.text}</Text>
          </LinearGradient>
        </View>

        {/* Likert scale */}
        <Text style={QS.scaleLabel}>اختر ما ينطبق عليك</Text>

        <View style={QS.likertWrap}>
          {/* Endpoint labels */}
          <View style={QS.likertEndRow}>
            <Text style={QS.likertEndLabel}>لا ينطبق</Text>
            <Text style={QS.likertEndLabel}>دائماً</Text>
          </View>

          {/* Circles with connecting line */}
          <View style={QS.likertRow}>
            <View style={[QS.likertLine, { backgroundColor: dimColor + '30' }]} />
            {[1, 2, 3, 4, 5].map((v) => {
              const isSelected = selected === v
              const isPast = selected !== undefined && v < selected
              return (
                <Animated.View key={v} style={{ transform: [{ scale: circleScales[v - 1] }], zIndex: 2 }}>
                  <TouchableOpacity onPress={() => handlePress(v)} activeOpacity={0.8} style={QS.likertBtn}>
                    <View style={[
                      QS.likertCircle,
                      isPast && { borderColor: dimColor + '60', backgroundColor: dimColor + '15' },
                      isSelected && { backgroundColor: dimColor, borderColor: dimColor },
                    ]}>
                      {isSelected
                        ? <Ionicons name="checkmark" size={20} color="#fff" />
                        : <Text style={[QS.likertNum, isPast && { color: dimColor }]}>{v}</Text>
                      }
                    </View>
                    {isSelected && <View style={[QS.likertDot, { backgroundColor: dimColor }]} />}
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </View>

          {/* Labels below each circle */}
          <View style={QS.likertValueRow}>
            {['لا\nينطبق', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'].map((label, i) => (
              <Text
                key={i}
                style={[QS.likertValueLabel, selected === i + 1 && { color: dimColor, fontFamily: FONT.bold }]}
              >
                {label}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  )
}

const QS = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },

  progressTrack: { height: 3, backgroundColor: 'rgba(15,18,33,0.08)', borderRadius: 2, marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 6 },
  progressMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  progressText: { fontSize: FS.sm, color: COLORS.textMuted, fontWeight: '700', fontFamily: FONT.bold },
  dimensionTag: { fontSize: FS.xs, fontWeight: '800', borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5, letterSpacing: 0.3, fontFamily: FONT.extrabold },

  card: { borderRadius: RADIUS.xxl, overflow: 'hidden', marginBottom: 40, ...SHADOW.md },
  cardInner: { padding: 28, borderWidth: 1, borderColor: 'rgba(15,18,33,0.09)', borderRadius: RADIUS.xxl },
  questionText: { fontSize: FS.lg, fontWeight: '700', color: COLORS.text, textAlign: 'right', lineHeight: 30, fontFamily: FONT.bold },

  scaleLabel: { fontSize: FS.xs, color: COLORS.textMuted, textAlign: 'right', marginBottom: 20, fontWeight: '700', letterSpacing: 0.8, fontFamily: FONT.bold },

  likertWrap: { paddingHorizontal: 4 },
  likertEndRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 10 },
  likertEndLabel: { fontSize: FS.xs, color: COLORS.textMuted, fontFamily: FONT.semibold },

  likertRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    position: 'relative', marginBottom: 10, paddingHorizontal: 4,
  },
  likertLine: { position: 'absolute', left: '8%', right: '8%', height: 2.5, borderRadius: 2, zIndex: 0 },

  likertBtn: { alignItems: 'center', gap: 4 },
  likertCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 2, borderColor: 'rgba(15,18,33,0.12)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  likertNum: { fontSize: FS.lg, fontWeight: '900', color: COLORS.textMuted, fontFamily: FONT.black },
  likertDot: { width: 6, height: 6, borderRadius: 3 },

  likertValueRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 2 },
  likertValueLabel: { fontSize: 9.5, color: COLORS.textMuted, fontFamily: FONT.regular, textAlign: 'center', width: 56, lineHeight: 13 },
})

// ─── Result Screen ────────────────────────────────────────────

function ResultScreen({ profile, onRetake }: { profile: CareerProfile; onRetake: () => void }) {
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
          <Text style={RS.profileType}>نمط {profile.type}</Text>
          <Text style={RS.profileTitle}>{profile.title}</Text>
          <Text style={RS.profileSub}>{profile.subtitle}</Text>
        </View>

        <ResultBlock title="سماتك الشخصية" icon="person-circle-outline" color={COLORS.primary}>
          {profile.traits.map((t, i) => <TraitRow key={i} text={t} accent={COLORS.primary} />)}
        </ResultBlock>
        <ResultBlock title="نقاط قوتك" icon="flash-outline" color={COLORS.teal}>
          {profile.strengths.map((s, i) => <TraitRow key={i} text={s} accent={COLORS.teal} />)}
        </ResultBlock>
        <ResultBlock title="المسارات المهنية الموصى بها" icon="briefcase-outline" color="#F59E0B">
          <View style={RS.careerGrid}>
            {profile.careers.map((c, i) => (
              <View key={i} style={RS.careerChip}><Text style={RS.careerChipText}>{c}</Text></View>
            ))}
          </View>
        </ResultBlock>
        <ResultBlock title="مجالات التطوير" icon="trending-up-outline" color="#EC4899">
          {profile.developmentAreas.map((d, i) => <TraitRow key={i} text={d} accent="#EC4899" />)}
        </ResultBlock>

        <TouchableOpacity style={RS.retakeBtn} onPress={onRetake}>
          <View style={RS.retakeInner}>
            <Ionicons name="refresh" size={17} color={COLORS.textMuted} />
            <Text style={RS.retakeText}>إعادة التقييم</Text>
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

const TR = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10, justifyContent: 'flex-end' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  text: { fontSize: FS.md, color: COLORS.textSecondary, flex: 1, textAlign: 'right', lineHeight: 22, fontFamily: FONT.regular },
})

function ResultBlock({ title, icon, color, children }: {
  title: string; icon: string; color: string; children: React.ReactNode
}) {
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

const RB = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: RADIUS.xxl, padding: 22, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, justifyContent: 'flex-end' },
  title: { fontSize: FS.md, fontWeight: '800', fontFamily: FONT.extrabold },
})

const RS = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 60 },
  hero: { borderRadius: RADIUS.xxl, overflow: 'hidden', alignItems: 'center', paddingVertical: 44, marginBottom: 24 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroIcon: { width: 88, height: 88, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  profileType: { fontSize: FS.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 2, marginBottom: 8, fontFamily: FONT.extrabold },
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

  const [questions, setQuestions] = useState<AssessmentQuestion[]>(FALLBACK_QUESTIONS)
  const [phase, setPhase]         = useState<Phase>('intro')
  const [qIndex, setQIndex]       = useState(0)
  const [answers, setAnswers]     = useState<Record<string, number>>({})
  const [profile, setProfile]     = useState<CareerProfile | null>(null)
  const autoAdvanceTimer          = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current) }
  }, [])

  const finishQuiz = (finalAnswers: Record<string, number>) => {
    const topType = computeTopProfile(finalAnswers, questions)
    setProfile(PROFILES[topType])
    setPhase('result')
    trackActivity('COMPLETE_ASSESSMENT', { riasecType: topType })
    const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    questions.forEach((q) => { scores[q.category] = (scores[q.category] || 0) + (finalAnswers[q.id] || 0) })
    api.post('/self-assessment/results', { topType, scores }).catch(() => {})
  }

  const handleSelect = (value: number) => {
    const newAnswers = { ...answers, [questions[qIndex].id]: value }
    setAnswers(newAnswers)
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = setTimeout(() => {
      if (qIndex < questions.length - 1) setQIndex((i) => i + 1)
      else finishQuiz(newAnswers)
    }, 400)
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
          {phase === 'intro' ? 'اختبار الشخصية المهنية' : phase === 'quiz' ? 'التقييم' : 'نتيجتك'}
        </Text>
        <View style={{ width: 42 }} />
      </View>

      {phase === 'intro' && <IntroScreen questionCount={questions.length} onStart={() => setPhase('quiz')} />}

      {phase === 'quiz' && (
        <>
          <QuestionScreen
            question={questions[qIndex]}
            qIndex={qIndex}
            total={questions.length}
            selected={answers[questions[qIndex]?.id]}
            onSelect={handleSelect}
          />
          <View style={[SC.footer, { paddingBottom: insets.bottom + 14 }]}>
            <TouchableOpacity style={SC.prevBtn} onPress={goPrev}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.textMuted} />
              <Text style={SC.prevBtnText}>السابق</Text>
            </TouchableOpacity>
            <Text style={SC.footerHint}>
              {answers[questions[qIndex]?.id] !== undefined ? 'جيد! سينتقل تلقائياً...' : 'اختر إجابتك للمتابعة'}
            </Text>
          </View>
        </>
      )}

      {phase === 'result' && profile && <ResultScreen profile={profile} onRetake={retake} />}
    </View>
  )
}

const SC = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 18, gap: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,18,33,0.07)',
  },
  backBtn: {
    width: 42, height: 42, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: FS.xl, fontWeight: '800', color: COLORS.text, textAlign: 'right', fontFamily: FONT.extrabold },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16,
    backgroundColor: COLORS.canvasAlt,
    borderTopWidth: 1, borderTopColor: 'rgba(15,18,33,0.07)',
  },
  prevBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prevBtnText: { fontSize: FS.sm, color: COLORS.textMuted, fontFamily: FONT.semibold },
  footerHint: { fontSize: FS.xs, color: COLORS.textMuted, fontFamily: FONT.regular, flex: 1, textAlign: 'left', marginLeft: 8 },
})
