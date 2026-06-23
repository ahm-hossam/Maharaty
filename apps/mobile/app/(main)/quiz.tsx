import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useRef, useEffect } from 'react'
import { COLORS, RADIUS, SHADOW, FONT, FS } from '@/constants/theme'

const { width } = Dimensions.get('window')

// ─── RIASEC Question Bank (15 questions) ─────────────────────

type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

interface QuizQuestion {
  id: string
  text: string
  category: RiasecType
  options: { label: string; value: 1 | 2 | 3 | 4 | 5 }[]
}

const QUESTIONS: QuizQuestion[] = [
  { id: '1', text: 'أستمتع بالعمل بيدي وإصلاح الأشياء أو بناء المشاريع المادية.', category: 'R', options: optSet() },
  { id: '2', text: 'أحب إجراء الأبحاث وتحليل البيانات لفهم الظواهر.', category: 'I', options: optSet() },
  { id: '3', text: 'أجد نفسي منجذباً للتعبير الإبداعي من خلال الفن أو الموسيقى أو الكتابة.', category: 'A', options: optSet() },
  { id: '4', text: 'يُسعدني مساعدة الآخرين وتدريبهم وحل مشاكلهم.', category: 'S', options: optSet() },
  { id: '5', text: 'أستمتع بقيادة الفرق وإقناع الآخرين بأفكاري.', category: 'E', options: optSet() },
  { id: '6', text: 'أحب العمل وفق أنظمة وإجراءات واضحة ومحددة.', category: 'C', options: optSet() },
  { id: '7', text: 'أفضّل العمل في البيئات التقنية والهندسية.', category: 'R', options: optSet() },
  { id: '8', text: 'يستهويني حل المسائل الرياضية والمنطقية المعقدة.', category: 'I', options: optSet() },
  { id: '9', text: 'أميل إلى تصور أفكار مبتكرة وتصاميم جديدة غير تقليدية.', category: 'A', options: optSet() },
  { id: '10', text: 'أشعر بالرضا عند المساهمة في تطوير مجتمعي أو فريقي.', category: 'S', options: optSet() },
  { id: '11', text: 'أستمتع بإطلاق المشاريع والتفاوض لتحقيق الأهداف.', category: 'E', options: optSet() },
  { id: '12', text: 'أجيد التعامل مع السجلات والبيانات والتفاصيل الدقيقة.', category: 'C', options: optSet() },
  { id: '13', text: 'أنجذب إلى الأعمال المتعلقة بالطبيعة والبيئة والآلات.', category: 'R', options: optSet() },
  { id: '14', text: 'أحب التساؤل والبحث عن تفسيرات للمظاهر الطبيعية.', category: 'I', options: optSet() },
  { id: '15', text: 'يُلهمني الأسلوب الإبداعي في التواصل مع الجماهير.', category: 'A', options: optSet() },
]

function optSet(): QuizQuestion['options'] {
  return [
    { label: 'لا أوافق بشدة', value: 1 },
    { label: 'لا أوافق', value: 2 },
    { label: 'محايد', value: 3 },
    { label: 'أوافق', value: 4 },
    { label: 'أوافق بشدة', value: 5 },
  ]
}

// ─── Career Paths per RIASEC ──────────────────────────────────

interface CareerPath {
  title: string
  description: string
  roles: string[]
  icon: string
  colors: [string, string]
}

const CAREER_PATHS: Record<RiasecType, CareerPath> = {
  R: {
    title: 'الواقعي / التقني',
    description: 'تتميز في العمل العملي والتقني. المهن اليدوية والهندسية تناسبك تماماً.',
    roles: ['مهندس ميكانيكي', 'كهربائي صناعي', 'تقني طبي', 'مصمم معماري', 'مطور أنظمة مدمجة'],
    icon: 'build',
    colors: ['#F97316', '#EA580C'],
  },
  I: {
    title: 'التحقيقي / البحثي',
    description: 'تحب التحليل والبحث العلمي. المهن الأكاديمية والعلمية مجالك.',
    roles: ['باحث علمي', 'طبيب', 'عالم بيانات', 'مختبر', 'مهندس برمجيات'],
    icon: 'flask',
    colors: ['#3B82F6', '#1D4ED8'],
  },
  A: {
    title: 'الفني / الإبداعي',
    description: 'موهبتك في الإبداع والابتكار. المهن الفنية والتصميمية تعكس شخصيتك.',
    roles: ['مصمم جرافيك', 'مخرج أفلام', 'كاتب محتوى', 'مصمم UX/UI', 'موسيقار'],
    icon: 'color-palette',
    colors: ['#8B5CF6', '#6D28D9'],
  },
  S: {
    title: 'الاجتماعي / الإنساني',
    description: 'لديك قدرة على التواصل ومساعدة الآخرين. قطاعات الرعاية والتعليم تنتظرك.',
    roles: ['معلم', 'أخصائي اجتماعي', 'طبيب نفسي', 'مستشار مهني', 'مدرب تطوير'],
    icon: 'people',
    colors: ['#10B981', '#059669'],
  },
  E: {
    title: 'الريادي / التنفيذي',
    description: 'شخصية قيادية وتفاوضية. عالم الأعمال والإدارة يحتاجك.',
    roles: ['مدير مشاريع', 'رائد أعمال', 'مستشار استراتيجي', 'مدير مبيعات', 'محامي'],
    icon: 'trending-up',
    colors: ['#F43F5E', '#BE123C'],
  },
  C: {
    title: 'التقليدي / التنظيمي',
    description: 'دقيق ومنظم بامتياز. القطاعات المالية والإدارية تحتاج مهاراتك.',
    roles: ['محاسب', 'محلل مالي', 'مدقق داخلي', 'مدير إداري', 'مسؤول امتثال'],
    icon: 'bar-chart',
    colors: ['#06B6D4', '#0284C7'],
  },
}

