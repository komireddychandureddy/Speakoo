import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AssignHomeworkDto {
  @IsUUID('4')
  learnerId!: string;

  @IsOptional()
  @IsUUID('4')
  tutorId?: string;

  @IsOptional()
  @IsUUID('4')
  bookingId?: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(8)
  description!: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
