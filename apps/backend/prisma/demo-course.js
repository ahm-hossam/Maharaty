const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ADMIN_ID = 'cmrd7cmzu0000sefj6cfc4ike'

async function main() {
  console.log('🌱 Creating demo course...')

  // ── Create the course ──────────────────────────────────────────────────────
  const course = await prisma.content.create({
    data: {
      type: 'COURSE',
      title: 'Digital Marketing Mastery',
      titleAr: 'إتقان التسويق الرقمي: من الصفر إلى الاحتراف',
      description: 'دورة شاملة تأخذك من أساسيات التسويق الرقمي إلى تطبيقات متقدمة في إدارة الحملات الإعلانية وتحسين محركات البحث وإدارة وسائل التواصل الاجتماعي',
      category: 'تسويق رقمي',
      duration: 320,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      createdBy: ADMIN_ID,
    },
  })
  console.log('✅ Course:', course.titleAr)

  // ── Section 1: مقدمة في التسويق الرقمي ────────────────────────────────────
  const s1 = await prisma.courseSection.create({
    data: {
      contentId: course.id,
      title: 'مقدمة في التسويق الرقمي',
      order: 1,
    },
  })

  await prisma.lecture.createMany({
    data: [
      {
        sectionId: s1.id,
        title: 'ما هو التسويق الرقمي؟',
        description: 'تعرّف على مفهوم التسويق الرقمي وأهميته في عصر الإنترنت وكيف يختلف عن التسويق التقليدي',
        content: `<h2>ما هو التسويق الرقمي؟</h2>
<p>التسويق الرقمي هو مجموعة الأنشطة التسويقية التي تُنفَّذ عبر القنوات الرقمية كالإنترنت والهواتف الذكية وغيرها من الوسائط الرقمية.</p>
<h3>لماذا التسويق الرقمي؟</h3>
<ul>
<li>الوصول إلى جمهور واسع بتكلفة منخفضة</li>
<li>إمكانية قياس النتائج بدقة عالية</li>
<li>استهداف الجمهور المناسب في الوقت المناسب</li>
<li>التفاعل المباشر مع العملاء</li>
</ul>
<h3>قنوات التسويق الرقمي الرئيسية</h3>
<ul>
<li><strong>تحسين محركات البحث (SEO)</strong> — الظهور في نتائج البحث العضوية</li>
<li><strong>الإعلانات المدفوعة (PPC)</strong> — الإعلانات على Google وMeta</li>
<li><strong>وسائل التواصل الاجتماعي</strong> — إنستغرام، تيك توك، لينكدإن</li>
<li><strong>التسويق بالمحتوى</strong> — المدونات، الفيديوهات، البودكاست</li>
<li><strong>البريد الإلكتروني</strong> — أعلى عائد استثمار بين القنوات</li>
</ul>
<p>في هذه الدورة ستتعلم كيف تبني استراتيجية تسويق رقمي متكاملة خطوة بخطوة.</p>`,
        duration: 8,
        order: 1,
        isFree: true,
        isPublished: true,
      },
      {
        sectionId: s1.id,
        title: 'رحلة المستخدم وقمع المبيعات',
        description: 'تعلّم كيف يتخذ العميل قرار الشراء وكيف تصمم استراتيجيتك حول هذه الرحلة',
        videoUrl: 'https://www.youtube.com/watch?v=lC3_2W0xgxY',
        duration: 18,
        order: 2,
        isFree: true,
        isPublished: true,
      },
      {
        sectionId: s1.id,
        title: 'تحديد الجمهور المستهدف',
        description: 'كيف تبني شخصية المشتري (Buyer Persona) وتستهدف الجمهور الصحيح',
        content: `<h2>بناء شخصية المشتري (Buyer Persona)</h2>
<p>شخصية المشتري هي تمثيل شبه خيالي لعميلك المثالي مبني على بيانات حقيقية وأبحاث سوقية.</p>
<h3>المعلومات الأساسية التي تحتاجها</h3>
<ul>
<li><strong>الديموغرافيا:</strong> العمر، الجنس، الموقع، الدخل، المستوى التعليمي</li>
<li><strong>الاهتمامات:</strong> الهوايات، المواقع التي يزورها، الكتب التي يقرأها</li>
<li><strong>الأهداف والتحديات:</strong> ماذا يريد أن يحقق؟ ما الذي يعيقه؟</li>
<li><strong>سلوك الشراء:</strong> أين يشتري؟ كيف يتخذ القرار؟</li>
</ul>
<h3>أدوات بحث الجمهور</h3>
<ul>
<li>Google Analytics — تحليل زوار موقعك</li>
<li>Meta Audience Insights — بيانات مستخدمي فيسبوك</li>
<li>استطلاعات الرأي — سؤال العملاء مباشرة</li>
<li>تحليل المنافسين — من يستهدفون؟</li>
</ul>`,
        duration: 12,
        order: 3,
        isFree: false,
        isPublished: true,
      },
    ],
  })
  console.log('✅ Section 1 lectures created')

  // ── Section 2: تحسين محركات البحث ─────────────────────────────────────────
  const s2 = await prisma.courseSection.create({
    data: {
      contentId: course.id,
      title: 'تحسين محركات البحث (SEO)',
      order: 2,
    },
  })

  await prisma.lecture.createMany({
    data: [
      {
        sectionId: s2.id,
        title: 'أساسيات SEO وكيف تعمل محركات البحث',
        description: 'فهم آلية عمل Google وكيف تُحدّد ترتيب المواقع في نتائج البحث',
        videoUrl: 'https://www.youtube.com/watch?v=DvwS7cV9GmQ',
        duration: 22,
        order: 1,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s2.id,
        title: 'بحث الكلمات المفتاحية',
        description: 'كيف تجد الكلمات المفتاحية التي يبحث عنها جمهورك وتبني محتواك حولها',
        content: `<h2>بحث الكلمات المفتاحية: دليل شامل</h2>
<p>الكلمات المفتاحية هي جوهر أي استراتيجية SEO ناجحة. اختيار الكلمات الصحيحة يعني الظهور أمام الجمهور الصحيح.</p>
<h3>أنواع الكلمات المفتاحية</h3>
<ul>
<li><strong>كلمات رئيسية قصيرة (Short-tail):</strong> "تسويق رقمي" — حجم بحث عالٍ، منافسة شديدة</li>
<li><strong>كلمات ذيل طويل (Long-tail):</strong> "كيف أبدأ في التسويق الرقمي للمبتدئين" — منافسة أقل، نية شراء أعلى</li>
<li><strong>كلمات محلية:</strong> "شركة تسويق رقمي في الرياض"</li>
</ul>
<h3>أدوات البحث عن الكلمات المفتاحية</h3>
<ul>
<li><strong>Google Keyword Planner</strong> — مجاني، بيانات مباشرة من Google</li>
<li><strong>Ahrefs</strong> — الأشمل والأقوى (مدفوع)</li>
<li><strong>SEMrush</strong> — تحليل المنافسين بشكل رائع (مدفوع)</li>
<li><strong>Ubersuggest</strong> — خيار مجاني جيد للمبتدئين</li>
<li><strong>Google Trends</strong> — لمعرفة اتجاهات البحث</li>
</ul>
<h3>معايير اختيار الكلمة المفتاحية</h3>
<ul>
<li>حجم البحث الشهري (Search Volume)</li>
<li>صعوبة التنافس (Keyword Difficulty)</li>
<li>نية المستخدم (Search Intent)</li>
<li>مدى صلتها بمحتواك</li>
</ul>`,
        duration: 15,
        order: 2,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s2.id,
        title: 'تحسين الصفحات On-Page SEO',
        description: 'العوامل الداخلية التي تتحكم بها لتحسين ترتيب موقعك: العناوين، الوصف، المحتوى',
        videoUrl: 'https://www.youtube.com/watch?v=JE_UrVeVNdA',
        duration: 28,
        order: 3,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s2.id,
        title: 'بناء الروابط Off-Page SEO',
        description: 'استراتيجيات بناء الروابط الخارجية (Backlinks) لرفع مصداقية موقعك',
        videoUrl: 'https://www.youtube.com/watch?v=4FEsIFTcLFQ',
        duration: 20,
        order: 4,
        isFree: false,
        isPublished: true,
      },
    ],
  })
  console.log('✅ Section 2 lectures created')

  // ── Section 3: الإعلانات المدفوعة ─────────────────────────────────────────
  const s3 = await prisma.courseSection.create({
    data: {
      contentId: course.id,
      title: 'الإعلانات المدفوعة (PPC & Social Ads)',
      order: 3,
    },
  })

  await prisma.lecture.createMany({
    data: [
      {
        sectionId: s3.id,
        title: 'مقدمة في Google Ads',
        description: 'كيف تبدأ حملتك الإعلانية الأولى على Google وتستهدف العملاء في لحظة البحث',
        videoUrl: 'https://www.youtube.com/watch?v=lC3_2W0xgxY',
        duration: 30,
        order: 1,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s3.id,
        title: 'إعلانات فيسبوك وإنستغرام',
        description: 'إعداد حملات Meta Ads الاحترافية: الاستهداف، الميزانية، التصميم',
        videoUrl: 'https://www.youtube.com/watch?v=R4F3wMqmtSI',
        duration: 35,
        order: 2,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s3.id,
        title: 'قياس نتائج الحملات وتحسينها',
        description: 'المقاييس الأساسية (CTR, CPC, ROAS, CAC) وكيف تقرأها وتحسّن أداء حملاتك',
        content: `<h2>مقاييس الإعلانات الرقمية</h2>
<p>قياس الأداء هو ما يميز المسوّق المحترف عن المبتدئ. إليك أهم المقاييس التي يجب أن تفهمها.</p>
<h3>المقاييس الأساسية</h3>
<ul>
<li><strong>CTR (Click-Through Rate)</strong> — نسبة النقر إلى الظهور. معيار جودة إعلانك. CTR جيد = 2-5%</li>
<li><strong>CPC (Cost Per Click)</strong> — تكلفة كل نقرة. كلما قلّت مع الحفاظ على الجودة كلما أفضل</li>
<li><strong>CPM (Cost Per Mille)</strong> — تكلفة كل 1000 ظهور. مناسب لحملات الوعي بالعلامة التجارية</li>
<li><strong>Conversion Rate</strong> — نسبة من نقر فعلاً اشترى أو نفّذ الهدف</li>
<li><strong>ROAS (Return on Ad Spend)</strong> — عائد كل ريال أنفقته في الإعلانات. الهدف: 3x أو أعلى</li>
<li><strong>CAC (Customer Acquisition Cost)</strong> — تكلفة اكتساب عميل جديد. قارنها بـ LTV</li>
<li><strong>LTV (Lifetime Value)</strong> — القيمة الإجمالية للعميل طوال علاقته معك</li>
</ul>
<h3>كيف تحسّن حملاتك</h3>
<ul>
<li>اختبر أكثر من نسخة من الإعلان (A/B Testing)</li>
<li>راجع أداء الكلمات المفتاحية أسبوعياً</li>
<li>أوقف الإعلانات ذات CTR المنخفض</li>
<li>زد الميزانية على الإعلانات الرابحة تدريجياً</li>
<li>استخدم Retargeting لاستعادة الزوار</li>
</ul>`,
        duration: 25,
        order: 3,
        isFree: false,
        isPublished: true,
      },
    ],
  })
  console.log('✅ Section 3 lectures created')

  // ── Section 4: وسائل التواصل الاجتماعي ───────────────────────────────────
  const s4 = await prisma.courseSection.create({
    data: {
      contentId: course.id,
      title: 'إدارة وسائل التواصل الاجتماعي',
      order: 4,
    },
  })

  await prisma.lecture.createMany({
    data: [
      {
        sectionId: s4.id,
        title: 'استراتيجية المحتوى للسوشيال ميديا',
        description: 'كيف تبني خطة محتوى شهرية فعّالة تزيد من التفاعل والمتابعين',
        content: `<h2>بناء استراتيجية محتوى احترافية</h2>
<p>المحتوى الجيد ليس عشوائياً — إنه مخطط ومدروس ومصمم لتحقيق أهداف محددة.</p>
<h3>أنواع المحتوى التي تعمل على السوشيال ميديا</h3>
<ul>
<li><strong>المحتوى التعليمي (40%):</strong> نصائح، إرشادات، كيف تفعل X</li>
<li><strong>المحتوى الترفيهي (30%):</strong> مقاطع مضحكة، تحديات، قصص ملهمة</li>
<li><strong>المحتوى التسويقي (20%):</strong> عروض المنتجات، شهادات العملاء</li>
<li><strong>المحتوى التفاعلي (10%):</strong> استطلاعات، أسئلة، تحديات</li>
</ul>
<h3>قاعدة 80/20 في المحتوى</h3>
<p>80% من محتواك يجب أن يكون ذا قيمة للمتابع (تعليمي، ترفيهي، ملهم)، و20% فقط تسويقي مباشر.</p>
<h3>أفضل أوقات النشر</h3>
<ul>
<li><strong>إنستغرام:</strong> 6-9 مساءً، الأثنين-الأربعاء</li>
<li><strong>تيك توك:</strong> 7-9 مساءً، الثلاثاء-الجمعة</li>
<li><strong>لينكدإن:</strong> 8-10 صباحاً، الثلاثاء-الخميس</li>
<li><strong>تويتر/X:</strong> 9-11 صباحاً، الإثنين-الأربعاء</li>
</ul>`,
        duration: 18,
        order: 1,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s4.id,
        title: 'صناعة الريلز والفيديو القصير',
        description: 'أسرار صناعة المحتوى المرئي القصير الذي ينتشر ويحقق ملايين المشاهدات',
        videoUrl: 'https://www.youtube.com/watch?v=lC3_2W0xgxY',
        duration: 24,
        order: 2,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s4.id,
        title: 'تحليل الإحصاءات وقياس النمو',
        description: 'استخدام Analytics لفهم جمهورك وتحسين أداء حساباتك باستمرار',
        videoUrl: 'https://www.youtube.com/watch?v=R4F3wMqmtSI',
        duration: 20,
        order: 3,
        isFree: false,
        isPublished: true,
      },
    ],
  })
  console.log('✅ Section 4 lectures created')

  // ── Section 5: مشروع تطبيقي ────────────────────────────────────────────────
  const s5 = await prisma.courseSection.create({
    data: {
      contentId: course.id,
      title: 'مشروع تطبيقي: إطلاق حملة كاملة',
      order: 5,
    },
  })

  await prisma.lecture.createMany({
    data: [
      {
        sectionId: s5.id,
        title: 'تخطيط الحملة من الصفر',
        description: 'نطبّق كل ما تعلمناه في مشروع حقيقي: نختار المنتج، نحدد الجمهور، نرسم استراتيجية كاملة',
        content: `<h2>مشروع تطبيقي: إطلاق حملة تسويقية متكاملة</h2>
<p>في هذا المشروع ستطبّق كل ما تعلمته في الدورة على مثال حقيقي خطوة بخطوة.</p>
<h3>المنتج الافتراضي: تطبيق لتعلم اللغة الإنجليزية</h3>
<h3>خطوات المشروع</h3>
<ul>
<li><strong>الخطوة 1: تحليل السوق</strong> — من هم المنافسون؟ ما الفجوة التي يملؤها منتجك؟</li>
<li><strong>الخطوة 2: شخصية المشتري</strong> — أحمد، 22 سنة، طالب جامعي، يريد تحسين لغته للعمل</li>
<li><strong>الخطوة 3: اختيار القنوات</strong> — إنستغرام + تيك توك للوعي، Google Ads للتحويل</li>
<li><strong>الخطوة 4: خطة المحتوى</strong> — 3 منشورات أسبوعياً، محتوى تعليمي + قصص نجاح</li>
<li><strong>الخطوة 5: الميزانية</strong> — توزيع 5000 ريال على القنوات المختلفة</li>
<li><strong>الخطوة 6: مؤشرات النجاح</strong> — 1000 تنزيل خلال 30 يوم، تكلفة تنزيل أقل من 5 ريال</li>
</ul>
<h3>المهمة</h3>
<p>طبّق نفس الخطوات على منتج أو خدمة تختارها أنت، وأرسل خطتك التسويقية الكاملة للمراجعة.</p>`,
        duration: 30,
        order: 1,
        isFree: false,
        isPublished: true,
      },
      {
        sectionId: s5.id,
        title: 'إطلاق وتتبع الحملة',
        description: 'لحظة الإطلاق الفعلي: كيف تراقب الأداء في الـ 24 ساعة الأولى وتتخذ القرارات السريعة',
        videoUrl: 'https://www.youtube.com/watch?v=lC3_2W0xgxY',
        duration: 22,
        order: 2,
        isFree: false,
        isPublished: true,
      },
    ],
  })
  console.log('✅ Section 5 lectures created')

  // ── Count totals ───────────────────────────────────────────────────────────
  const lectureCount = await prisma.lecture.count({ where: { section: { contentId: course.id } } })
  const sectionCount = await prisma.courseSection.count({ where: { contentId: course.id } })

  console.log('')
  console.log('🎉 Demo course created successfully!')
  console.log(`   Course ID : ${course.id}`)
  console.log(`   Title     : ${course.titleAr}`)
  console.log(`   Sections  : ${sectionCount}`)
  console.log(`   Lectures  : ${lectureCount}`)
  console.log(`   Duration  : ~${course.duration} minutes`)
}

main()
  .catch(e => { console.error('❌ Failed:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
