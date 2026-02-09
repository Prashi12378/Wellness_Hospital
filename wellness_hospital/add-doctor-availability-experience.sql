-- Add availability and experience for Dr. Nikhita and Dr. Pushpa

-- Update Dr. Nikhita: 9am to 6pm, 3 years experience
UPDATE "Profile"
SET 
  experience = 3,
  "availableTimings" = '[
    {"day": "Mon-Fri", "start": "09:00 AM", "end": "06:00 PM"}
  ]'::jsonb,
  "updatedAt" = NOW()
WHERE 
  "firstName" = 'Nikhita'
  AND role = 'doctor';

-- Update Dr. Pushpa: 8pm to 8am, 2 years experience
UPDATE "Profile"
SET 
  experience = 2,
  "availableTimings" = '[
    {"day": "Mon-Fri", "start": "08:00 PM", "end": "08:00 AM"}
  ]'::jsonb,
  "updatedAt" = NOW()
WHERE 
  "firstName" = 'Pushpa'
  AND role = 'doctor';

-- Verify the updates
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
