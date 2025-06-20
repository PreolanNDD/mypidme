/*
  # Fix community findings table schema

  1. Schema Changes
    - Rename `user_id` column to `author_id` in community_findings table
    - Update all foreign key references and constraints
    - Update RLS policies to use the correct column name

  2. Notes
    - This aligns the database schema with the application code
    - The application expects `author_id` but the table was created with `user_id`
*/

-- Check if the column needs to be renamed
DO $$
BEGIN
  -- Only rename if user_id exists and author_id doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_findings' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_findings' AND column_name = 'author_id'
  ) THEN
    -- Rename the column
    ALTER TABLE community_findings RENAME COLUMN user_id TO author_id;
  END IF;
END $$;

-- Update RLS policies to use the correct column name
DROP POLICY IF EXISTS "Users can read own findings" ON community_findings;
CREATE POLICY "Users can read own findings"
  ON community_findings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can create findings" ON community_findings;
CREATE POLICY "Users can create findings"
  ON community_findings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own visible findings" ON community_findings;
CREATE POLICY "Users can update own visible findings"
  ON community_findings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND status = 'visible')
  WITH CHECK (auth.uid() = author_id AND status = 'visible');

-- Update indexes to use the correct column name
DROP INDEX IF EXISTS idx_community_findings_user_id;
CREATE INDEX IF NOT EXISTS idx_community_findings_author_id ON community_findings(author_id);