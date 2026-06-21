import { PrismaClient } from '@prisma/client'
import { Role, ContentType, ActivityType } from '../src/common/enums'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ---------------------------------------------------------------------------
  // 1. Super Admin
  // ---------------------------------------------------------------------------
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maharaty.com' },
    update: {},
    create: {
      name: 'مهاراتي أدمن',
      email: 'admin@maharaty.com',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  })
  console.log(`Created admin: ${admin.email}`)

  // ---------------------------------------------------------------------------
  // 2. Sample users
  // ---------------------------------------------------------------------------
  const sampleUsers = [
    { name: 'أحمد محمد الشهري', email: 'ahmed@example.com' },
    { name: 'فاطمة علي الزهراني', email: 'fatima@example.com' },
    { name: 'محمد عبدالله القحطاني', email: 'mohammed@example.com' },
    { name: 'نورة سعد العتيبي', email: 'noura@example.com' },
    { name: 'خالد إبراهيم الدوسري', email: 'khaled@example.com' },
  ]

  const userPassword = await bcrypt.hash('password123', 10)
  const createdUsers: any[] = []

  for (const u of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: userPassword, role: Role.USER },
    })
    createdUsers.push(user)
    console.log(`Created user: ${user.email}`)
  }

  // ---------------------------------------------------------------------------
  // 3. Skill Category + Skills (needed for Content seed FK)
  // ---------------------------------------------------------------------------
  const techCategory = await prisma.skillCategory.upsert({
    where: { id: 'cat-tech' },
    update: {},
    create: { id: 'cat-tech', name: 'Technology', nameAr: 'تقنية', icon: '💻' },
  })

  const designCategory = await prisma.skillCategory.upsert({
    where: { id: 'cat-design' },
    update: {},
    create: { id: 'cat-design', name: 'Design', nameAr: 'تصميم', icon: '🎨' },
  })

  const mgmtCategory = await prisma.skillCategory.upsert({
    where: { id: 'cat-mgmt' },
    update: {},
    create: { id: 'cat-mgmt', name: 'Management', nameAr: 'إدارة', icon: '📊' },
  })

  // ---------------------------------------------------------------------------
  // 4. Sample Content (10 items)
  // ---------------------------------------------------------------------------
  const contentItems = [
    {
      id: 'content-1',
      type: ContentType.COURSE,
      title: 'JavaScript Fundamentals',
      titleAr: 'أساسيات جافاسكريبت',
      description: 'Learn the core concepts of JavaScript from scratch',
      category: 'برمجة',
      duration: 120,
      isPublished: true,
      thumbnail: 'https://via.placeholder.com/400x225?text=JS',
    },
    {
      id: 'content-2',
      type: ContentType.COURSE,
      title: 'React & Next.js Complete Guide',
      titleAr: 'دليل React و Next.js الشامل',
      description: 'Build modern web applications with React and Next.js',
      category: 'برمجة',
      duration: 240,
      isPublished: true,
      thumbnail: 'https://via.placeholder.com/400x225?text=React',
    },
    {
      id: 'content-3',
      type: ContentType.VIDEO,
      title: 'UI/UX Design Principles',
      titleAr: 'مبادئ تصميم واجهات المستخدم',
      description: 'Master the fundamentals of UI/UX design',
      category: 'تصميم',
      duration: 45,
      isPublished: true,
      url: 'https://www.youtube.com/watch?v=example',
      thumbnail: 'https://via.placeholder.com/400x225?text=UX',
    },
    {
      id: 'content-4',
      type: ContentType.ARTICLE,
      title: 'Project Management Best Practices',
      titleAr: 'أفضل ممارسات إدارة المشاريع',
      description: 'Learn how to manage projects effectively using agile methodologies',
      category: 'إدارة',
      isPublished: true,
      url: 'https://example.com/article/pm-best-practices',
    },
    {
      id: 'content-5',
      type: ContentType.COURSE,
      title: 'Python for Data Science',
      titleAr: 'بايثون لعلم البيانات',
      description: 'Analyze and visualize data using Python',
      category: 'برمجة',
      duration: 180,
      isPublished: true,
      thumbnail: 'https://via.placeholder.com/400x225?text=Python',
    },
    {
      id: 'content-6',
      type: ContentType.VIDEO,
      title: 'Figma for Beginners',
      titleAr: 'فيجما للمبتدئين',
      description: 'Create stunning designs with Figma',
      category: 'تصميم',
      duration: 60,
      isPublished: true,
      url: 'https://www.youtube.com/watch?v=example2',
    },
    {
      id: 'content-7',
      type: ContentType.ARTICLE,
      title: 'Soft Skills for Career Success',
      titleAr: 'المهارات الناعمة للنجاح المهني',
      description: 'Develop communication, leadership, and teamwork skills',
      category: 'تطوير شخصي',
      isPublished: true,
    },
    {
      id: 'content-8',
      type: ContentType.COURSE,
      title: 'Digital Marketing Fundamentals',
      titleAr: 'أساسيات التسويق الرقمي',
      description: 'Learn SEO, social media marketing, and paid advertising',
      category: 'تسويق',
      duration: 90,
      isPublished: false,
      thumbnail: 'https://via.placeholder.com/400x225?text=Marketing',
    },
    {
      id: 'content-9',
      type: ContentType.VIDEO,
      title: 'Excel Advanced Techniques',
      titleAr: 'تقنيات Excel المتقدمة',
      description: 'Master Excel for data analysis and reporting',
      category: 'إدارة',
      duration: 75,
      isPublished: true,
      url: 'https://www.youtube.com/watch?v=example3',
    },
    {
      id: 'content-10',
      type: ContentType.COURSE,
      title: 'Machine Learning Basics',
      titleAr: 'أساسيات تعلم الآلة',
      description: 'Introduction to machine learning concepts and algorithms',
      category: 'برمجة',
      duration: 300,
      isPublished: true,
      thumbnail: 'https://via.placeholder.com/400x225?text=ML',
    },
  ]

  const createdContent: any[] = []
  for (const item of contentItems) {
    const content = await prisma.content.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, createdBy: admin.id },
    })
    createdContent.push(content)
    console.log(`Created content: ${content.titleAr}`)
  }

  // ---------------------------------------------------------------------------
  // 5. Content Progress for sample users
  // ---------------------------------------------------------------------------
  const progressData = [
    { userId: createdUsers[0].id, contentId: createdContent[0].id, progress: 100 },
    { userId: createdUsers[0].id, contentId: createdContent[1].id, progress: 60 },
    { userId: createdUsers[1].id, contentId: createdContent[0].id, progress: 45 },
    { userId: createdUsers[1].id, contentId: createdContent[2].id, progress: 100 },
    { userId: createdUsers[2].id, contentId: createdContent[4].id, progress: 80 },
    { userId: createdUsers[3].id, contentId: createdContent[3].id, progress: 30 },
  ]

  for (const p of progressData) {
    await prisma.contentProgress.upsert({
      where: { userId_contentId: { userId: p.userId, contentId: p.contentId } },
      update: {},
      create: {
        ...p,
        completedAt: p.progress >= 100 ? new Date() : null,
      },
    })
  }
  console.log(`Created ${progressData.length} content progress records`)

  // ---------------------------------------------------------------------------
  // 6. Activities
  // ---------------------------------------------------------------------------
  const activities = [
    { userId: createdUsers[0].id, type: ActivityType.REGISTER },
    { userId: createdUsers[0].id, type: ActivityType.LOGIN },
    { userId: createdUsers[0].id, type: ActivityType.VIEW_COURSE, contentId: createdContent[0].id },
    { userId: createdUsers[0].id, type: ActivityType.COMPLETE_COURSE, contentId: createdContent[0].id },
    { userId: createdUsers[1].id, type: ActivityType.REGISTER },
    { userId: createdUsers[1].id, type: ActivityType.LOGIN },
    { userId: createdUsers[1].id, type: ActivityType.START_ASSESSMENT },
    { userId: createdUsers[2].id, type: ActivityType.REGISTER },
    { userId: createdUsers[2].id, type: ActivityType.BUILD_CV },
    { userId: createdUsers[3].id, type: ActivityType.REGISTER },
    { userId: createdUsers[3].id, type: ActivityType.PRACTICE_INTERVIEW },
    { userId: createdUsers[4].id, type: ActivityType.REGISTER },
    { userId: createdUsers[4].id, type: ActivityType.VIEW_JOBS },
  ]

  for (const a of activities) {
    await prisma.activity.create({ data: a })
  }
  console.log(`Created ${activities.length} activities`)

  // ---------------------------------------------------------------------------
  // 7. Notifications
  // ---------------------------------------------------------------------------
  const notifications = [
    {
      userId: createdUsers[0].id,
      title: 'مرحباً بك في مهاراتي',
      body: 'ابدأ رحلتك التعليمية اليوم واكتشف مهاراتك',
      type: 'in-app',
    },
    {
      userId: createdUsers[0].id,
      title: 'لقد أكملت دورة JavaScript',
      body: 'تهانينا! لقد أكملت دورة أساسيات جافاسكريبت بنجاح',
      type: 'in-app',
      isRead: true,
    },
    {
      userId: createdUsers[1].id,
      title: 'دورة جديدة متاحة',
      body: 'تم إضافة دورة React و Next.js الشامل — ابدأ التعلم الآن',
      type: 'in-app',
    },
    {
      userId: createdUsers[2].id,
      title: 'أكمل ملفك الشخصي',
      body: 'أضف مهاراتك وخبراتك لتحسين فرصك المهنية',
      type: 'in-app',
    },
  ]

  for (const n of notifications) {
    await prisma.notification.create({ data: n })
  }
  console.log(`Created ${notifications.length} notifications`)

  console.log('✅ Seed completed successfully!')
  console.log('---')
  console.log('Admin login: admin@maharaty.com / admin123')
  console.log('User login:  ahmed@example.com / password123')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
