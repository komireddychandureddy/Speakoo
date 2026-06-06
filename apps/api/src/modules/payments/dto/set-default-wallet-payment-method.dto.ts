import { IsString, MinLength } from 'class-validator';

export class SetDefaultWalletPaymentMethodDto {
  @IsString()
  @MinLength(1)
  paymentMethodId: string;
}
