-- Update Dr. Sanath Kumar's specialization from Cardiology to Surgeon

UPDATE "Profile"
SET 
  specialization = 'General Surgery',
  "updatedAt" = NOW()
WHERE 
  "firstName" = 'Sanath' 
  AND "lastName" = 'Kumar'
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
