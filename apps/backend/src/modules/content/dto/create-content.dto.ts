import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ContentType } from '../../../common/enums'

export class CreateContentDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  type: ContentType

  @ApiPropertyOptional({ example: 'Introduction to JavaScript' })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ example: 'مقدمة في جافاسكريبت' })
  @IsString()
  @IsNotEmpty()
  titleAr: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnail?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  url?: string

  @ApiPropertyOptional({ example: 60, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number

  @ApiPropertyOptional({ example: 'برمجة' })
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean

  @ApiPropertyOptional({ description: 'Type-specific structured data (videos, lectures, article body)' })
  @IsOptional()
  meta?: Record<string, unknown>
}
