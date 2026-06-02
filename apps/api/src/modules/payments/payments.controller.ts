import { Controller, Post, Get, Param, Headers, Body, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { WalletTopupDto } from './dto/wallet-topup.dto';
import { User } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('bookings/:bookingId/intent')
  createIntent(@Param('bookingId') bookingId: string, @CurrentUser() user: User) {
    return this.paymentsService.createPaymentIntent(bookingId, user.id);
  }

  @Public()
  @Post('webhooks/stripe')
  handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleWebhook(req.rawBody as Buffer, sig);
  }

  @Get('wallet')
  getWalletBalance(@CurrentUser() user: User) {
    return this.paymentsService.getWalletBalance(user.id);
  }

  @Get('wallet/transactions')
  getWalletTransactions(@CurrentUser() user: User) {
    return this.paymentsService.getWalletTransactions(user.id);
  }

  @Post('wallet/topup')
  topupWallet(@CurrentUser() user: User, @Body() dto: WalletTopupDto) {
    return this.paymentsService.topupWallet(user.id, dto.amountCents);
  }

  @Roles('learner')
  @Post('wallet/credits')
  purchaseCredits(@CurrentUser() user: User, @Body() dto: PurchaseCreditsDto) {
    return this.paymentsService.purchaseCredits(user.id, dto.bundleId);
  }

  @Roles('tutor')
  @Post('connect/onboard')
  createConnectOnboarding(@CurrentUser() user: User) {
    return this.paymentsService.createConnectOnboarding(user.id);
  }
}
