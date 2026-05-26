import { IsUUID, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  slotId: string;

  @IsUUID()
  tutorId: string;

  @IsString()
  language: string;
}
