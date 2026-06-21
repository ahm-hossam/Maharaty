import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PushTokenDto {
  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]' })
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiProperty({ enum: ['ios', 'android'] })
  @IsString()
  @IsIn(['ios', 'android'])
  platform: string
}
