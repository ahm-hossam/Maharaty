import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ActivitiesService } from './activities.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'
import { ActivityType } from '../../common/enums'

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Track an activity (user)' })
  async create(@Body() dto: CreateActivityDto, @Request() req: any) {
    const data = await this.activitiesService.create(req.user.id, dto)
    return { success: true, data }
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'List all activities (admin)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ActivityType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('userId') userId?: string,
    @Query('type') type?: ActivityType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.activitiesService.findAll({ userId, type, page, limit })
    return { success: true, data }
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user activities' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findMy(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.activitiesService.findByUser(req.user.id, { page, limit })
    return { success: true, data }
  }
}
