import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

// ─── Demo content seed data ────────────────────────────────────────────────

interface SectionDef { title: string; lectures: { title: string; description?: string; youtubeId?: string; videoUrl?: string; duration?: number; isFree?: boolean }[] }

const DEMO_ITEMS: {
  type: 'COURSE' | 'VIDEO'
  titleAr: string
  description: string
  category: string
  duration: number
  isPublished: boolean
  createdBy: string
  meta: any
  sections?: SectionDef[]
}[] = [
  // ── مهارات مهنية ──────────────────────────────────────────────────────────
  {
    type: 'VIDEO' as const,
    titleAr: 'كيف تكتب CV احترافي يجذب أصحاب العمل',
    description: 'تعلّم كيفية كتابة سيرة ذاتية احترافية تميّزك عن الآخرين وتجذب انتباه مسؤولي التوظيف، مع نماذج عملية وأمثلة حقيقية.',
    category: 'مهارات مهنية',
    duration: 12,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'لماذا يُرفض CV معظم المتقدمين؟', description: 'الأخطاء الأكثر شيوعاً في السير الذاتية', duration: 4, isFree: true },
          { title: 'هيكل السيرة الذاتية المثالية', description: 'الأقسام الأساسية وكيفية ترتيبها احترافياً', duration: 5, isFree: true },
          { title: 'كلمات مفتاحية تضاعف فرصك بالقبول', description: 'تحسين CV لأنظمة ATS وفرق التوظيف', duration: 3, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'COURSE' as const,
    titleAr: 'إتقان مقابلات العمل: من الاستعداد إلى القبول',
    description: 'دورة شاملة تأخذك خطوة بخطوة من الاستعداد لمقابلة العمل حتى الحصول على العرض، مع تدريبات عملية ونصائح من خبراء التوظيف.',
    category: 'مهارات مهنية',
    duration: 78,
    isPublished: true,
    createdBy: 'demo',
    meta: {
      level: 'beginner',
      whatYouLearn: ['إعداد الإجابات المثالية للأسئلة الشائعة', 'أسلوب STAR للإجابة على أسئلة السلوكيات', 'لغة الجسد والمظهر الاحترافي', 'التفاوض على العرض الوظيفي بثقة'],
      requirements: ['رغبة في تطوير مهارات التواصل', 'لا يشترط خبرة مسبقة'],
    },
    sections: [
      {
        title: 'الاستعداد للمقابلة',
        lectures: [
          { title: 'أنواع مقابلات العمل وكيف تستعد لكل نوع', description: 'الفرق بين المقابلة الهاتفية والفيديو والحضورية', duration: 14, isFree: true },
          { title: 'الأسئلة الـ10 الأكثر شيوعاً وإجاباتها الذكية', description: 'كيف تجيب على "حدثني عن نفسك" و"ما أكبر نقاط ضعفك"', duration: 18, isFree: false },
          { title: 'أسلوب STAR: اجعل إجاباتك لا تُنسى', description: 'Situation, Task, Action, Result — طريقة الإجابة الاحترافية', duration: 12, isFree: false },
        ],
      },
      {
        title: 'أثناء المقابلة وما بعدها',
        lectures: [
          { title: 'لغة الجسد والانطباع الأول', description: 'المصافحة، التواصل البصري، الجلسة الصحيحة', duration: 10, isFree: false },
          { title: 'الأسئلة الذكية التي تسألها أنت للمحاور', description: 'كيف تُظهر اهتمامك وذكاءك في نهاية المقابلة', duration: 11, isFree: false },
          { title: 'التفاوض على الراتب والمزايا', description: 'كيف تحصل على أفضل عرض ممكن دون إحراج', duration: 13, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'VIDEO' as const,
    titleAr: 'فن التفاوض: كيف تحصل على ما تريد في بيئة العمل',
    description: 'مهارات التفاوض ليست موهبة فطرية بل علم يمكن تعلمه. تعرّف على أساليب التفاوض التي يستخدمها كبار المديرين التنفيذيين.',
    category: 'مهارات مهنية',
    duration: 10,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'مبادئ التفاوض الفعّال في بيئة العمل', description: 'الأسس النفسية والاستراتيجية للتفاوض', duration: 5, isFree: true },
          { title: 'أساليب التفاوض على الراتب والترقية', description: 'خطوات عملية للحصول على ما تستحقه', duration: 5, isFree: false },
        ],
      },
    ],
  },
  // ── تسويق رقمي ────────────────────────────────────────────────────────────
  {
    type: 'COURSE' as const,
    titleAr: 'التسويق الرقمي للمبتدئين: من الصفر للاحتراف',
    description: 'الدورة الشاملة التي ستحوّلك من مبتدئ إلى محترف في التسويق الرقمي، تشمل SEO وإعلانات Meta وGoogle Ads وتحليل البيانات.',
    category: 'تسويق رقمي',
    duration: 96,
    isPublished: true,
    createdBy: 'demo',
    meta: { level: 'beginner', whatYouLearn: ['أسس استراتيجية التسويق الرقمي', 'تحسين محركات البحث SEO', 'إدارة إعلانات Meta وGoogle Ads', 'تحليل البيانات وقياس الأداء'], requirements: ['لا يشترط خبرة سابقة', 'كمبيوتر وإنترنت'] },
    sections: [
      {
        title: 'أسس التسويق الرقمي',
        lectures: [
          { title: 'ما هو التسويق الرقمي ولماذا هو مستقبل الأعمال', description: 'نظرة شاملة على منظومة التسويق الرقمي', duration: 12, isFree: true },
          { title: 'تحسين محركات البحث SEO: الأساسيات', description: 'كيف تظهر موقعك في أول نتائج Google', duration: 18, isFree: false },
          { title: 'التسويق عبر السوشيال ميديا', description: 'استراتيجيات فعّالة لكل منصة', duration: 15, isFree: false },
        ],
      },
      {
        title: 'الإعلانات المدفوعة والتحليل',
        lectures: [
          { title: 'إعلانات Facebook وInstagram المدفوعة', description: 'حملات إعلانية تحقق ROI عالياً', duration: 17, isFree: false },
          { title: 'التسويق بالمحتوى وبناء العلامة التجارية', description: 'إنشاء محتوى يجذب العملاء ويبني الولاء', duration: 16, isFree: false },
          { title: 'تحليل البيانات بـ Google Analytics', description: 'قرارات مدعومة بالبيانات', duration: 13, isFree: false },
          { title: 'بناء حملتك التسويقية الكاملة: ورشة عمل', description: 'تطبيق عملي لكل ما تعلمته في الدورة', duration: 5, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'VIDEO' as const,
    titleAr: 'كيف تطلق إعلاناً ناجحاً على فيسبوك في 20 دقيقة',
    description: 'دليل خطوة بخطوة لإنشاء إعلان فيسبوك فعّال بميزانية محدودة، مع نصائح من خبراء الأداء الإعلاني.',
    category: 'تسويق رقمي',
    duration: 20,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'إعداد Business Manager والبكسل', description: 'الإعداد الأساسي قبل إطلاق أي إعلان', duration: 7, isFree: true },
          { title: 'اختيار الهدف والجمهور المناسب', description: 'استهداف العملاء المثاليين بدقة', duration: 8, isFree: true },
          { title: 'تصميم الإعلان وقياس النتائج', description: 'عناصر الإعلان الجذاب وكيف تقيس أداءه', duration: 5, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'VIDEO' as const,
    titleAr: 'استراتيجيات المحتوى الرقمي التي تفجّر المتابعين في 2026',
    description: 'تعرّف على أحدث استراتيجيات المحتوى التي تحقق انتشاراً عضوياً حقيقياً على كل المنصات، مع أمثلة من حسابات نمت بالآلاف.',
    category: 'تسويق رقمي',
    duration: 9,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'كيف تعمل خوارزمية 2026 وما يجب أن تعرفه', description: 'التغييرات الجوهرية في توزيع المحتوى', duration: 5, isFree: true },
          { title: 'أنواع المحتوى الأعلى أداءً حالياً', description: 'Reels, Carousels, Short-form video — ما الأفضل؟', duration: 4, isFree: false },
        ],
      },
    ],
  },
  // ── برمجة وتقنية ──────────────────────────────────────────────────────────
  {
    type: 'COURSE' as const,
    titleAr: 'الذكاء الاصطناعي للجميع: مقدمة عملية بلا تعقيدات',
    description: 'دورة مصمّمة لغير المتخصصين لفهم الذكاء الاصطناعي وتطبيقاته العملية في الحياة والعمل، دون الحاجة لأي خلفية برمجية.',
    category: 'برمجة وتقنية',
    duration: 65,
    isPublished: true,
    createdBy: 'demo',
    meta: { level: 'beginner', whatYouLearn: ['ما هو AI وكيف يعمل فعلاً', 'استخدام ChatGPT وأدوات AI في عملك', 'فرص العمل في مجال AI', 'أخلاقيات AI والمستقبل'], requirements: ['فضول وشغف بالتكنولوجيا', 'لا يشترط أي خلفية تقنية'] },
    sections: [
      {
        title: 'فهم الذكاء الاصطناعي',
        lectures: [
          { title: 'ما هو الذكاء الاصطناعي؟ شرح مبسّط للجميع', description: 'تعريف AI ومفاهيمه الأساسية بطريقة ممتعة', duration: 13, isFree: true },
          { title: 'ChatGPT وأدوات AI: دليل الاستخدام الاحترافي', description: 'كيف تستخدم AI لمضاعفة إنتاجيتك', duration: 18, isFree: false },
        ],
      },
      {
        title: 'التطبيق والمستقبل',
        lectures: [
          { title: 'AI في التسويق والمبيعات والتصميم', description: 'تطبيقات عملية في أبرز مجالات العمل', duration: 14, isFree: false },
          { title: 'مستقبل سوق العمل في عصر AI', description: 'الوظائف التي ستختفي والوظائف الجديدة الناشئة', duration: 11, isFree: false },
          { title: 'أخلاقيات الذكاء الاصطناعي وتحدياته', description: 'الجانب الآخر من AI الذي يجب أن تعرفه', duration: 9, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'VIDEO' as const,
    titleAr: 'أفضل 7 أدوات AI ستغيّر طريقة عملك للأبد',
    description: 'استعراض شامل لأقوى أدوات الذكاء الاصطناعي المتاحة حالياً مع شرح عملي لكيفية استخدام كل أداة لمضاعفة إنتاجيتك.',
    category: 'برمجة وتقنية',
    duration: 14,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'ChatGPT، Claude، Gemini: أيها يناسبك؟', description: 'مقارنة شاملة بين أبرز النماذج اللغوية', duration: 5, isFree: true },
          { title: 'أدوات AI للتصميم والصور والكتابة', description: 'Midjourney, DALL-E, Jasper وغيرها', duration: 5, isFree: false },
          { title: 'دمج AI في سير العمل اليومي', description: 'كيف تبني روتين عمل يعتمد على AI', duration: 4, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'COURSE' as const,
    titleAr: 'Python من الصفر: أكثر لغة برمجة مطلوبة في سوق العمل',
    description: 'دورة مكثّفة تأخذك من مطلق المبتدئ إلى بناء تطبيقات حقيقية، مع مشاريع عملية في تحليل البيانات والأتمتة.',
    category: 'برمجة وتقنية',
    duration: 112,
    isPublished: true,
    createdBy: 'demo',
    meta: { level: 'beginner', whatYouLearn: ['أساسيات Python: المتغيرات والحلقات والدوال', 'تحليل البيانات بـ Pandas', 'أتمتة المهام المتكررة', 'مشروع نهائي حقيقي'], requirements: ['لا تحتاج خلفية برمجية', 'جهاز كمبيوتر وإنترنت'] },
    sections: [
      {
        title: 'أساسيات Python',
        lectures: [
          { title: 'لماذا Python؟ وكيف تثبّته وتبدأ', description: 'البيئة البرمجية وأول سطر كود', duration: 14, isFree: true },
          { title: 'المتغيرات وأنواع البيانات والعمليات', description: 'اللبنات الأساسية لأي برنامج', duration: 18, isFree: false },
          { title: 'الشروط والحلقات: برمجة منطق التطبيقات', description: 'if/else, for, while — التحكم في تدفق البرنامج', duration: 16, isFree: false },
          { title: 'الدوال والوحدات: كود نظيف قابل لإعادة الاستخدام', description: 'تنظيم الكود بشكل احترافي', duration: 14, isFree: false },
        ],
      },
      {
        title: 'التطبيق والمشروع النهائي',
        lectures: [
          { title: 'تحليل البيانات بـ Pandas و NumPy', description: 'قراءة وتحليل ملفات Excel و CSV', duration: 22, isFree: false },
          { title: 'أتمتة المهام المتكررة', description: 'توفير ساعات من العمل اليومي بكود بسيط', duration: 16, isFree: false },
          { title: 'مشروع نهائي: تطبيق تحليل بيانات كامل', description: 'بناء مشروع حقيقي من الصفر', duration: 12, isFree: false },
        ],
      },
    ],
  },
  // ── إدارة أعمال ────────────────────────────────────────────────────────────
  {
    type: 'COURSE' as const,
    titleAr: 'ريادة الأعمال: ابدأ مشروعك الخاص في 30 يوماً',
    description: 'دليل عملي شامل لتحويل فكرتك إلى مشروع حقيقي، من التخطيط والتمويل إلى التسويق وبناء الفريق.',
    category: 'إدارة أعمال',
    duration: 84,
    isPublished: true,
    createdBy: 'demo',
    meta: { level: 'intermediate', whatYouLearn: ['التحقق من الفكرة التجارية قبل الاستثمار فيها', 'نموذج العمل Business Model Canvas', 'مصادر التمويل والاستثمار', 'بناء فريق العمل واختيار الشركاء'], requirements: ['فكرة مشروع ولو غير واضحة', 'رغبة حقيقية في ريادة الأعمال'] },
    sections: [
      {
        title: 'بناء الفكرة والنموذج',
        lectures: [
          { title: 'هل فكرتك تستحق؟ التحقق السريع من السوق', description: 'كيف تختبر فكرتك قبل إنفاق أي أموال', duration: 16, isFree: true },
          { title: 'نموذج العمل التجاري: رسم خارطة مشروعك', description: 'Business Model Canvas بالتفصيل', duration: 18, isFree: false },
          { title: 'التمويل: من المدخرات إلى رأس المال المخاطر', description: 'كل خيارات التمويل وكيف تختار المناسب', duration: 14, isFree: false },
        ],
      },
      {
        title: 'التنفيذ والنمو',
        lectures: [
          { title: 'بناء فريق أحلامك', description: 'كيف تجذب الكفاءات وتحافظ عليهم', duration: 12, isFree: false },
          { title: 'الانطلاق: MVP وخطة الـ90 يوم الأولى', description: 'الحد الأدنى من المنتج الصالح وخطة التنفيذ', duration: 15, isFree: false },
          { title: 'قياس النجاح: المؤشرات التي تهم فعلاً', description: 'KPIs وOKRs للمشاريع الناشئة', duration: 9, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'VIDEO' as const,
    titleAr: 'إدارة الوقت: 8 تقنيات لمضاعفة إنتاجيتك في ساعة واحدة',
    description: 'المدراء الناجحون لا يعملون أكثر — بل يعملون بذكاء أكبر. تعرّف على تقنيات إدارة الوقت التي تستخدمها قيادات الشركات الكبرى.',
    category: 'إدارة أعمال',
    duration: 11,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'لماذا نفقد الوقت وكيف نستعيده', description: 'الأسباب الحقيقية لضياع الوقت وليس الأعراض', duration: 4, isFree: true },
          { title: '8 تقنيات تحقق أقصى إنتاجية في أقل وقت', description: 'Pomodoro, Time Blocking, Eat the Frog وغيرها', duration: 7, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'VIDEO' as const,
    titleAr: 'مهارات القيادة: كيف تبني فريقاً يحقق نتائج استثنائية',
    description: 'القيادة الحقيقية ليست اللقب بل التأثير. تعلّم كيف يبني القادة الناجحون بيئة عمل محفّزة ويحققون أهدافاً طموحة.',
    category: 'إدارة أعمال',
    duration: 13,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'الفرق بين المدير والقائد', description: 'نظريات القيادة الحديثة وكيف تطبقها', duration: 5, isFree: true },
          { title: 'بناء الثقة وتحفيز الفريق', description: 'كيف تخلق بيئة يُبدع فيها فريقك', duration: 5, isFree: false },
          { title: 'إدارة النزاعات واتخاذ القرارات الصعبة', description: 'التعامل مع التحديات القيادية بحكمة', duration: 3, isFree: false },
        ],
      },
    ],
  },
  // ── تصميم إبداعي ──────────────────────────────────────────────────────────
  {
    type: 'VIDEO' as const,
    titleAr: 'تعلّم Canva كاملاً من الصفر: كل ما تحتاجه في 30 دقيقة',
    description: 'الدليل الشامل الذي سيجعلك محترفاً في Canva بعد مشاهدته مباشرةً، من أساسيات الواجهة إلى تصميمات احترافية جاهزة للنشر.',
    category: 'تصميم إبداعي',
    duration: 30,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'جولة في Canva: الواجهة والأدوات الأساسية', description: 'التعرف على الواجهة وإنشاء أول تصميم', duration: 8, isFree: true },
          { title: 'تصميم منشورات سوشيال ميديا احترافية', description: 'إنشاء تصاميم جذابة لفيسبوك وإنستغرام', duration: 10, isFree: true },
          { title: 'تصميم CV وعروض تقديمية مميزة', description: 'قوالب احترافية وكيفية تخصيصها', duration: 8, isFree: false },
          { title: 'نصائح المحترفين: اختصارات وحيل Canva', description: 'خدع وتقنيات تجعل تصاميمك أسرع وأجمل', duration: 4, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'COURSE' as const,
    titleAr: 'تصميم الهوية البصرية: بناء علامة تجارية لا تُنسى',
    description: 'تعلّم كيف يصمم المحترفون الهويات البصرية للعلامات التجارية، من اختيار الألوان والخطوط إلى بناء Brand Guidelines كاملة.',
    category: 'تصميم إبداعي',
    duration: 60,
    isPublished: true,
    createdBy: 'demo',
    meta: { level: 'intermediate', whatYouLearn: ['مبادئ التصميم الجرافيكي الأساسية', 'نظرية الألوان وعلم نفس الألوان في التسويق', 'تصميم الشعار Logo من الفكرة للتنفيذ', 'بناء Brand Guidelines كاملة'], requirements: ['معرفة أساسية بأي برنامج تصميم', 'Canva Pro أو Figma'] },
    sections: [
      {
        title: 'أسس التصميم',
        lectures: [
          { title: 'أسس الهوية البصرية: لماذا تهم؟', description: 'تأثير التصميم على قرارات الشراء والثقة', duration: 11, isFree: true },
          { title: 'نظرية الألوان: اختر الألوان الصحيحة لعلامتك', description: 'علم نفس الألوان وتطبيقه في التصميم التجاري', duration: 14, isFree: false },
          { title: 'Typography: الخطوط التي تتحدث دون كلمات', description: 'اختيار وتوظيف الخطوط بشكل احترافي', duration: 12, isFree: false },
        ],
      },
      {
        title: 'التطبيق والتوثيق',
        lectures: [
          { title: 'تصميم الشعار: من الورقة إلى الملف النهائي', description: 'مراحل تصميم شعار متكامل', duration: 18, isFree: false },
          { title: 'Brand Guidelines: دليل هويتك البصرية', description: 'توثيق هويتك البصرية لضمان الاتساق', duration: 5, isFree: false },
        ],
      },
    ],
  },
  {
    type: 'VIDEO' as const,
    titleAr: 'أسرار تصميم منشورات السوشيال ميديا التي تحقق أعلى تفاعل',
    description: 'ما الفرق بين منشور يُتجاهل وآخر ينتشر بالآلاف؟ تعرّف على المبادئ التصميمية التي يطبقها كبار المصممين على منصات التواصل.',
    category: 'تصميم إبداعي',
    duration: 8,
    isPublished: true,
    createdBy: 'demo',
    meta: {},
    sections: [
      {
        title: 'الحلقات',
        lectures: [
          { title: 'قواعد التصميم لكل منصة سوشيال ميديا', description: 'المقاسات والألوان والأنماط لكل منصة', duration: 4, isFree: true },
          { title: 'الـ Hook البصري الذي يوقف التمرير', description: 'ما يجعل المشاهد يتوقف عن التمرير ويتفاعل', duration: 4, isFree: false },
        ],
      },
    ],
  },
]

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    const userOnly = { role: 'USER' as const }

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      totalContent,
      publishedContent,
      totalActivities,
      activitiesThisWeek,
      recentUsers,
      recentActivities,
      contentByTypeRaw,
      genderRaw,
      governorateRaw,
      educationRaw,
      fieldOfStudyRaw,
    ] = await Promise.all([
      this.prisma.user.count({ where: userOnly }),
      this.prisma.user.count({ where: { ...userOnly, isActive: true } }),
      this.prisma.user.count({ where: { ...userOnly, createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { ...userOnly, createdAt: { gte: weekStart } } }),
      this.prisma.content.count(),
      this.prisma.content.count({ where: { isPublished: true } }),
      this.prisma.activity.count(),
      this.prisma.activity.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.user.findMany({
        where: userOnly,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, email: true } },
          content: { select: { id: true, title: true, titleAr: true } },
        },
      }),
      this.prisma.content.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      this.prisma.user.groupBy({
        by: ['gender'],
        _count: { id: true },
        where: { ...userOnly, gender: { not: null } },
      }),
      this.prisma.user.groupBy({
        by: ['governorate'],
        _count: { id: true },
        where: { ...userOnly, governorate: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.user.groupBy({
        by: ['education'],
        _count: { id: true },
        where: { ...userOnly, education: { not: null } },
      }),
      this.prisma.user.groupBy({
        by: ['fieldOfStudy'],
        _count: { id: true },
        where: { ...userOnly, fieldOfStudy: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ])

    // User growth: last 30 days
    const userGrowth = await this.getUserGrowth(30)

    // Top activities
    const topActivitiesRaw = await this.prisma.activity.groupBy({
      by: ['type'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    const topActivities = topActivitiesRaw.map((a) => ({
      type: a.type,
      count: a._count.id,
    }))

    const contentByType: Record<string, number> = {}
    for (const item of contentByTypeRaw) {
      contentByType[item.type] = item._count.id
    }

    const genderBreakdown = genderRaw.map((g) => ({
      label: g.gender as string,
      count: g._count.id,
    }))

    const governorateBreakdown = governorateRaw.map((g) => ({
      label: g.governorate as string,
      count: g._count.id,
    }))

    const educationBreakdown = educationRaw.map((e) => ({
      label: e.education as string,
      count: e._count.id,
    }))

    const fieldOfStudyBreakdown = fieldOfStudyRaw.map((f) => ({
      label: f.fieldOfStudy as string,
      count: f._count.id,
    }))

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      totalContent,
      publishedContent,
      totalActivities,
      activitiesThisWeek,
      topActivities,
      userGrowth,
      contentByType,
      recentUsers,
      recentActivities,
      genderBreakdown,
      governorateBreakdown,
      educationBreakdown,
      fieldOfStudyBreakdown,
    }
  }

  private async getUserGrowth(days: number) {
    const result: { date: string; count: number }[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await this.prisma.user.count({
        where: { role: 'USER', createdAt: { gte: date, lt: nextDate } },
      })

      result.push({
        date: date.toISOString().split('T')[0],
        count,
      })
    }

    return result
  }

  async seedDemoContent() {
    // Remove previously seeded demo content (cascades to sections/lectures)
    await this.prisma.content.deleteMany({ where: { createdBy: 'demo' } })

    const results: { id: string; titleAr: string; type: string; sections: number; lectures: number }[] = []

    for (const item of DEMO_ITEMS) {
      // Create content record
      const content = await this.prisma.content.create({
        data: {
          type: item.type,
          titleAr: item.titleAr,
          description: item.description,
          category: item.category,
          duration: item.duration,
          isPublished: item.isPublished,
          createdBy: item.createdBy,
          meta: item.meta,
        },
      })

      let totalLectures = 0

      // Create relational sections and lectures
      if (item.sections && item.sections.length > 0) {
        for (let si = 0; si < item.sections.length; si++) {
          const sectionDef = item.sections[si]
          const section = await this.prisma.courseSection.create({
            data: {
              contentId: content.id,
              title: sectionDef.title,
              order: si,
            },
          })

          for (let li = 0; li < sectionDef.lectures.length; li++) {
            const lec = sectionDef.lectures[li]
            await this.prisma.lecture.create({
              data: {
                sectionId: section.id,
                title: lec.title,
                description: lec.description,
                youtubeId: lec.youtubeId || null,
                videoUrl: lec.videoUrl || null,
                duration: lec.duration,
                isFree: lec.isFree ?? false,
                isPublished: true,
                order: li,
              },
            })
            totalLectures++
          }
        }
      }

      results.push({
        id: content.id,
        titleAr: content.titleAr,
        type: content.type,
        sections: item.sections?.length ?? 0,
        lectures: totalLectures,
      })
    }

    return {
      seeded: results.length,
      items: results,
    }
  }
}