type Phase = 'intro' | 'quiz' | 'result'

export default function CareerQuizScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [topType, setTopType] = useState<RiasecType>('I')

  const slideAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  const animateIn = () => {
    slideAnim.setValue(width)
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }).start()
  }

  const updateProgress = (idx: number) => {
    Animated.timing(progressAnim, { toValue: idx / QUESTIONS.length, duration: 400, useNativeDriver: false }).start()
  }

  const answer = (value: number) => {
    const q = QUESTIONS[current]
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)

    if (current < QUESTIONS.length - 1) {
      animateIn()
      setCurrent((c) => c + 1)
      updateProgress(current + 1)
    } else {
      const scores: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
      QUESTIONS.forEach((q) => {
        scores[q.category] += newAnswers[q.id] ?? 3
      })
      const best = (Object.entries(scores) as [RiasecType, number][]).sort((a, b) => b[1] - a[1])[0][0]
      setTopType(best)
      setPhase('result')
    }
  }

  const q = QUESTIONS[current]
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
  const path = CAREER_PATHS[topType]

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.introHeader}>
          <Text style={styles.introHeaderTitle}>اكتشف مسارك المهني</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.introIllustration}>
            <Ionicons name="compass" size={80} color="rgba(255,255,255,0.9)" />
          </LinearGradient>

          <Text style={styles.introTitle}>تقييم RIASEC</Text>
          <Text style={styles.introSub}>
            15 سؤالاً مصمَّماً علمياً لاكتشاف شخصيتك المهنية وأنسب المسارات لك
          </Text>

          <View style={styles.introStats}>
            <IntroStat icon="time-outline" value="5 دقائق" label="متوسط الوقت" />
            <IntroStat icon="help-circle-outline" value="15 سؤال" label="عدد الأسئلة" />
            <IntroStat icon="ribbon-outline" value="6 مسارات" label="نتائج محتملة" />
          </View>

          <View style={styles.introBenefits}>
            {[
              'اعرف نوع الشخصية المهنية التي تمتلكها',
              'اكتشف 5 مهن تناسب طبيعتك',
              'احصل على توصيات تطوير مخصصة',
            ].map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.introFooter, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.startQuizBtn} onPress={() => { animateIn(); setPhase('quiz') }}>
            <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startQuizGrad}>
              <Text style={styles.startQuizText}>ابدأ التقييم</Text>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── Quiz ──
  if (phase === 'quiz') {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.quizHeader}>
          <View style={{ width: 40 }} />
          <Text style={styles.quizCounter}>{current + 1} / {QUESTIONS.length}</Text>
          <TouchableOpacity onPress={() => { if (current > 0) setCurrent((c) => c - 1); else setPhase('intro') }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        {/* Question card */}
        <View style={styles.quizBody}>
          <Animated.View style={[styles.qWrap, { transform: [{ translateX: slideAnim }] }]}>
            <View style={[styles.categoryTag, { backgroundColor: CAREER_PATHS[q.category].colors[0] + '22' }]}>
              <Ionicons name={CAREER_PATHS[q.category].icon as any} size={14} color={CAREER_PATHS[q.category].colors[0]} />
              <Text style={[styles.categoryTagText, { color: CAREER_PATHS[q.category].colors[0] }]}>
                {CAREER_PATHS[q.category].title}
              </Text>
            </View>
            <Text style={styles.qBodyText}>{q.text}</Text>
          </Animated.View>

          {/* Options */}
          <View style={styles.optionsWrap}>
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionBtn, selected && styles.optionBtnSelected]}
                  onPress={() => answer(opt.value)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionDot, selected && styles.optionDotSelected]}>
                    {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </View>
    )
  }

  // ── Result ──
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={path.colors} style={styles.resultHeader}>
        <View style={styles.resultHeaderContent}>
          <View style={styles.resultIconCircle}>
            <Ionicons name={path.icon as any} size={48} color="#fff" />
          </View>
          <Text style={styles.resultType}>{path.title}</Text>
          <Text style={styles.resultHeaderSub}>شخصيتك المهنية</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resultDescCard}>
          <Text style={styles.resultDescTitle}>ماذا يعني هذا؟</Text>
          <Text style={styles.resultDesc}>{path.description}</Text>
        </View>

        <Text style={styles.resultRolesTitle}>أنسب المهن لك</Text>
        {path.roles.map((role, i) => (
          <View key={i} style={styles.roleCard}>
            <LinearGradient colors={path.colors} style={styles.roleNum}>
              <Text style={styles.roleNumText}>{i + 1}</Text>
            </LinearGradient>
            <Text style={styles.roleText}>{role}</Text>
            <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
          </View>
        ))}

        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => { setAnswers({}); setCurrent(0); setPhase('intro') }}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
            <Text style={styles.retakeBtnText}>إعادة التقييم</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cvBtn}
            onPress={() => router.push('/(main)/cv/builder' as any)}
          >
            <LinearGradient colors={path.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cvBtnGrad}>
              <Text style={styles.cvBtnText}>ابنِ سيرتك الذاتية</Text>
              <Ionicons name="document-text" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

