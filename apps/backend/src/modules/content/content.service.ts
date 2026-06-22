import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateContentDto } from './dto/create-content.dto'
import { UpdateContentDto } from './dto/update-content.dto'
import { ContentType } from '../../common/enums'

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(query: {
    type?: ContentType
    category?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const skip = (page - 1) * limit

    const where: any = { isPublished: true }

    if (query.type) where.type = query.type
    if (query.category) where.category = { contains: query.category, mode: 'insensitive' }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { titleAr: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [total, content] = await Promise.all([
      this.prisma.content.count({ where }),
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          titleAr: true,
          description: true,
          thumbnail: true,
          url: true,
          duration: true,
          category: true,
          isPublished: true,
          createdAt: true,
          _count: { select: { progresses: true } },
        },
      }),
    ])

    return { content, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findCategories(): Promise<string[]> {
    const rows = await this.prisma.content.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })
    return rows.map(r => r.category as string).filter(Boolean)
  }

  async findAll(query: { type?: ContentType; category?: string; page?: number; limit?: number }) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const skip = (page - 1) * limit

    const where: any = {}
    if (query.type) where.type = query.type
    if (query.category) where.category = { contains: query.category, mode: 'insensitive' }

    const [total, content] = await Promise.all([
      this.prisma.content.count({ where }),
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          titleAr: true,
          description: true,
          thumbnail: true,
          url: true,
          duration: true,
          category: true,
          meta: true,
          isPublished: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { progresses: true } },
        },
      }),
    ])

    return { content, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      select: {
        id: true, type: true, title: true, titleAr: true, description: true,
        thumbnail: true, url: true, duration: true, category: true,
        meta: true, isPublished: true, createdBy: true, createdAt: true, updatedAt: true,
        _count: { select: { progresses: true } },
      },
    })
    if (!content) throw new NotFoundException('Content not found')
    return content
  }

  async create(dto: CreateContentDto, userId: string) {
    const { meta, ...rest } = dto
    const content = await this.prisma.content.create({
      data: { ...rest, createdBy: userId, ...(meta !== undefined ? { meta: meta as any } : {}) },
    })
    return content
  }

  async update(id: string, dto: UpdateContentDto) {
    const existing = await this.prisma.content.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Content not found')

    const { meta, ...rest } = dto
    const content = await this.prisma.content.update({
      where: { id },
      data: { ...rest, ...(meta !== undefined ? { meta: meta as any } : {}) },
    })
    return content
  }

  async remove(id: string) {
    const existing = await this.prisma.content.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Content not found')

    await this.prisma.content.delete({ where: { id } })
    return { message: 'Content deleted successfully' }
  }

  async updateProgress(userId: string, contentId: string, progress: number) {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } })
    if (!content) throw new NotFoundException('Content not found')

    const completedAt = progress >= 100 ? new Date() : null

    const result = await this.prisma.contentProgress.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {
        progress,
        lastSeenAt: new Date(),
        ...(completedAt ? { completedAt } : {}),
      },
      create: {
        userId,
        contentId,
        progress,
        ...(completedAt ? { completedAt } : {}),
      },
    })

    // Track activity
    const activityType = progress >= 100 ? 'COMPLETE_COURSE' : 'VIEW_COURSE'
    await this.prisma.activity.create({
      data: { userId, type: activityType, contentId, meta: { contentId, progress } },
    })

    return result
  }
}
