import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOnDemandRequestDto {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  topic: string;
}
