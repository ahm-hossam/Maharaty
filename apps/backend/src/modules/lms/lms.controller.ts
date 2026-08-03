import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { LmsService } from './lms.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'
import { CreateSectionDto } from './dto/create-section.dto'
import { CreateLectureDto } from './dto/create-lecture.dto'
import { UpdateLectureProgressDto } from './dto/update-lecture-progress.dto'
import { ReorderDto } from './dto/reorder.dto'

@ApiTags('LMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  // ─── Curriculum (read — any authenticated user) ───────────────────────────

  @Get(':contentId/curriculum')
  @ApiOperation({ summary: 'Get full curriculum for a content item' })
  async getCurriculum(@Param('contentId') contentId: string, @Request() req: any) {
    return { success: true, data: await this.lmsService.getCurriculum(contentId, req.user.role) }
  }

  @Get(':contentId/my-progress')
  @ApiOperation({ summary: 'Get current user progress for a content item' })
  async getMyProgress(@Param('contentId') contentId: string, @Request() req: any) {
    return { success: true, data: await this.lmsService.getUserProgress(req.user.id, contentId) }
  }

  // ─── Sections (admin only) ────────────────────────────────────────────────

  @Post(':contentId/sections')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a section' })
  async createSection(@Param('contentId') contentId: string, @Body() dto: CreateSectionDto) {
    return { success: true, data: await this.lmsService.createSection(contentId, dto) }
  }

  @Patch('sections/:sectionId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update a section' })
  async updateSection(@Param('sectionId') sectionId: string, @Body() dto: CreateSectionDto) {
    return { success: true, data: await this.lmsService.updateSection(sectionId, dto) }
  }

  @Delete('sections/:sectionId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete a section' })
  async deleteSection(@Param('sectionId') sectionId: string) {
    return { success: true, data: await this.lmsService.deleteSection(sectionId) }
  }

  @Patch(':contentId/sections/reorder')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Reorder sections' })
  async reorderSections(@Param('contentId') contentId: string, @Body() dto: ReorderDto) {
    return { success: true, data: await this.lmsService.reorderSections(contentId, dto) }
  }

  // ─── Lectures (admin only) ────────────────────────────────────────────────

  @Post('sections/:sectionId/lectures')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a lecture' })
  async createLecture(@Param('sectionId') sectionId: string, @Body() dto: CreateLectureDto) {
    return { success: true, data: await this.lmsService.createLecture(sectionId, dto) }
  }

  @Patch('lectures/:lectureId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update a lecture' })
  async updateLecture(@Param('lectureId') lectureId: string, @Body() dto: CreateLectureDto) {
    return { success: true, data: await this.lmsService.updateLecture(lectureId, dto) }
  }

  @Delete('lectures/:lectureId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete a lecture' })
  async deleteLecture(@Param('lectureId') lectureId: string) {
    return { success: true, data: await this.lmsService.deleteLecture(lectureId) }
  }

  @Patch('sections/:sectionId/lectures/reorder')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Reorder lectures in a section' })
  async reorderLectures(@Param('sectionId') sectionId: string, @Body() dto: ReorderDto) {
    return { success: true, data: await this.lmsService.reorderLectures(sectionId, dto) }
  }

  // ─── Progress (any authenticated user) ────────────────────────────────────

  @Post('lectures/:lectureId/progress')
  @ApiOperation({ summary: 'Update user progress for a lecture' })
  async updateProgress(
    @Param('lectureId') lectureId: string,
    @Body() dto: UpdateLectureProgressDto,
    @Request() req: any,
  ) {
    return { success: true, data: await this.lmsService.updateProgress(req.user.id, lectureId, dto) }
  }
}
