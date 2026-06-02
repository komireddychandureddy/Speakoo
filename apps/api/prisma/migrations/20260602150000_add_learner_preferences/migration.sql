-- AlterTable
ALTER TABLE "user_profiles"
ADD COLUMN "target_language" TEXT,
ADD COLUMN "learning_goals" TEXT,
ADD COLUMN "max_budget_cents" INTEGER;
