-- Marketing OS Phase B: persistence for Agency HQ (schema "hq"). Additive: does not touch "agency" or "public".
-- Isolation: every child row carries (agency_id, client_id) with a composite FK to hq.clients, so a row can never point at another agency's client.
-- Server code (service/postgres role) bypasses RLS and MUST pass agency_id explicitly; RLS protects every other path (PostgREST, direct logins).

create schema if not exists hq;

create table hq.clients (
  agency_id uuid not null references agency.agencies(id) on delete cascade,
  id text not null check (id ~ '^[a-z0-9][a-z0-9_-]{1,40}$'),
  name text not null check (char_length(name) between 1 and 120),
  kind text not null check (kind in ('client','personal_brand')),
  do_not_say jsonb not null default '[]'::jsonb,
  agent_permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (agency_id, id)
);

create table hq.facts (
  id text not null,
  agency_id uuid not null,
  client_id text not null,
  kb text not null check (kb in ('business','brand','audience','competitor','content','strategy','campaigns','performance','assets','requirements')),
  key text not null check (char_length(key) between 1 and 80),
  value text not null check (char_length(value) between 1 and 4000),
  status text not null check (status in ('VERIFIED','CLIENT-PROVIDED','RESEARCHED','INFERRED','ASSUMPTION','NEEDS VERIFICATION')),
  source text not null check (char_length(source) between 1 and 600),
  version int not null check (version >= 1),
  superseded_by text,
  created_at timestamptz not null default now(),
  primary key (agency_id, id),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);
create index on hq.facts (agency_id, client_id, kb);
-- at most one ACTIVE fact per (client, kb, key): versioning cannot fork
create unique index facts_one_active on hq.facts (agency_id, client_id, kb, key) where superseded_by is null;

create table hq.tasks (
  id text not null,
  agency_id uuid not null,
  client_id text not null,
  run_id text not null,
  description text not null,
  agent text not null,
  step text not null default 'agent',
  allow_partial boolean not null default false,
  priority text not null default 'normal' check (priority in ('high','normal','low')),
  status text not null check (status in ('PENDING','IN PROGRESS','WAITING FOR INPUT','WAITING FOR APPROVAL','UNDER REVIEW','COMPLETED','FAILED')),
  depends_on jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  output_path text,
  review_status text not null default 'NOT_REVIEWED' check (review_status in ('NOT_REVIEWED','APPROVED','REVISION_REQUESTED')),
  attempts int not null default 0,
  error text,
  created_at timestamptz not null default now(),
  primary key (agency_id, id),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);
create index on hq.tasks (agency_id, client_id, run_id);
create index on hq.tasks (agency_id, status);

create table hq.approvals (
  id text not null,
  agency_id uuid not null,
  client_id text not null,
  kind text not null check (kind in ('publish_post','launch_ad','spend_money','send_client_message','modify_production','other')),
  summary text not null,
  requested_by text not null,
  status text not null check (status in ('PENDING','APPROVED','REJECTED')),
  decided_at timestamptz,
  decided_by text,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (agency_id, id),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);
create index on hq.approvals (agency_id, status);

-- Reports / deliverables (text). Binary assets go to Supabase Storage (private bucket, path <agency>/<client>/...).
create table hq.outputs (
  agency_id uuid not null,
  client_id text not null,
  name text not null check (name ~ '^[\w.-]+$'),
  body text not null,
  updated_at timestamptz not null default now(),
  primary key (agency_id, client_id, name),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);

create table hq.activity_log (
  id bigint generated always as identity primary key,
  agency_id uuid not null references agency.agencies(id) on delete cascade,
  client_id text,
  actor text not null,
  action text not null,
  detail text not null default '',
  at timestamptz not null default now()
);
create index on hq.activity_log (agency_id, at desc);

create table hq.usage (
  id bigint generated always as identity primary key,
  agency_id uuid not null,
  client_id text,
  task_id text,
  agent text not null,
  provider text not null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cache_read_tokens int not null default 0,
  cost_usd numeric(12,6) not null default 0,
  at timestamptz not null default now(),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);
create index on hq.usage (agency_id, at desc);

-- ---------- immutability ----------
-- Facts are append-only: the only column that may change is superseded_by (NULL -> id).
create function hq.facts_guard() returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.id, new.agency_id, new.client_id, new.kb, new.key, new.value, new.status, new.source, new.version, new.created_at)
     is distinct from (old.id, old.agency_id, old.client_id, old.kb, old.key, old.value, old.status, old.source, old.version, old.created_at) then
    raise exception 'facts are append-only; create a new version instead';
  end if;
  if old.superseded_by is not null and new.superseded_by is distinct from old.superseded_by then
    raise exception 'superseded_by is already set';
  end if;
  return new;
end $$;
create trigger facts_guard before update on hq.facts for each row execute function hq.facts_guard();

-- Logs and usage are append-only for everyone (including the server role).
create function hq.no_mutation() returns trigger language plpgsql set search_path = '' as $$
begin raise exception '% is append-only', tg_table_name; end $$;
create trigger activity_no_update before update or delete on hq.activity_log for each row execute function hq.no_mutation();
create trigger usage_no_update before update or delete on hq.usage for each row execute function hq.no_mutation();

-- agency_id can never move
create trigger tasks_lock_agency before update on hq.tasks for each row execute function agency.lock_agency_id();
create trigger approvals_lock_agency before update on hq.approvals for each row execute function agency.lock_agency_id();
create trigger clients_lock_agency before update on hq.clients for each row execute function agency.lock_agency_id();

-- ---------- row level security: staff of the same agency only; clients/anon get nothing ----------
alter table hq.clients enable row level security;
alter table hq.facts enable row level security;
alter table hq.tasks enable row level security;
alter table hq.approvals enable row level security;
alter table hq.outputs enable row level security;
alter table hq.activity_log enable row level security;
alter table hq.usage enable row level security;

do $$
declare t text;
begin
  foreach t in array array['clients','facts','tasks','approvals','outputs'] loop
    execute format('create policy %I on hq.%I for select to authenticated using (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_sel', t);
    execute format('create policy %I on hq.%I for insert to authenticated with check (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_ins', t);
    execute format('create policy %I on hq.%I for update to authenticated using (agency_id = agency.current_agency_id() and agency.is_staff()) with check (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_upd', t);
  end loop;
  foreach t in array array['activity_log','usage'] loop
    execute format('create policy %I on hq.%I for select to authenticated using (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_sel', t);
    execute format('create policy %I on hq.%I for insert to authenticated with check (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_ins', t);
  end loop;
end $$;
-- Only the owner may delete clients/tasks/approvals; facts, outputs, logs and usage are never deleted by users.
create policy clients_del on hq.clients for delete to authenticated using (agency_id = agency.current_agency_id() and agency.is_owner());
create policy tasks_del on hq.tasks for delete to authenticated using (agency_id = agency.current_agency_id() and agency.is_owner());
create policy approvals_del on hq.approvals for delete to authenticated using (agency_id = agency.current_agency_id() and agency.is_owner());

grant usage on schema hq to authenticated;
grant select, insert, update on hq.clients, hq.facts, hq.tasks, hq.approvals, hq.outputs to authenticated;
grant delete on hq.clients, hq.tasks, hq.approvals to authenticated;
grant select, insert on hq.activity_log, hq.usage to authenticated;
grant usage on all sequences in schema hq to authenticated;
revoke all on all tables in schema hq from anon;
revoke usage on schema hq from anon;
