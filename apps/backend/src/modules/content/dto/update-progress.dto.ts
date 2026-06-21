import { IsInt, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateProgressDto {
  @ApiProperty({ example: 50, description: '0-100' })
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number
}
