-- CreateEnum
CREATE TYPE "WithdrawalRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'paid');

-- CreateTable
CREATE TABLE "tutor_payout_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutor_user_id" UUID NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "account_number_last4" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "routing_code" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "country_code" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_payout_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutor_user_id" UUID NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "status" "WithdrawalRequestStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "reviewed_by_id" UUID,
    "external_transfer_id" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutor_payout_accounts_tutor_user_id_key" ON "tutor_payout_accounts"("tutor_user_id");

-- CreateIndex
CREATE INDEX "withdrawal_requests_tutor_status_created_at_idx" ON "withdrawal_requests"("tutor_user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "withdrawal_requests_status_created_at_idx" ON "withdrawal_requests"("status", "created_at");

-- AddForeignKey
ALTER TABLE "tutor_payout_accounts" ADD CONSTRAINT "tutor_payout_accounts_tutor_user_id_fkey" FOREIGN KEY ("tutor_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_tutor_user_id_fkey" FOREIGN KEY ("tutor_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
