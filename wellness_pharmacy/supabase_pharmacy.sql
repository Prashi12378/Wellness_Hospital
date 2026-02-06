-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Pharmacy Inventory Table
create table if not exists pharmacy_inventory (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  batch_no text,
  expiry_date date,
  price numeric not null default 0,
  stock integer not null default 0,
  location text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Pharmacy Invoices Table
create table if not exists pharmacy_invoices (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text,
  doctor_name text,
  total_amount numeric not null default 0,
  payment_method text default 'CASH', -- CASH, UPI, CARD
  created_at timestamp with time zone default now()
);

-- 3. Pharmacy Invoice Items Table
create table if not exists pharmacy_invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references pharmacy_invoices(id) on delete cascade,
  medicine_id uuid references pharmacy_inventory(id),
  medicine_name text, -- Snapshot validation in case medicine is deleted
  quantity integer not null,
  price_per_unit numeric not null,
  total_price numeric not null
);

-- RLS Policies

-- Enable RLS
alter table pharmacy_inventory enable row level security;
alter table pharmacy_invoices enable row level security;
alter table pharmacy_invoice_items enable row level security;

-- Policies for Inventory
-- Allow read access to everyone (authenticated)
create policy "Allow read access to authenticated users"
  on pharmacy_inventory for select
  to authenticated
  using (true);

-- Allow insert/update/delete to pharmacists/admins
-- (Assuming public access for demo or specific role check if we had auth setup strictly)
-- For now, allowing authenticated users to manage (since role check is in UI)
create policy "Allow full access to authenticated users"
  on pharmacy_inventory for all
  to authenticated
  using (true)
  with check (true);


-- Policies for Invoices
create policy "Allow full access to authenticated users"
  on pharmacy_invoices for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow full access to authenticated users"
  on pharmacy_invoice_items for all
  to authenticated
  using (true)
  with check (true);
