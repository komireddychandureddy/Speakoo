import { IsString, IsNotEmpty, IsInt, Min, Max, IsISO8601 } from 'class-validator';

export class CreateGroupSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsISO8601()
  scheduledAt: string;

  @IsInt()
  @Min(2)
  @Max(20)
  maxParticipants: number;

  @IsInt()
  @Min(0)
  priceCents: number;
}
