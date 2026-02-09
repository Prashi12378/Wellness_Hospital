-- Add Dr. Nikhita and Dr. Pushpa to the database

-- First, create user accounts for the doctors
INSERT INTO "User" (id, name, email, "emailVerified", image, password)
VALUES 
  ('dr_nikhita_' || gen_random_uuid()::text, 'Dr. Nikhita', 'dr.nikhita@wellness-hospital.health', NULL, NULL, NULL),
  ('dr_pushpa_' || gen_random_uuid()::text, 'Dr. Pushpa', 'dr.pushpa@wellness-hospital.health', NULL, NULL, NULL)
ON CONFLICT (email) DO NOTHING;

-- Now create their doctor profiles
INSERT INTO "Profile" (
  id, 
  "userId", 
  "firstName", 
  "lastName", 
  email, 
  phone, 
  role, 
  specialization, 
  qualifications, 
  experience,
  "consultationFee",
  bio,
  "availableTimings",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid()::text,
  u.id,
  'Nikhita',
  '',
  'dr.nikhita@wellness-hospital.health',
  '6366662245',
  'doctor',
  'General Medicine',
  'MBBS',
  5,
  500,
  'Experienced general physician specializing in primary care and family medicine.',
  '[
    {"day": "Mon-Fri", "start": "09:00 AM", "end": "05:00 PM"},
    {"day": "Saturday", "start": "09:00 AM", "end": "01:00 PM"}
  ]'::jsonb,
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'dr.nikhita@wellness-hospital.health'
ON CONFLICT DO NOTHING;

INSERT INTO "Profile" (
  id, 
  "userId", 
  "firstName", 
  "lastName", 
  email, 
  phone, 
  role, 
  specialization, 
  qualifications, 
  experience,
  "consultationFee",
  bio,
  "availableTimings",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid()::text,
  u.id,
  'Pushpa',
  '',
  'dr.pushpa@wellness-hospital.health',
  '6366662245',
  'doctor',
  'Ayurveda',
  'BAMS',
  8,
  400,
  'Certified Ayurvedic practitioner with expertise in traditional medicine and holistic healing.',
  '[
    {"day": "Mon-Fri", "start": "10:00 AM", "end": "06:00 PM"},
    {"day": "Saturday", "start": "10:00 AM", "end": "02:00 PM"}
  ]'::jsonb,
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'dr.pushpa@wellness-hospital.health'
ON CONFLICT DO NOTHING;

-- Verify the doctors were added
SELECT 
  p."firstName", 
  p."lastName", 
  p.qualifications, 
  p.specialization,
  p.experience
FROM "Profile" p
WHERE p.role = 'doctor'
ORDER BY p."firstName";
