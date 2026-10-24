-- Tenant isolation test. Runs inside one block and ALWAYS rolls back (it ends by raising).
-- Expected final message: "RLS_TEST_PASSED (rolled back)". Any other message is a failure.
do $$
declare
  a_agency uuid := gen_random_uuid(); b_agency uuid := gen_random_uuid();
  a_owner uuid := gen_random_uuid(); a_member uuid := gen_random_uuid();
  a_client_user uuid := gen_random_uuid(); b_owner uuid := gen_random_uuid();
  academy_student uuid := gen_random_uuid();
  a_c1 uuid := gen_random_uuid(); a_c2 uuid := gen_random_uuid(); b_c1 uuid := gen_random_uuid();
  n int;
begin
  insert into auth.users (id, email, aud, role) values
    (a_owner,'a_owner@test.invalid','authenticated','authenticated'),
    (a_member,'a_member@test.invalid','authenticated','authenticated'),
    (a_client_user,'a_client@test.invalid','authenticated','authenticated'),
    (b_owner,'b_owner@test.invalid','authenticated','authenticated'),
    (academy_student,'student@test.invalid','authenticated','authenticated');
  insert into agency.agencies (id,name) values (a_agency,'A'),(b_agency,'B');
  insert into agency.profiles (id,agency_id,role) values
    (a_owner,a_agency,'owner'),(a_member,a_agency,'member'),
    (a_client_user,a_agency,'client'),(b_owner,b_agency,'owner');
  insert into agency.clients (id,agency_id,name) values
    (a_c1,a_agency,'A client 1'),(a_c2,a_agency,'A client 2'),(b_c1,b_agency,'B client 1');
  insert into agency.client_users (user_id,client_id,agency_id) values (a_client_user,a_c1,a_agency);

  set local role authenticated;

  -- Agency A owner sees only A
  perform set_config('request.jwt.claims', json_build_object('sub',a_owner,'role','authenticated')::text, true);
  select count(*) into n from agency.clients; assert n = 2, 'owner A should see 2 clients, saw '||n;
  select count(*) into n from agency.clients where id = b_c1; assert n = 0, 'A must not see B client';
  select count(*) into n from agency.agencies; assert n = 1, 'A sees only own agency';

  -- Agency B owner sees only B
  perform set_config('request.jwt.claims', json_build_object('sub',b_owner,'role','authenticated')::text, true);
  select count(*) into n from agency.clients; assert n = 1, 'owner B should see 1 client';
  select count(*) into n from agency.clients where agency_id = a_agency; assert n = 0, 'B must not see A';

  -- B cannot insert a client into A
  begin
    insert into agency.clients (agency_id,name) values (a_agency,'evil'); assert false, 'B inserted into A';
  exception when insufficient_privilege or check_violation then null; end;

  -- Client login sees only own client, no staff data
  perform set_config('request.jwt.claims', json_build_object('sub',a_client_user,'role','authenticated')::text, true);
  select count(*) into n from agency.clients; assert n = 1, 'client user sees exactly 1 client';
  select count(*) into n from agency.clients where id = a_c2; assert n = 0, 'client user must not see other client';
  select count(*) into n from agency.profiles; assert n = 1, 'client user sees only own profile';
  update agency.clients set name='hacked' where id = a_c1; get diagnostics n = row_count;
  assert n = 0, 'client user must not edit clients';

  -- Member (staff) can edit but not delete clients; cannot read audit log
  perform set_config('request.jwt.claims', json_build_object('sub',a_member,'role','authenticated')::text, true);
  update agency.clients set name='renamed' where id = a_c1; get diagnostics n = row_count; assert n = 1, 'member can edit';
  delete from agency.clients where id = a_c2; get diagnostics n = row_count; assert n = 0, 'member cannot delete';
  insert into agency.audit_logs (agency_id,actor_type,actor_user_id,action,entity)
    values (a_agency,'user',a_member,'client.update','client');
  select count(*) into n from agency.audit_logs; assert n = 0, 'member cannot read audit log';
  begin
    insert into agency.audit_logs (agency_id,actor_type,actor_user_id,action,entity)
      values (a_agency,'user',a_owner,'forged','client'); assert false, 'forged actor accepted';
  exception when insufficient_privilege or check_violation then null; end;

  -- Owner reads audit log, cannot edit or delete it
  perform set_config('request.jwt.claims', json_build_object('sub',a_owner,'role','authenticated')::text, true);
  select count(*) into n from agency.audit_logs; assert n = 1, 'owner reads audit log';
  begin
    update agency.audit_logs set action='x'; assert false, 'audit update allowed';
  exception when insufficient_privilege then null; end;

  -- Academy student (no agency profile) sees nothing
  perform set_config('request.jwt.claims', json_build_object('sub',academy_student,'role','authenticated')::text, true);
  select count(*) into n from agency.clients; assert n = 0, 'student sees no clients';
  select count(*) into n from agency.agencies; assert n = 0, 'student sees no agencies';
  select count(*) into n from agency.profiles; assert n = 0, 'student sees no profiles';

  reset role;
  raise exception 'RLS_TEST_PASSED (rolled back)';
end $$;
