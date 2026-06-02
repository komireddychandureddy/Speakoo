import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSessionNoteDto {
  @IsUUID('4')
  bookingId!: string;

  @IsString()
  @MinLength(8)
  summary!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  strengths?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  weaknesses?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  nextSteps?: string;
}
