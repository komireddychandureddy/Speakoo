import { IsString, MinLength } from 'class-validator';

export class SubmitHomeworkDto {
  @IsString()
  @MinLength(3)
  submissionText!: string;
}
