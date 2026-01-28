-- Vacation data table for authenticated users
CREATE TABLE IF NOT EXISTS vacation_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 20,
  vacation_dates TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, year)
);

-- Performance index on user_id (Pitfall 7 from research)
CREATE INDEX IF NOT EXISTS idx_vacation_data_user_id ON vacation_data(user_id);

-- Enable Row Level Security (Pitfall 2 from research)
ALTER TABLE vacation_data ENABLE ROW LEVEL SECURITY;

-- RLS policies using (SELECT auth.uid()) for caching (Pitfall 4)
CREATE POLICY "Users can view own vacation data"
ON vacation_data FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own vacation data"
ON vacation_data FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own vacation data"
ON vacation_data FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own vacation data"
ON vacation_data FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);
