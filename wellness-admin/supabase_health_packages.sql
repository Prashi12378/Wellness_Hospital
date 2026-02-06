-- Create health_packages table
create table if not exists health_packages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    price numeric not null,
    original_price numeric not null,
    includes jsonb not null default '[]'::jsonb, -- Array of strings
    icon text not null default 'Stethoscope',
    popular boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table health_packages enable row level security;

-- Policies
create policy "Public packages are viewable by everyone"
    on health_packages for select
    using (true);

create policy "Admins can insert packages"
    on health_packages for insert
    with check ( auth.jwt() ->> 'role' = 'service_role' ); -- Or check for admin metadata if using client-side admin

create policy "Admins can update packages"
    on health_packages for update
    using ( auth.jwt() ->> 'role' = 'service_role' );

create policy "Admins can delete packages"
    on health_packages for delete
    using ( auth.jwt() ->> 'role' = 'service_role' );

-- Note: Since we use the service_role key in the Admin Portal API, we bypass RLS for admin operations.
-- These RLS policies ensures that the Hospital Portal (anon key) can ONLY read.
