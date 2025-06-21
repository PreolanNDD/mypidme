/*
  # Fix Row Level Security Policies

  1. Issues Found
    - RLS policies may be too restrictive or incorrectly configured
    - Need to ensure authenticated users can access their own data
    - Check for missing policies or incorrect auth.uid() usage

  2. Fixes
    - Update all RLS policies to use proper authentication checks
    - Ensure policies allow users to access their own data
    - Add missing policies where needed

  3. Tables to Fix
    - trackable_items
    - logged_entries
    - experiments
    - community_findings
    - finding_votes
    - finding_reports
*/

-- Fix trackable_items policies
DROP POLICY IF EXISTS "Users can manage own trackable items" ON trackable_items;
CREATE POLICY "Users can manage own trackable items"
  ON trackable_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix logged_entries policies
DROP POLICY IF EXISTS "Users can manage own logged entries" ON logged_entries;
CREATE POLICY "Users can manage own logged entries"
  ON logged_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix experiments policies
DROP POLICY IF EXISTS "Users can manage own experiments" ON experiments;
CREATE POLICY "Users can manage own experiments"
  ON experiments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix community_findings policies
DROP POLICY IF EXISTS "Anyone can read visible findings" ON community_findings;
DROP POLICY IF EXISTS "Users can read own findings" ON community_findings;
DROP POLICY IF EXISTS "Users can create findings" ON community_findings;
DROP POLICY IF EXISTS "Users can update own visible findings" ON community_findings;

-- Create comprehensive community_findings policies
CREATE POLICY "Users can read visible findings"
  ON community_findings
  FOR SELECT
  TO authenticated
  USING (status = 'visible');

CREATE POLICY "Users can read own findings"
  ON community_findings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create findings"
  ON community_findings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own findings"
  ON community_findings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Fix finding_votes policies
DROP POLICY IF EXISTS "Users can read all votes" ON finding_votes;
DROP POLICY IF EXISTS "Users can manage own votes" ON finding_votes;

CREATE POLICY "Users can read all votes"
  ON finding_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own votes"
  ON finding_votes
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix finding_reports policies
DROP POLICY IF EXISTS "Users can create reports" ON finding_reports;
DROP POLICY IF EXISTS "Users can read own reports" ON finding_reports;

CREATE POLICY "Users can create reports"
  ON finding_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own reports"
  ON finding_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled on all tables
ALTER TABLE trackable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE logged_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_reports ENABLE ROW LEVEL SECURITY;

-- Add debug function to check auth.uid()
CREATE OR REPLACE FUNCTION debug_auth_uid()
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;