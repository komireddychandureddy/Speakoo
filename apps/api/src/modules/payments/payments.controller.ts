import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  Body,
  RawBodyRequest,
  Req,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { WalletTopupDto } from './dto/wallet-topup.dto';
import { SubscribePlanDto } from './dto/subscribe-plan.dto';
import { UpsertSubscriptionPlanDto } from './dto/upsert-subscription-plan.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { ConfirmMockPaymentDto } from './dto/confirm-mock-payment.dto';
import { UpsertPayoutAccountDto } from './dto/upsert-payout-account.dto';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { ReviewWithdrawalRequestDto } from './dto/review-withdrawal-request.dto';
import { ListWithdrawalRequestsDto } from './dto/list-withdrawal-requests.dto';
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

  @Get('credit-bundles')
  listCreditBundles() {
    return this.paymentsService.listCreditBundles();
  }

  @Public()
  @Get('subscriptions/plans')
  listSubscriptionPlans() {
    return this.paymentsService.listSubscriptionPlans();
  }

  @Roles('admin')
  @Post('subscriptions/plans')
  upsertSubscriptionPlan(@Body() dto: UpsertSubscriptionPlanDto) {
    return this.paymentsService.upsertSubscriptionPlan(dto);
  }

  @Roles('learner')
  @Post('subscriptions/subscribe')
  subscribePlan(@CurrentUser() user: User, @Body() dto: SubscribePlanDto) {
    return this.paymentsService.subscribePlan(user.id, dto.planId, dto.paymentMethodId);
  }

  @Roles('learner')
  @Get('subscriptions/me')
  getMySubscription(@CurrentUser() user: User) {
    return this.paymentsService.getMySubscription(user.id);
  }

  @Roles('learner')
  @Post('subscriptions/cancel')
  cancelMySubscription(@CurrentUser() user: User, @Body() dto: CancelSubscriptionDto) {
    return this.paymentsService.cancelMySubscription(user.id, dto.reason);
  }

  @Roles('admin')
  @Post('subscriptions/grants/run')
  runCreditGrants() {
    return this.paymentsService.runSubscriptionCreditGrants();
  }

  @Roles('admin')
  @Get('risks/transactions')
  getTransactionRisks(@Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number) {
    return this.paymentsService.getTransactionRiskSignals(days);
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

  @Roles('learner')
  @Post('mock/confirm')
  confirmMockPayment(@CurrentUser() user: User, @Body() dto: ConfirmMockPaymentDto) {
    return this.paymentsService.confirmMockPayment(user.id, dto);
  }

  @Roles('tutor')
  @Post('connect/onboard')
  createConnectOnboarding(@CurrentUser() user: User) {
    return this.paymentsService.createConnectOnboarding(user.id);
  }

  @Roles('tutor')
  @Get('tutor/payout-account')
  getTutorPayoutAccount(@CurrentUser() user: User) {
    return this.paymentsService.getTutorPayoutAccount(user.id);
  }

  @Roles('tutor')
  @Post('tutor/payout-account')
  upsertTutorPayoutAccount(@CurrentUser() user: User, @Body() dto: UpsertPayoutAccountDto) {
    return this.paymentsService.upsertTutorPayoutAccount(user.id, dto);
  }

  @Roles('tutor')
  @Get('tutor/payouts/summary')
  getTutorPayoutSummary(@CurrentUser() user: User) {
    return this.paymentsService.getTutorPayoutSummary(user.id);
  }

  @Roles('tutor')
  @Get('tutor/withdrawals')
  listTutorWithdrawals(@CurrentUser() user: User) {
    return this.paymentsService.listTutorWithdrawals(user.id);
  }

  @Roles('tutor')
  @Post('tutor/withdrawals')
  createTutorWithdrawalRequest(@CurrentUser() user: User, @Body() dto: CreateWithdrawalRequestDto) {
    return this.paymentsService.createTutorWithdrawalRequest(user.id, dto.amountCents);
  }

  @Roles('admin')
  @Get('admin/withdrawals')
  listAdminWithdrawals(@Query() query: ListWithdrawalRequestsDto) {
    return this.paymentsService.listAdminWithdrawals(query.status);
  }

  @Roles('admin')
  @Post('admin/withdrawals/:id/review')
  reviewWithdrawalRequest(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: ReviewWithdrawalRequestDto,
  ) {
    return this.paymentsService.reviewWithdrawalRequest(id, user.id, dto.action, dto.note);
  }
}
