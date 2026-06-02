import { IsString, MinLength } from 'class-validator';

export class ReviewHomeworkDto {
  @IsString()
  @MinLength(2)
  feedbackText!: string;
}
