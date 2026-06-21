import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { SendNotificationDto } from './dto/send-notification.dto'

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return notifications
  }

  async send(dto: SendNotificationDto) {
    let targetUserIds: string[] = []

    if (dto.bulk) {
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      })
      targetUserIds = users.map((u) => u.id)
    } else if (dto.userIds && dto.userIds.length > 0) {
      targetUserIds = dto.userIds
    } else {
      throw new BadRequestException('Provide userIds or set bulk=true')
    }

    const shouldCreateInApp = dto.type === 'in-app' || dto.type === 'both'
    const shouldSendPush = dto.type === 'push' || dto.type === 'both'

    let created = 0

    if (shouldCreateInApp) {
      await this.prisma.notification.createMany({
        data: targetUserIds.map((userId) => ({
          userId,
          title: dto.title,
          body: dto.body,
          type: dto.type,
        })),
      })
      created = targetUserIds.length
    }

    if (shouldSendPush) {
      // Stub: fetch push tokens and log (no real FCM)
      const pushTokens = await this.prisma.pushToken.findMany({
        where: { userId: { in: targetUserIds } },
        select: { token: true, platform: true, userId: true },
      })

      console.log(
        `[Push Notification STUB] Sending "${dto.title}" to ${pushTokens.length} devices`,
        pushTokens.map((t) => t.token),
      )
    }

    return {
      sent: targetUserIds.length,
      inAppCreated: created,
      pushStubbed: shouldSendPush,
      message: `Notification sent to ${targetUserIds.length} user(s)`,
    }
  }

  async markRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    })
    return notification
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return { updated: result.count }
  }
}
