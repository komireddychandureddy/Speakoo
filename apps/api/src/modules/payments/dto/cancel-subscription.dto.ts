import { IsOptional, IsString, MinLength } from 'class-validator';

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  reason?: string;
}
