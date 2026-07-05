import { ApiProperty } from '@nestjs/swagger'
import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

class OrderItem {
  @IsString()
  id: string

  @IsInt()
  @Min(0)
  order: number
}

export class ReorderDto {
  @ApiProperty({ type: [OrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  items: OrderItem[]
}
