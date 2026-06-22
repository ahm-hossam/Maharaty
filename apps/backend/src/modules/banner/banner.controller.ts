import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { BannerService, BannerConfig } from './banner.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'

@ApiTags('Banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @ApiOperation({ summary: 'Get banner config (public)' })
  getBanner() {
    return { success: true, data: this.bannerService.get() }
  }

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner config (admin)' })
  updateBanner(@Body() body: Partial<BannerConfig>) {
    const data = this.bannerService.save(body)
    return { success: true, data }
  }
}
