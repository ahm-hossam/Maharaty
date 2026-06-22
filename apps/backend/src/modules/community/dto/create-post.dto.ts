import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator'

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  content: string

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsBoolean()
  isAdminPost?: boolean
}
