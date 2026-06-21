export interface EvaluatorInput {
  questionId: string
  questionType: 'hr' | 'behavioral' | 'technical'
  transcript: string
  durationSec: number
}

export interface EvaluatorOutput {
  scores: { clarity: number; relevance: number; confidence: number; structure: number }
  overallScore: number
  green: string[]
  red: string[]
  amber: string[]
  badge: 'excellent' | 'good' | 'needs-work'
}

const FEEDBACK_BANK = {
  behavioral: {
    green: [
      ['استخدمت بنية STAR بشكل واضح ومنطقي', 'ذكرت نتيجة قابلة للقياس'],
      ['قدّمت مثالاً محدداً من تجربتك الفعلية', 'أظهرت قدرة على التأمل الذاتي'],
      ['وضحت دورك الشخصي في الموقف بدقة', 'ربطت الإجابة باحتياجات الوظيفة المستهدفة'],
    ],
    red: [
      ['الإجابة افتقرت لتفاصيل كافية عن النتيجة', 'لم تُحدد مسؤوليتك الشخصية بوضوح'],
      ['تحدثت عن "نحن" كثيراً دون إبراز دورك الفردي'],
      ['انتهت الإجابة دون توضيح ما تعلمته من التجربة'],
    ],
    amber: [
      ['أضف رقماً أو نسبة لقياس التحسن الذي حققته'],
      ['اذكر التحدي الذي واجهته بمزيد من التفصيل لإضفاء المصداقية'],
      ['أختصر المقدمة وانتقل مباشرة إلى الإجراءات التي اتخذتها'],
    ],
  },
  hr: {
    green: [
      ['إجابتك كانت صادقة وتعكس وعياً ذاتياً', 'ربطت نقاط قوتك بمتطلبات الوظيفة'],
      ['قدّمت صورة متوازنة عن نفسك بثقة ومهنية'],
      ['أظهرت فهماً جيداً لثقافة الشركة وقيمها'],
    ],
    red: [
      ['تجنب استخدام عبارات عامة جداً مثل "أنا شخص مجتهد"'],
      ['لم تُقدّم دليلاً ملموساً على ما ذكرته'],
      ['الإجابة كانت طويلة جداً مما قد يفقد انتباه المحاور'],
    ],
    amber: [
      ['أضف مثالاً واحداً سريعاً يدعم ما قلته'],
      ['اختم بجملة تربط نقطة قوتك بما ستضيفه للفريق'],
      ['ابدأ بالأهم: ما الذي تجيده أكثر من غيره؟'],
    ],
  },
  technical: {
    green: [
      ['وضّحت المفهوم التقني بدقة ووضوح', 'أعطيت مثالاً تطبيقياً مناسباً'],
      ['أظهرت معرفة عميقة بالأدوات المذكورة'],
      ['ربطت المعرفة النظرية بتجربة عملية حقيقية'],
    ],
    red: [
      ['تجنب الاعتماد على المصطلحات التقنية فقط دون شرح'],
      ['لم تتطرق إلى حالات الاستخدام الفعلية'],
      ['كان بإمكانك توضيح الفارق بين الخيارات المختلفة'],
    ],
    amber: [
      ['أذكر تجربتك الشخصية مع هذه التقنية بإيجاز'],
      ['قارن هذا الحل ببديل آخر لإظهار عمق فهمك'],
      ['اذكر أي قيود أو عيوب معروفة في الأسلوب الذي ذكرته'],
    ],
  },
}

function score(base: number, delta: number): number {
  return Math.min(100, Math.max(0, base + delta))
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function evaluateAnswer(input: EvaluatorInput): Promise<EvaluatorOutput> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 1800 + Math.random() * 800))

  const { transcript, durationSec, questionType } = input
  const wordCount = transcript.trim().split(/\s+/).length
  const bank = FEEDBACK_BANK[questionType]

  // Scoring logic
  const hasStar = /situation|action|result|موقف|إجراء|نتيجة/i.test(transcript)
  const hasNumbers = /\d+%|\d+ مليون|نسبة|\d+ أشخاص/.test(transcript)
  const tooShort = durationSec < 20
  const tooLong = durationSec > 120
  const idealLength = durationSec >= 30 && durationSec <= 90

  const clarity    = score(68, wordCount > 50 ? 12 : -8)
  const relevance  = score(65, hasStar ? 18 : wordCount > 30 ? 8 : -5)
  const confidence = score(70, idealLength ? 12 : tooShort ? -15 : -8)
  const structure  = score(62, hasStar ? 22 : hasNumbers ? 10 : 0)

  const overallScore = Math.round((clarity + relevance + confidence + structure) / 4)

  const feedbackIndex = overallScore > 80 ? 0 : overallScore > 65 ? 1 : 2
  const green = [...pickRandom(bank.green)]
  const red: string[] = []
  const amber: string[] = [...pickRandom(bank.amber)]

  if (overallScore < 85) red.push(...pickRandom(bank.red))
  if (tooShort) red.push('إجابتك كانت قصيرة جداً — حاول التوسع في التفاصيل')
  if (tooLong) amber.push('حاول أن تضغط إجابتك في أقل من دقيقتين')
  if (hasNumbers) green.push('ممتاز — استخدمت أرقاماً لدعم إجابتك')

  const badge = overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : 'needs-work'

  return { scores: { clarity, relevance, confidence, structure }, overallScore, green, red, amber, badge }
}

// ─── CV AI Assist ────────────────────────────────────────────

export interface CvSuggestion {
  id: string
  text: string
  type: 'achievement' | 'skill' | 'summary'
}

const ACHIEVEMENT_TEMPLATES = [
  (role: string) => `قدت مبادرة في ${role} أسهمت في تحسين الإنتاجية بنسبة تجاوزت 30%`,
  (role: string) => `طوّرت حلاً مبتكراً ضمن فريق ${role} أوجد وفوراً ملموساً في الوقت والموارد`,
  (role: string) => `أنجزت مشاريع ${role} ضمن الجدول الزمني المحدد مع الحفاظ على أعلى معايير الجودة`,
]

const SUMMARY_TEMPLATES = [
  (target: string) => `محترف متميز يسعى لتحقيق التأثير في مجال ${target}، يمتلك خبرة عملية وشغفاً حقيقياً بالتطور المستمر.`,
  (target: string) => `متخصص في ${target} يجمع بين الخبرة التقنية ومهارات التواصل الفعّال لإحداث فارق حقيقي في أي بيئة عمل.`,
  (target: string) => `قائد بالفطرة في مجال ${target}، يتميز بالقدرة على حل التحديات المعقدة وبناء علاقات مهنية قوية.`,
]

export async function getCvSuggestions(params: {
  fieldType: 'bullet' | 'summary'
  currentText: string
  jobTarget?: string
  role?: string
}): Promise<CvSuggestion[]> {
  await new Promise(r => setTimeout(r, 900 + Math.random() * 600))

  const role = params.role ?? 'مجالك'
  const target = params.jobTarget ?? 'مجالك المهني'

  if (params.fieldType === 'summary') {
    return SUMMARY_TEMPLATES.map((fn, i) => ({
      id: `sum-${i}`,
      text: fn(target),
      type: 'summary' as const,
    }))
  }

  return ACHIEVEMENT_TEMPLATES.map((fn, i) => ({
    id: `ach-${i}`,
    text: fn(role),
    type: 'achievement' as const,
  }))
}
