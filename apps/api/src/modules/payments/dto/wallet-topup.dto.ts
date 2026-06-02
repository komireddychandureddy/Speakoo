import { IsInt, Min } from 'class-validator';

export class WalletTopupDto {
  @IsInt()
  @Min(100)
  amountCents: number;
}
