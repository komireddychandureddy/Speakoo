-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('assigned', 'submitted', 'reviewed', 'overdue');

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "cefr_level" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_steps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "path_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_path_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_path_enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "learner_id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "current_step_order" INTEGER NOT NULL DEFAULT 1,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learner_path_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "tutor_id" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "next_steps" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "learner_id" UUID NOT NULL,
    "tutor_id" UUID,
    "booking_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_at" TIMESTAMPTZ,
    "status" "HomeworkStatus" NOT NULL DEFAULT 'assigned',
    "submission_text" TEXT,
    "feedback_text" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homework_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_paths_slug_key" ON "learning_paths"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_steps_path_order_key" ON "learning_path_steps"("path_id", "step_order");

-- CreateIndex
CREATE UNIQUE INDEX "learner_path_enrollments_learner_path_key" ON "learner_path_enrollments"("learner_id", "path_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_notes_booking_id_key" ON "session_notes"("booking_id");

-- CreateIndex
CREATE INDEX "session_notes_learner_created_at_idx" ON "session_notes"("learner_id", "created_at");

-- CreateIndex
CREATE INDEX "homework_assignments_learner_status_created_at_idx" ON "homework_assignments"("learner_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "learning_path_steps" ADD CONSTRAINT "learning_path_steps_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_path_enrollments" ADD CONSTRAINT "learner_path_enrollments_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_path_enrollments" ADD CONSTRAINT "learner_path_enrollments_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_assignments" ADD CONSTRAINT "homework_assignments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
