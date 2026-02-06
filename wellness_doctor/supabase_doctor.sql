
-- Doctor Portal Schema

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Prescriptions Table
create table if not exists prescriptions (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references appointments(id) on delete cascade,
  doctor_id uuid references profiles(id), -- Assuming current user is doctor
  doctor_name text not null,
  patient_id uuid references profiles(id),
  medicines jsonb not null default '[]'::jsonb, -- Array of objects: { name, dosage, frequency, duration, notes }
  additional_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ensure additional_notes exists (in case table was created without it)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'prescriptions' and column_name = 'additional_notes') then
    alter table prescriptions add column additional_notes text;
  end if; 
end $$;

-- RLS Policies
alter table prescriptions enable row level security;

-- Allow doctors to read/insert their own prescriptions
drop policy if exists "Doctors can view their prescriptions" on prescriptions;
create policy "Doctors can view their prescriptions"
  on prescriptions for select
  to authenticated
  using (true);

drop policy if exists "Doctors can create prescriptions" on prescriptions;
create policy "Doctors can create prescriptions"
  on prescriptions for insert
  to authenticated
  with check (true);

drop policy if exists "Doctors can update their prescriptions" on prescriptions;
create policy "Doctors can update their prescriptions"
  on prescriptions for update
  to authenticated
  using (true);

-- Allow doctors to update appointment status
drop policy if exists "Allow doctors to update appointment status" on appointments;
create policy "Allow doctors to update appointment status"
  on appointments for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Allow authenticated to view appointments" on appointments;
create policy "Allow authenticated to view appointments"
  on appointments for select
  to authenticated
  using (true);
