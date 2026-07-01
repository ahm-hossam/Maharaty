import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../database/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number
    limit?: number
    search?: string
    role?: string
    isActive?: boolean
  }) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.role) {
      where.role = query.role
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { activities: true, contentProgress: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        governorate: true,
        gender: true,
        education: true,
        fieldOfStudy: true,
        createdAt: true,
        updatedAt: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 100,
          select: {
            id: true,
            type: true,
            meta: true,
            contentId: true,
            createdAt: true,
            content: {
              select: { id: true, titleAr: true, type: true, thumbnail: true },
            },
          },
        },
        contentProgress: {
          orderBy: { lastSeenAt: 'desc' },
          select: {
            progress: true,
            completedAt: true,
            lastSeenAt: true,
            content: {
              select: { id: true, titleAr: true, type: true, thumbnail: true, category: true },
            },
          },
        },
        assessmentResults: {
          orderBy: { completedAt: 'desc' },
          select: {
            id: true,
            score: true,
            passed: true,
            completedAt: true,
            assessment: { select: { id: true, title: true, titleAr: true } },
          },
        },
        userSkills: {
          select: {
            level: true,
            progress: true,
            skill: { select: { id: true, nameAr: true, name: true, icon: true } },
          },
        },
        _count: {
          select: { activities: true, contentProgress: true, assessmentResults: true },
        },
      },
    })

    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already in use')

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return user
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id)

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return user
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.user.delete({ where: { id } })
    return { message: 'User deleted successfully' }
  }
}
