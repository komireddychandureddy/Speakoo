-- CreateEnum
CREATE TYPE "KycSubmissionStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "tutor_kyc_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutor_user_id" UUID NOT NULL,
    "status" "KycSubmissionStatus" NOT NULL DEFAULT 'pending',
    "document_type" TEXT NOT NULL,
    "document_front_url" TEXT NOT NULL,
    "document_back_url" TEXT,
    "selfie_url" TEXT,
    "note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_kyc_submissions_tutor_created_at_idx" ON "tutor_kyc_submissions"("tutor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "tutor_kyc_submissions_status_created_at_idx" ON "tutor_kyc_submissions"("status", "created_at");

-- AddForeignKey
ALTER TABLE "tutor_kyc_submissions" ADD CONSTRAINT "tutor_kyc_submissions_tutor_user_id_fkey" FOREIGN KEY ("tutor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_kyc_submissions" ADD CONSTRAINT "tutor_kyc_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
