import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SendNotificationDto {
  @ApiPropertyOptional({ type: [String], description: 'Target user IDs (omit for bulk)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[]

  @ApiPropertyOptional({ description: 'Send to all users' })
  @IsBoolean()
  @IsOptional()
  bulk?: boolean

  @ApiProperty({ example: 'مرحباً بك في مهاراتي' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ example: 'اكتشف مهاراتك الجديدة اليوم' })
  @IsString()
  @IsNotEmpty()
  body: string

  @ApiProperty({ enum: ['push', 'in-app', 'both'], default: 'in-app' })
  @IsString()
  @IsIn(['push', 'in-app', 'both'])
  type: 'push' | 'in-app' | 'both'
}
