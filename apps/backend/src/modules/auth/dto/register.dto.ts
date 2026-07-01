import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'أحمد محمد' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiPropertyOptional({ example: '+966501234567' })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  governorate?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gender?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  education?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fieldOfStudy?: string
}
