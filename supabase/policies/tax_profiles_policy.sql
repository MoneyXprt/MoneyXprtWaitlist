-- Enable RLS
ALTER TABLE tax_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous select" ON tax_profiles;
DROP POLICY IF EXISTS "Allow anonymous insert" ON tax_profiles;

-- Create SELECT policy
CREATE POLICY "Allow anonymous select"
ON tax_profiles
FOR SELECT
USING (true);  -- This allows any user to SELECT

-- Create INSERT policy
CREATE POLICY "Allow anonymous insert"
ON tax_profiles
FOR INSERT
WITH CHECK (true);  -- This allows any user to INSERT