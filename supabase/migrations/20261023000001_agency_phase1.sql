-- Agency OS Phase 1: agencies, staff/client profiles, clients, audit log.
-- Lives in its own schema so the Academy tables in "public" are untouched.

create schema if not exists agency;

-- ---------- tables ----------
create table agency.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now()
);

-- A row here is what grants Agency OS access. Academy students have no row, so they get nothing.
create table agency.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid not null references agency.agencies(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  role text not null check (role in ('owner','member','client')),
  created_at timestamptz not null default now()
);
create index on agency.profiles (agency_id);

create table agency.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agency.agencies(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  industry text check (char_length(industry) <= 80),
  city text check (char_length(city) <= 80),
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on agency.clients (agency_id);

create table agency.client_users (
  user_id uuid not null references agency.profiles(id) on delete cascade,
  client_id uuid not null references agency.clients(id) on delete cascade,
  agency_id uuid not null references agency.agencies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, client_id)
);
create index on agency.client_users (client_id);

create table agency.audit_logs (
  id bigint generated always as identity primary key,
  agency_id uuid not null references agency.agencies(id) on delete cascade,
  actor_type text not null check (actor_type in ('user','agent','system')),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) <= 120),
  entity text not null check (char_length(entity) <= 80),
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on agency.audit_logs (agency_id, created_at desc);

-- ---------- helper functions (security definer so RLS policies don't recurse) ----------
create function agency.current_agency_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select agency_id from agency.profiles where id = auth.uid()
$$;

create function agency.current_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from agency.profiles where id = auth.uid()
$$;

create function agency.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select role in ('owner','member') from agency.profiles where id = auth.uid()), false)
$$;

create function agency.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select role = 'owner' from agency.profiles where id = auth.uid()), false)
$$;

create function agency.my_client_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select client_id from agency.client_users where user_id = auth.uid()
$$;

create function agency.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create trigger clients_touch before update on agency.clients
for each row execute function agency.touch_updated_at();

-- Block changing which agency a row belongs to.
create function agency.lock_agency_id() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.agency_id is distinct from old.agency_id then
    raise exception 'agency_id cannot be changed';
  end if;
  return new;
end $$;
create trigger clients_lock_agency before update on agency.clients
for each row execute function agency.lock_agency_id();
create trigger profiles_lock_agency before update on agency.profiles
for each row execute function agency.lock_agency_id();

-- ---------- row level security ----------
alter table agency.agencies enable row level security;
alter table agency.profiles enable row level security;
alter table agency.clients enable row level security;
alter table agency.client_users enable row level security;
alter table agency.audit_logs enable row level security;

-- agencies
create policy agencies_select on agency.agencies for select to authenticated
  using (id = agency.current_agency_id());
create policy agencies_update on agency.agencies for update to authenticated
  using (id = agency.current_agency_id() and agency.is_owner())
  with check (id = agency.current_agency_id() and agency.is_owner());

-- profiles: staff see their agency; everyone sees themselves; only owner manages
create policy profiles_select on agency.profiles for select to authenticated
  using (id = auth.uid() or (agency_id = agency.current_agency_id() and agency.is_staff()));
create policy profiles_owner_update on agency.profiles for update to authenticated
  using (agency_id = agency.current_agency_id() and agency.is_owner())
  with check (agency_id = agency.current_agency_id() and agency.is_owner());

-- clients: staff manage in own agency; client logins see only their own client(s)
create policy clients_select on agency.clients for select to authenticated
  using (
    (agency_id = agency.current_agency_id() and agency.is_staff())
    or id in (select agency.my_client_ids())
  );
create policy clients_insert on agency.clients for insert to authenticated
  with check (agency_id = agency.current_agency_id() and agency.is_staff());
create policy clients_update on agency.clients for update to authenticated
  using (agency_id = agency.current_agency_id() and agency.is_staff())
  with check (agency_id = agency.current_agency_id() and agency.is_staff());
create policy clients_delete on agency.clients for delete to authenticated
  using (agency_id = agency.current_agency_id() and agency.is_owner());

-- client_users
create policy client_users_select on agency.client_users for select to authenticated
  using (user_id = auth.uid() or (agency_id = agency.current_agency_id() and agency.is_staff()));
create policy client_users_owner_write on agency.client_users for all to authenticated
  using (agency_id = agency.current_agency_id() and agency.is_owner())
  with check (agency_id = agency.current_agency_id() and agency.is_owner());

-- audit_logs: staff may add entries for their agency; only the owner reads; nobody edits or deletes
create policy audit_insert on agency.audit_logs for insert to authenticated
  with check (
    agency_id = agency.current_agency_id()
    and agency.is_staff()
    and actor_type = 'user'
    and actor_user_id = auth.uid()
  );
create policy audit_select on agency.audit_logs for select to authenticated
  using (agency_id = agency.current_agency_id() and agency.is_owner());

-- ---------- privileges ----------
revoke all on all tables in schema agency from public, anon, authenticated;
revoke all on all functions in schema agency from public, anon;
grant usage on schema agency to authenticated;
grant select, update on agency.agencies to authenticated;
grant select, update on agency.profiles to authenticated;
grant select, insert, update, delete on agency.clients to authenticated;
grant select, insert, update, delete on agency.client_users to authenticated;
grant select, insert on agency.audit_logs to authenticated;
grant execute on function
  agency.current_agency_id(), agency.current_role(), agency.is_staff(),
  agency.is_owner(), agency.my_client_ids()
  to authenticated;
