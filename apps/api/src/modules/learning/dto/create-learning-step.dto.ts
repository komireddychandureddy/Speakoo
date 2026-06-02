import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateLearningStepDto {
  @IsInt()
  @Min(1)
  @Max(99)
  stepOrder!: number;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(8)
  description!: string;

  @IsString()
  @MinLength(2)
  skill!: string;
}
