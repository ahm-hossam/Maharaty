import { IsString, IsBoolean, IsInt, IsOptional, MinLength } from 'class-validator'

export class CreateQuestionDto {
  @IsString()
  @MinLength(5)
  textAr: string

  @IsString()
  category: string

  @IsString()
  dimensionLabel: string

  @IsOptional()
  @IsInt()
  orderIndex?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
