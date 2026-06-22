import { Module } from '@nestjs/common'
import { SelfAssessmentController } from './self-assessment.controller'
import { SelfAssessmentService } from './self-assessment.service'

@Module({
  controllers: [SelfAssessmentController],
  providers: [SelfAssessmentService],
  exports: [SelfAssessmentService],
})
export class SelfAssessmentModule {}
