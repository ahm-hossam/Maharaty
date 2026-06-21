import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { ActivityType } from '../../common/enums'

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        userId,
        type: dto.type,
        meta: dto.meta,
        contentId: dto.contentId,
      },
    })
    return activity
  }

  async findAll(query: {
    userId?: string
    type?: ActivityType
    page?: number
    limit?: number
  }) {
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    const skip = (page - 1) * limit

    const where: any = {}
    if (query.userId) where.userId = query.userId
    if (query.type) where.type = query.type

    const [total, activities] = await Promise.all([
      this.prisma.activity.count({ where }),
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          content: { select: { id: true, title: true, titleAr: true, type: true } },
        },
      }),
    ])

    return {
      activities,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async findByUser(userId: string, query: { page?: number; limit?: number }) {
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    const skip = (page - 1) * limit

    const [total, activities] = await Promise.all([
      this.prisma.activity.count({ where: { userId } }),
      this.prisma.activity.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          content: { select: { id: true, title: true, titleAr: true, type: true } },
        },
      }),
    ])

    return {
      activities,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }
}
