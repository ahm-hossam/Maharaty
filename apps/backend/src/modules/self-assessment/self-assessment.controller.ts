import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SelfAssessmentService } from './self-assessment.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { SubmitResultDto } from './dto/submit-result.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'

@ApiTags('Self Assessment')
@Controller('self-assessment')
export class SelfAssessmentController {
  constructor(private readonly service: SelfAssessmentService) {}

  @Get('questions')
  @ApiOperation({ summary: 'Get active self-assessment questions (public)' })
  async findAll() {
    const data = await this.service.findAllQuestions()
    return { success: true, data }
  }

  @Get('questions/admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all questions including inactive (admin)' })
  async findAllAdmin() {
    const data = await this.service.findAllQuestionsAdmin()
    return { success: true, data }
  }

  @Post('questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a question (admin)' })
  async create(@Body() dto: CreateQuestionDto) {
    const data = await this.service.createQuestion(dto)
    return { success: true, data }
  }

  @Patch('questions/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update a question (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    const data = await this.service.updateQuestion(id, dto)
    return { success: true, data }
  }

  @Delete('questions/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete a question (admin)' })
  async remove(@Param('id') id: string) {
    await this.service.deleteQuestion(id)
    return { success: true }
  }

  @Post('seed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Seed default 15 RIASEC questions (admin)' })
  async seed() {
    const data = await this.service.seedDefaultQuestions()
    return { success: true, data }
  }

  @Post('results')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit assessment result (user)' })
  async submitResult(@Body() dto: SubmitResultDto, @Request() req: any) {
    const data = await this.service.submitResult(dto, req.user.id)
    return { success: true, data }
  }

  @Get('results/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my assessment history' })
  async myResults(@Request() req: any) {
    const data = await this.service.getMyResults(req.user.id)
    return { success: true, data }
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get assessment stats (admin)' })
  async getStats() {
    const data = await this.service.getStats()
    return { success: true, data }
  }
}
