-- Marketing OS: autonomous operations. Runs (one instruction = one run), deliverables with version history,
-- durable job queue, schedules, per-agency settings. Same isolation model as hq.* (agency_id, client_id composite keys + RLS).
alter table hq.tasks add column kind text, add column params jsonb;
alter table hq.approvals add column ref text;

create table hq.runs (
  id text not null, agency_id uuid not null, client_id text not null,
  instruction text not null, objective text not null,
  status text not null check (status in ('PLANNED','AWAITING_PLAN_APPROVAL','QUEUED','RUNNING','COMPLETED','FAILED','CANCELLED')),
  plan jsonb not null, est_cost_usd numeric(12,6) not null default 0, auto_approved boolean not null default false,
  created_by text not null, schedule_id text, created_at timestamptz not null default now(), started_at timestamptz, completed_at timestamptz,
  primary key (agency_id, id),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);
create index on hq.runs (agency_id, client_id, created_at desc);

create table hq.deliverables (
  id text not null, agency_id uuid not null, client_id text not null, run_id text, task_id text,
  kind text not null, title text not null, agent text not null,
  status text not null check (status in ('draft','in_review','approved','changes_requested','rejected')),
  current_version int not null default 1, qa jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key (agency_id, id),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);
create index on hq.deliverables (agency_id, client_id, kind);
create index on hq.deliverables (agency_id, run_id);

create table hq.deliverable_versions (
  agency_id uuid not null, deliverable_id text not null, version int not null,
  body jsonb not null, note text not null default '', created_by text not null, created_at timestamptz not null default now(),
  primary key (agency_id, deliverable_id, version),
  foreign key (agency_id, deliverable_id) references hq.deliverables(agency_id, id) on delete cascade
);

create table hq.jobs (
  id text not null, agency_id uuid not null, kind text not null, run_id text not null,
  status text not null check (status in ('queued','leased','done','failed')),
  run_after timestamptz not null default now(), attempts int not null default 0, lease_until timestamptz, error text,
  created_at timestamptz not null default now(),
  primary key (agency_id, id)
);
create index on hq.jobs (agency_id, status, run_after);

create table hq.schedules (
  id text not null, agency_id uuid not null, client_id text not null, name text not null, instruction text not null,
  cadence text not null, enabled boolean not null default true, next_run_at timestamptz not null, last_run_at timestamptz, last_run_id text,
  created_at timestamptz not null default now(),
  primary key (agency_id, id),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);

create table hq.settings (
  agency_id uuid not null references agency.agencies(id) on delete cascade, key text not null, value jsonb not null, updated_at timestamptz not null default now(),
  primary key (agency_id, key)
);

create trigger deliverable_versions_append_only before update or delete on hq.deliverable_versions for each row execute function hq.no_mutation();
create trigger runs_lock_agency before update on hq.runs for each row execute function agency.lock_agency_id();
create trigger deliverables_lock_agency before update on hq.deliverables for each row execute function agency.lock_agency_id();

do $$
declare t text;
begin
  foreach t in array array['runs','deliverables','deliverable_versions','jobs','schedules','settings'] loop
    execute format('alter table hq.%I enable row level security', t);
    execute format('create policy %I on hq.%I for select to authenticated using (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_sel', t);
    execute format('create policy %I on hq.%I for insert to authenticated with check (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_ins', t);
    if t <> 'deliverable_versions' then
      execute format('create policy %I on hq.%I for update to authenticated using (agency_id = agency.current_agency_id() and agency.is_staff()) with check (agency_id = agency.current_agency_id() and agency.is_staff())', t||'_upd', t);
    end if;
    execute format('revoke all on hq.%I from anon', t);
  end loop;
end $$;
grant select, insert, update on hq.runs, hq.deliverables, hq.jobs, hq.schedules, hq.settings to authenticated;
grant select, insert on hq.deliverable_versions to authenticated;
