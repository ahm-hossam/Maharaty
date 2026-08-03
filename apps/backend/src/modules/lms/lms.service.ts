import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateSectionDto } from './dto/create-section.dto'
import { CreateLectureDto } from './dto/create-lecture.dto'
import { UpdateLectureProgressDto } from './dto/update-lecture-progress.dto'
import { ReorderDto } from './dto/reorder.dto'

const SECTION_INCLUDE = {
  lectures: { orderBy: { order: 'asc' as const } },
}

@Injectable()
export class LmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Curriculum ──────────────────────────────────────────────────────────────

  async getCurriculum(contentId: string, userRole = 'USER') {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole)

    const item = await this.prisma.content.findUnique({
      where: { id: contentId, ...(isAdmin ? {} : { isPublished: true }) },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: SECTION_INCLUDE,
        },
      },
    })
    if (!item) throw new NotFoundException('Content not found')

    if (isAdmin) return item

    // Strip media fields from locked (non-free) lectures for regular users
    return {
      ...item,
      sections: item.sections.map((section) => ({
        ...section,
        lectures: section.lectures.map((lecture) => {
          if (lecture.isFree) return lecture
          const { videoUrl: _v, youtubeId: _y, content: _c, attachments: _a, ...meta } = lecture
          return meta
        }),
      })),
    }
  }

  // ─── Sections ────────────────────────────────────────────────────────────────

  async createSection(contentId: string, dto: CreateSectionDto) {
    await this.assertContent(contentId)

    const last = await this.prisma.courseSection.findFirst({
      where: { contentId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const order = dto.order ?? (last ? last.order + 1 : 0)

    return this.prisma.courseSection.create({
      data: { contentId, title: dto.title, order },
      include: SECTION_INCLUDE,
    })
  }

  async updateSection(sectionId: string, dto: Partial<CreateSectionDto>) {
    await this.assertSection(sectionId)
    return this.prisma.courseSection.update({
      where: { id: sectionId },
      data: dto,
      include: SECTION_INCLUDE,
    })
  }

  async deleteSection(sectionId: string) {
    await this.assertSection(sectionId)
    await this.prisma.courseSection.delete({ where: { id: sectionId } })
    return { deleted: true }
  }

  async reorderSections(contentId: string, dto: ReorderDto) {
    await Promise.all(
      dto.items.map(({ id, order }) =>
        this.prisma.courseSection.update({ where: { id }, data: { order } }),
      ),
    )
    return this.getCurriculum(contentId)
  }

  // ─── Lectures ─────────────────────────────────────────────────────────────────

  async createLecture(sectionId: string, dto: CreateLectureDto) {
    await this.assertSection(sectionId)

    const last = await this.prisma.lecture.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const order = dto.order ?? (last ? last.order + 1 : 0)

    return this.prisma.lecture.create({ data: { sectionId, ...dto, order } })
  }

  async updateLecture(lectureId: string, dto: Partial<CreateLectureDto>) {
    await this.assertLecture(lectureId)
    return this.prisma.lecture.update({ where: { id: lectureId }, data: dto })
  }

  async deleteLecture(lectureId: string) {
    await this.assertLecture(lectureId)
    await this.prisma.lecture.delete({ where: { id: lectureId } })
    return { deleted: true }
  }

  async reorderLectures(sectionId: string, dto: ReorderDto) {
    await Promise.all(
      dto.items.map(({ id, order }) =>
        this.prisma.lecture.update({ where: { id }, data: { order } }),
      ),
    )
    return this.prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: SECTION_INCLUDE,
    })
  }

  // ─── Progress ─────────────────────────────────────────────────────────────────

  async updateProgress(userId: string, lectureId: string, dto: UpdateLectureProgressDto) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId },
      select: { duration: true },
    })
    if (!lecture) throw new NotFoundException('Lecture not found')

    // Auto-complete if watched ≥ 90% of duration
    const isCompleted =
      dto.isCompleted ??
      (lecture.duration ? dto.watchedSeconds >= lecture.duration * 60 * 0.9 : false)

    return this.prisma.lectureProgress.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      update: {
        watchedSeconds: dto.watchedSeconds,
        isCompleted,
        updatedAt: new Date(),
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
      create: {
        userId,
        lectureId,
        watchedSeconds: dto.watchedSeconds,
        isCompleted,
        updatedAt: new Date(),
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
    })
  }

  async getUserProgress(userId: string, contentId: string) {
    const curriculum = await this.getCurriculum(contentId)
    const lectureIds = curriculum.sections.flatMap((s) => s.lectures.map((l) => l.id))

    const progress = await this.prisma.lectureProgress.findMany({
      where: { userId, lectureId: { in: lectureIds } },
    })

    const totalLectures = lectureIds.length
    const completedLectures = progress.filter((p) => p.isCompleted).length
    const progressPercent = totalLectures
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0

    return {
      totalLectures,
      completedLectures,
      progressPercent,
      lectureProgress: Object.fromEntries(progress.map((p) => [p.lectureId, p])),
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async assertContent(contentId: string) {
    const c = await this.prisma.content.findUnique({ where: { id: contentId }, select: { id: true } })
    if (!c) throw new NotFoundException('Content not found')
  }

  private async assertSection(sectionId: string) {
    const s = await this.prisma.courseSection.findUnique({ where: { id: sectionId }, select: { id: true } })
    if (!s) throw new NotFoundException('Section not found')
  }

  private async assertLecture(lectureId: string) {
    const l = await this.prisma.lecture.findUnique({ where: { id: lectureId }, select: { id: true } })
    if (!l) throw new NotFoundException('Lecture not found')
  }
}
