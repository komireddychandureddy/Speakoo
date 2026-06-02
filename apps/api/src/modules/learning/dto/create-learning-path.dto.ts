import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLearningPathDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(8)
  description!: string;

  @IsString()
  @MinLength(2)
  language!: string;

  @IsString()
  @MinLength(1)
  cefrLevel!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
