import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ContentService } from './content.service'
import { CreateContentDto } from './dto/create-content.dto'
import { UpdateContentDto } from './dto/update-content.dto'
import { UpdateProgressDto } from './dto/update-progress.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'
import { ContentType } from '../../common/enums'

@ApiTags('Content')
@ApiBearerAuth()
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List published content (user)' })
  @ApiQuery({ name: 'type', required: false, enum: ContentType })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findPublished(
    @Query('type') type?: ContentType,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.contentService.findPublished({ type, category, search, page, limit })
    return { success: true, data }
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get distinct categories' })
  async getCategories() {
    const data = await this.contentService.findCategories()
    return { success: true, data }
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'List all content including unpublished (admin)' })
  @ApiQuery({ name: 'type', required: false, enum: ContentType })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('type') type?: ContentType,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.contentService.findAll({ type, category, page, limit })
    return { success: true, data }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get single content item with full meta' })
  async findOne(@Param('id') id: string) {
    const data = await this.contentService.findOne(id)
    return { success: true, data }
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create content (admin)' })
  async create(@Body() dto: CreateContentDto, @Request() req: any) {
    const data = await this.contentService.create(dto, req.user.id)
    return { success: true, data, message: 'Content created successfully' }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update content (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    const data = await this.contentService.update(id, dto)
    return { success: true, data, message: 'Content updated successfully' }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete content (admin)' })
  async remove(@Param('id') id: string) {
    const data = await this.contentService.remove(id)
    return { success: true, data }
  }

  @Post(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user progress on content (user)' })
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
    @Request() req: any,
  ) {
    const data = await this.contentService.updateProgress(req.user.id, id, dto.progress)
    return { success: true, data, message: 'Progress updated' }
  }
}
