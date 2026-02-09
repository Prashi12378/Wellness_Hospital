-- Remove availability timings from Dr. Nikhita and Dr. Pushpa

UPDATE "Profile"
SET 
  "availableTimings" = NULL,
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
  p.experience,
  p."availableTimings"
FROM "Profile" p
WHERE p.role = 'doctor'
ORDER BY p."firstName";
