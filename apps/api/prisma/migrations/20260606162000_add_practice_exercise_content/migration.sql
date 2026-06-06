CREATE TABLE IF NOT EXISTS practice_exercise_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL,
  title TEXT,
  payload JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS practice_exercise_content_mode_active_sort_idx
  ON practice_exercise_content (mode, is_active, sort_order);
