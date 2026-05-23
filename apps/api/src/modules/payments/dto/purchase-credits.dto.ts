import { IsUUID } from 'class-validator';

export class PurchaseCreditsDto {
  @IsUUID()
  bundleId: string;
}
