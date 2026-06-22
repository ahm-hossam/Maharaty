import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { SubmitResultDto } from './dto/submit-result.dto'

const DEFAULT_QUESTIONS = [
  { textAr: 'أستمتع بتنفيذ مشاريع تقنية أو يدوية ملموسة وأقيس تقدمي بنتائج واضحة.', category: 'R', dimensionLabel: 'البراعة التنفيذية', orderIndex: 1 },
  { textAr: 'أتميز في تحليل البيانات والمعلومات المعقدة للوصول إلى استنتاجات دقيقة.', category: 'I', dimensionLabel: 'التفكير التحليلي', orderIndex: 2 },
  { textAr: 'لديّ قدرة على ابتكار حلول وأساليب غير تقليدية في بيئة العمل.', category: 'A', dimensionLabel: 'الإبداع والابتكار', orderIndex: 3 },
  { textAr: 'أتميز في بناء علاقات مهنية وأجد رضاً حقيقياً في دعم نمو الفريق.', category: 'S', dimensionLabel: 'الكفاءة التواصلية', orderIndex: 4 },
  { textAr: 'أستطيع قيادة مبادرات، اتخاذ قرارات صعبة، وإقناع الآخرين بالرؤية الاستراتيجية.', category: 'E', dimensionLabel: 'الكفاءة القيادية', orderIndex: 5 },
  { textAr: 'أُجيد إدارة المهام بدقة وفق إجراءات موثقة مع الحفاظ على جودة عالية.', category: 'C', dimensionLabel: 'الدقة التنظيمية', orderIndex: 6 },
  { textAr: 'لديّ خلفية تقنية أو هندسية أعتمد عليها في بيئة العمل.', category: 'R', dimensionLabel: 'البراعة التنفيذية', orderIndex: 7 },
  { textAr: 'أقضي وقتاً في البحث واستكشاف أسباب المشكلات قبل اقتراح الحلول.', category: 'I', dimensionLabel: 'التفكير التحليلي', orderIndex: 8 },
  { textAr: 'أجد نفسي منجذباً للوظائف التي تتيح مساحة للتعبير والتجريب.', category: 'A', dimensionLabel: 'الإبداع والابتكار', orderIndex: 9 },
  { textAr: 'أُسهم في رفع الروح المعنوية وأحل النزاعات داخل الفريق بفاعلية.', category: 'S', dimensionLabel: 'الكفاءة التواصلية', orderIndex: 10 },
  { textAr: 'أستطيع تحديد فرص النمو وتنفيذ خطط عمل واضحة لتحقيقها.', category: 'E', dimensionLabel: 'الكفاءة القيادية', orderIndex: 11 },
  { textAr: 'أُتقن توثيق العمليات والتعامل مع الأرقام والتقارير بدقة.', category: 'C', dimensionLabel: 'الدقة التنظيمية', orderIndex: 12 },
  { textAr: 'أستمتع بالعمل في مشاريع تشترط التعامل مع الأدوات، الأنظمة، أو البيئات المادية.', category: 'R', dimensionLabel: 'البراعة التنفيذية', orderIndex: 13 },
  { textAr: 'يجذبني العمل في مجالات تتطلب فهماً عميقاً للعلوم أو التقنية.', category: 'I', dimensionLabel: 'التفكير التحليلي', orderIndex: 14 },
  { textAr: 'أُقدّر المرونة في بيئة العمل وأشعر بأفضل أداء عندما تتاح لي حرية الإبداع.', category: 'A', dimensionLabel: 'الإبداع والابتكار', orderIndex: 15 },
]

@Injectable()
export class SelfAssessmentService {
  constructor(private prisma: PrismaService) {}

  async findAllQuestions() {
    return this.prisma.selfAssessmentQuestion.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    })
  }

  async findAllQuestionsAdmin() {
    return this.prisma.selfAssessmentQuestion.findMany({
      orderBy: { orderIndex: 'asc' },
    })
  }

  async createQuestion(dto: CreateQuestionDto) {
    const count = await this.prisma.selfAssessmentQuestion.count()
    return this.prisma.selfAssessmentQuestion.create({
      data: {
        textAr: dto.textAr,
        category: dto.category,
        dimensionLabel: dto.dimensionLabel,
        orderIndex: dto.orderIndex ?? count + 1,
        isActive: dto.isActive ?? true,
      },
    })
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const q = await this.prisma.selfAssessmentQuestion.findUnique({ where: { id } })
    if (!q) throw new NotFoundException('Question not found')
    return this.prisma.selfAssessmentQuestion.update({ where: { id }, data: dto })
  }

  async deleteQuestion(id: string) {
    const q = await this.prisma.selfAssessmentQuestion.findUnique({ where: { id } })
    if (!q) throw new NotFoundException('Question not found')
    await this.prisma.selfAssessmentQuestion.delete({ where: { id } })
  }

  async submitResult(dto: SubmitResultDto, userId: string) {
    return this.prisma.selfAssessmentResult.create({
      data: { userId, topType: dto.topType, scores: dto.scores },
    })
  }

  async getMyResults(userId: string) {
    return this.prisma.selfAssessmentResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  }

  async seedDefaultQuestions() {
    const count = await this.prisma.selfAssessmentQuestion.count()
    if (count > 0) return { seeded: 0, message: 'Questions already exist' }
    await this.prisma.selfAssessmentQuestion.createMany({ data: DEFAULT_QUESTIONS })
    return { seeded: DEFAULT_QUESTIONS.length, message: 'Default questions imported' }
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.selfAssessmentQuestion.count(),
      this.prisma.selfAssessmentQuestion.count({ where: { isActive: true } }),
    ])
    const results = await this.prisma.selfAssessmentResult.count()
    return { total, active, results }
  }
}
