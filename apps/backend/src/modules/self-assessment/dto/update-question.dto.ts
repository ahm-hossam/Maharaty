import { IsString, IsBoolean, IsInt, IsOptional } from 'class-validator'

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  textAr?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  dimensionLabel?: string

  @IsOptional()
  @IsInt()
  orderIndex?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
