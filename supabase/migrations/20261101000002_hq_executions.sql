-- Marketing OS Phase C: append-only execution history (one row per attempt of each task).
create table hq.executions (
  id text not null,
  agency_id uuid not null,
  task_id text not null,
  run_id text not null,
  client_id text not null,
  agent text not null,
  attempt int not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  outcome text not null check (outcome in ('ok','failed','retrying','waiting_approval')),
  mode text,
  model text,
  calls int not null default 0,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cost_usd numeric(12,6) not null default 0,
  error text,
  primary key (agency_id, id),
  foreign key (agency_id, client_id) references hq.clients(agency_id, id) on delete cascade
);
create index on hq.executions (agency_id, client_id, started_at desc);
create index on hq.executions (agency_id, run_id);
create trigger executions_no_mutation before update or delete on hq.executions for each row execute function hq.no_mutation();
alter table hq.executions enable row level security;
create policy executions_sel on hq.executions for select to authenticated using (agency_id = agency.current_agency_id() and agency.is_staff());
create policy executions_ins on hq.executions for insert to authenticated with check (agency_id = agency.current_agency_id() and agency.is_staff());
grant select, insert on hq.executions to authenticated;
revoke all on hq.executions from anon;
