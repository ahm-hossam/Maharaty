import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

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
}
