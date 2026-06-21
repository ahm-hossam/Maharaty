import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { SendNotificationDto } from './dto/send-notification.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's notifications" })
  async findForUser(@Request() req: any) {
    const data = await this.notificationsService.findForUser(req.user.id)
    return { success: true, data }
  }

  @Post('send')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Send notification to user(s) (admin)' })
  async send(@Body() dto: SendNotificationDto) {
    const data = await this.notificationsService.send(dto)
    return { success: true, data }
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read (user)' })
  async markAllRead(@Request() req: any) {
    const data = await this.notificationsService.markAllRead(req.user.id)
    return { success: true, data, message: 'All notifications marked as read' }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read (user)' })
  async markRead(@Param('id') id: string, @Request() req: any) {
    const data = await this.notificationsService.markRead(id, req.user.id)
    return { success: true, data }
  }
}
