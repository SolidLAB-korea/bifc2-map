create table if not exists public.stores (
  id text primary key,
  name text not null,
  category text not null,
  floor text not null check (floor in ('1F', '2F', '3F')),
  location text not null default '',
  hours text not null default '',
  phone text not null default '',
  description text not null default '',
  keywords jsonb not null default '[]'::jsonb,
  x numeric not null default 50,
  y numeric not null default 50,
  image text,
  route_anchor_id text,
  links jsonb not null default '{}'::jsonb,
  translations jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.stores
add column if not exists links jsonb not null default '{}'::jsonb;

alter table public.stores
add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.stores
add column if not exists route_anchor_id text;

create or replace function public.set_store_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists stores_set_updated_at on public.stores;
create trigger stores_set_updated_at
before update on public.stores
for each row
execute function public.set_store_updated_at();

alter table public.stores enable row level security;

drop policy if exists "Stores are readable by everyone" on public.stores;
create policy "Stores are readable by everyone"
on public.stores
for select
to anon
using (true);

drop policy if exists "Stores are writable by anon app clients" on public.stores;
create policy "Stores are writable by anon app clients"
on public.stores
for all
to anon
using (true)
with check (true);

create table if not exists public.route_settings (
  floor text primary key check (floor in ('1F', '2F', '3F')),
  route_graph jsonb,
  route_start_node_id text,
  walkable_mask jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_route_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists route_settings_set_updated_at on public.route_settings;
create trigger route_settings_set_updated_at
before update on public.route_settings
for each row
execute function public.set_route_settings_updated_at();

alter table public.route_settings enable row level security;

drop policy if exists "Route settings are readable by everyone" on public.route_settings;
create policy "Route settings are readable by everyone"
on public.route_settings
for select
to anon
using (true);

drop policy if exists "Route settings are writable by anon app clients" on public.route_settings;
create policy "Route settings are writable by anon app clients"
on public.route_settings
for all
to anon
using (true)
with check (true);
