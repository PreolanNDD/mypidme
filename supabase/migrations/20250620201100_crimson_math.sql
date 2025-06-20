/*
  # Update community findings status field

  1. Schema Changes
    - Update the status enum to include 'visible' and 'hidden_by_community' values
    - Change default status from 'pending_review' to 'visible'
    - Update existing records to use new status values

  2. Notes
    - This aligns the database with the application code expectations
    - Findings are now visible by default instead of requiring approval
*/

-- First, add the new enum values if they don't exist
DO $$
BEGIN
  -- Add 'visible' to the enum if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'visible' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'finding_status')
  ) THEN
    ALTER TYPE finding_status ADD VALUE 'visible';
  END IF;

  -- Add 'hidden_by_community' to the enum if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'hidden_by_community' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'finding_status')
  ) THEN
    ALTER TYPE finding_status ADD VALUE 'hidden_by_community';
  END IF;
END $$;

-- Update existing records to use the new status values
UPDATE community_findings 
SET status = 'visible' 
WHERE status = 'approved' OR status = 'pending_review';

UPDATE community_findings 
SET status = 'hidden_by_community' 
WHERE status = 'rejected';

-- Update the default value for new records
ALTER TABLE community_findings 
ALTER COLUMN status SET DEFAULT 'visible';

-- Update RLS policies to work with new status values
DROP POLICY IF EXISTS "Anyone can read approved findings" ON community_findings;
CREATE POLICY "Anyone can read visible findings"
  ON community_findings
  FOR SELECT
  TO authenticated
  USING (status = 'visible');

-- Update the policy for users updating their own findings
DROP POLICY IF EXISTS "Users can update own pending findings" ON community_findings;
CREATE POLICY "Users can update own visible findings"
  ON community_findings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND status = 'visible')
  WITH CHECK (auth.uid() = author_id AND status = 'visible');