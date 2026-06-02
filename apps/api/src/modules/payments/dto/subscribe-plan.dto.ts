import { IsString, IsUUID, MinLength } from 'class-validator';

export class SubscribePlanDto {
  @IsUUID()
  planId!: string;

  @IsString()
  @MinLength(2)
  paymentMethodId!: string;
}
