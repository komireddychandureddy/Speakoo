import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class CreateAssessmentDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answers: string[];
}
