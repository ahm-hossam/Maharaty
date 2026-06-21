import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get dashboard analytics (admin)' })
  async getAnalytics() {
    const data = await this.adminService.getAnalytics()
    return { success: true, data }
  }
}
