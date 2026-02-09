-- Remove experience years from Dr. Nikhita and Dr. Pushpa

UPDATE "Profile"
SET 
  experience = NULL,
  "updatedAt" = NOW()
WHERE 
  "firstName" IN ('Nikhita', 'Pushpa')
  AND role = 'doctor';

-- Verify the update
SELECT 
  p."firstName", 
  p."lastName", 
  p.qualifications, 
  p.specialization,
  p.experience
FROM "Profile" p
WHERE p.role = 'doctor'
ORDER BY p."firstName";
