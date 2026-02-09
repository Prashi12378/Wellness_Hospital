-- Fix doctor name spelling and ensure proper ordering
-- 1. Change Nikhita to Nikitha
-- 2. Ensure Dr. Sanath Kumar appears first

-- Update Nikhita to Nikitha
UPDATE "Profile"
SET "firstName" = 'Nikitha'
WHERE "firstName" = 'Nikhita' AND role = 'doctor';

-- Add display order to ensure Dr. Sanath Kumar is always first
-- We'll use createdAt to control the order (earlier date = first)
-- Set Dr. Sanath Kumar's createdAt to be earliest
UPDATE "Profile"
SET "createdAt" = '2024-01-01 00:00:00'
WHERE "lastName" = 'Kumar' AND "firstName" = 'Sanath' AND role = 'doctor';

-- Set Nikitha's createdAt to be second
UPDATE "Profile"
SET "createdAt" = '2024-01-02 00:00:00'
WHERE "firstName" = 'Nikitha' AND role = 'doctor';

-- Set Dr. Pushpa's createdAt to be third
UPDATE "Profile"
SET "createdAt" = '2024-01-03 00:00:00'
WHERE "firstName" = 'Pushpa' AND role = 'doctor';

-- Verify the changes
SELECT "firstName", "lastName", specialization, "createdAt"
FROM "Profile"
WHERE role = 'doctor'
ORDER BY "createdAt" ASC;
