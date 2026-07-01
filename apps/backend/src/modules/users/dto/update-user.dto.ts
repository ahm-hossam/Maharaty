import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Role } from '../../../common/enums'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'أحمد محمد' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ example: 'ahmed@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiPropertyOptional({ example: '+966501234567' })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

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
