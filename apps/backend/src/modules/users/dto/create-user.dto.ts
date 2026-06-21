import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Role } from '../../../common/enums'

export class CreateUserDto {
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

  @ApiPropertyOptional({ enum: Role, default: Role.USER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role
}