function IntroStat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.introStat}>
      <Ionicons name={icon as any} size={22} color={COLORS.primary} />
      <Text style={styles.introStatValue}>{value}</Text>
      <Text style={styles.introStatLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },

  // Intro
  introHeader: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  introHeaderTitle: { flex: 1, fontSize: FS.lg, fontFamily: FONT.bold, color: '#fff', textAlign: 'right' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  introContent: { padding: 24, paddingBottom: 40, alignItems: 'center' },
  introIllustration: { width: 150, height: 150, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 28, ...SHADOW.lg },
  introTitle: { fontSize: FS.h2, fontFamily: FONT.black, color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  introSub: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 28 },

  introStats: { flexDirection: 'row', gap: 16, marginBottom: 28 },
  introStat: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  introStatValue: { fontSize: FS.md, fontFamily: FONT.extrabold, color: COLORS.text },
  introStatLabel: { fontSize: FS.xs, fontFamily: FONT.regular, color: COLORS.textMuted, textAlign: 'center' },

  introBenefits: { width: '100%', gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'flex-end' },
  benefitText: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textSecondary },

  introFooter: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: COLORS.canvasAlt, borderTopWidth: 1, borderTopColor: COLORS.surfaceBorder },
  startQuizBtn: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  startQuizGrad: { height: 58, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  startQuizText: { fontSize: FS.xl, fontFamily: FONT.extrabold, color: '#fff' },

  // Quiz
  quizHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  quizCounter: { fontSize: FS.md, fontFamily: FONT.bold, color: '#fff' },

  progressWrap: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: COLORS.canvasAlt },
  progressTrack: { height: 6, backgroundColor: 'rgba(15,18,33,0.10)', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },

  quizBody: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  qWrap: { marginBottom: 28 },
  categoryTag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-end', marginBottom: 16 },
  categoryTagText: { fontSize: FS.sm, fontFamily: FONT.bold },
  qBodyText: { fontSize: FS.xl, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right', lineHeight: 32 },

  optionsWrap: { gap: 10 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'flex-end' },
  optionBtnSelected: { backgroundColor: 'rgba(79,70,229,0.2)', borderColor: COLORS.primary },
  optionDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'rgba(15,18,33,0.25)', justifyContent: 'center', alignItems: 'center' },
  optionDotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { flex: 1, fontSize: FS.md, fontFamily: FONT.medium, color: COLORS.textSecondary, textAlign: 'right' },
  optionTextSelected: { color: COLORS.text, fontWeight: '700', fontFamily: FONT.bold },

  // Result
  resultHeader: { paddingTop: 40, paddingBottom: 40, alignItems: 'center' },
  resultHeaderContent: { alignItems: 'center', gap: 12 },
  resultIconCircle: { width: 100, height: 100, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  resultType: { fontSize: FS.h2, fontFamily: FONT.black, color: '#fff' },
  resultHeaderSub: { fontSize: FS.md, fontFamily: FONT.regular, color: 'rgba(255,255,255,0.7)' },

  resultContent: { padding: 20, paddingBottom: 40 },
  resultDescCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, padding: 20, marginBottom: 24 },
  resultDescTitle: { fontSize: FS.lg, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right', marginBottom: 10 },
  resultDesc: { fontSize: FS.md, fontFamily: FONT.regular, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 24 },

  resultRolesTitle: { fontSize: FS.lg, fontFamily: FONT.bold, color: COLORS.text, textAlign: 'right', marginBottom: 14 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.surfaceBorder, borderRadius: RADIUS.xl, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, gap: 12 },
  roleNum: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  roleNumText: { fontSize: FS.md, fontFamily: FONT.extrabold, color: '#fff' },
  roleText: { flex: 1, fontSize: FS.md, fontFamily: FONT.semibold, color: COLORS.text, textAlign: 'right' },

  resultActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  retakeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: 14 },
  retakeBtnText: { fontSize: FS.md, fontFamily: FONT.bold, color: COLORS.primary },
  cvBtn: { flex: 2, borderRadius: RADIUS.xl, overflow: 'hidden' },
  cvBtnGrad: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14 },
  cvBtnText: { fontSize: FS.md, fontFamily: FONT.bold, color: '#fff' },
})
