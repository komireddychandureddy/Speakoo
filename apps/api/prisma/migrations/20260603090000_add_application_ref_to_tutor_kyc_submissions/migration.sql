-- AlterTable
ALTER TABLE "tutor_kyc_submissions"
ADD COLUMN "application_ref" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tutor_kyc_submissions_application_ref_key"
ON "tutor_kyc_submissions"("application_ref");
