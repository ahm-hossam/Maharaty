import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ActivityType } from '../../../common/enums'

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  type: ActivityType

  @ApiPropertyOptional({ description: 'Additional context as JSON object' })
  @IsObject()
  @IsOptional()
  meta?: Record<string, any>

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contentId?: string
}
