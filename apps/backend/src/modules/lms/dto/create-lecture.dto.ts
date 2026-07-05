import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean, IsArray } from 'class-validator'

export class CreateLectureDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  videoUrl?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  youtubeId?: string

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFree?: boolean

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number

  @ApiPropertyOptional({ description: 'HTML rich-text article content' })
  @IsString()
  @IsOptional()
  content?: string

  @ApiPropertyOptional({ description: 'JSON array of attachment objects' })
  @IsArray()
  @IsOptional()
  attachments?: { url: string; name: string; type: string; size?: number }[]
}
