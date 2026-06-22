import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ContentType } from '../../../common/enums'

export class UpdateContentDto {
  @ApiPropertyOptional({ enum: ContentType })
  @IsEnum(ContentType)
  @IsOptional()
  type?: ContentType

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleAr?: string

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

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  meta?: Record<string, unknown>
}
