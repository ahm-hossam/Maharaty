import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, Min, IsBoolean, IsOptional } from 'class-validator'

export class UpdateLectureProgressDto {
  @ApiProperty({ description: 'Seconds watched' })
  @IsInt()
  @Min(0)
  watchedSeconds: number

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean
}
