import { IsString, IsObject } from 'class-validator'

export class SubmitResultDto {
  @IsString()
  topType: string

  @IsObject()
  scores: Record<string, number>
}
