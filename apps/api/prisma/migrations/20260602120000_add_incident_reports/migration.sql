-- CreateEnum
CREATE TYPE "IncidentCategory" AS ENUM ('abuse', 'harassment', 'no_show', 'payment_dispute', 'technical_issue', 'other');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('open', 'investigating', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID,
    "reporter_id" UUID NOT NULL,
    "reported_user_id" UUID,
    "category" "IncidentCategory" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'open',
    "priority" "IncidentPriority" NOT NULL DEFAULT 'medium',
    "description" TEXT NOT NULL,
    "evidence_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "admin_note" TEXT,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incident_reports_status_priority_created_at_idx" ON "incident_reports"("status", "priority", "created_at");

-- CreateIndex
CREATE INDEX "incident_reports_reporter_created_at_idx" ON "incident_reports"("reporter_id", "created_at");

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
