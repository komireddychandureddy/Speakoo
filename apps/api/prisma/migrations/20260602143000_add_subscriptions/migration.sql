-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "UserSubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled');

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interval" "SubscriptionInterval" NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "included_credits" INTEGER NOT NULL DEFAULT 0,
    "stripe_price_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "UserSubscriptionStatus" NOT NULL DEFAULT 'active',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "current_period_start" TIMESTAMPTZ NOT NULL,
    "current_period_end" TIMESTAMPTZ NOT NULL,
    "canceled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripe_subscription_id_key" ON "user_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_user_status_idx" ON "user_subscriptions"("user_id", "status");

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
