-- Chỉ chạy trên database thử nghiệm; cần 0001–0003 và hai auth.users giả.
begin;
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into public.jobs(user_id,profile_id,request_id,kind) values
('11111111-1111-4111-8111-111111111111','demo','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','lesson');
do $$begin
  begin
    insert into public.jobs(user_id,profile_id,request_id,kind) values
    (auth.uid(),'demo','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','lesson');
    raise exception 'DUPLICATE_ACTIVE_JOB';
  exception when unique_violation then null;
  end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin
  if exists(select 1 from public.jobs) then raise exception 'JOB_READ_LEAK'; end if;
  begin
    insert into public.jobs(user_id,profile_id,request_id,kind) values
    ('11111111-1111-4111-8111-111111111111','other',gen_random_uuid(),'lesson');
    raise exception 'JOB_WRITE_LEAK';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
update public.jobs set status='xong',progress=100,result='{"title":"Bài thử"}';
do $$begin
  if (select result->>'title' from public.jobs) <> 'Bài thử' then raise exception 'RESULT_NOT_SAVED'; end if;
  begin
    insert into public.jobs(user_id,profile_id,request_id,kind) values
    (auth.uid(),'demo','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','lesson');
    raise exception 'REQUEST_NOT_IDEMPOTENT';
  exception when unique_violation then null;
  end;
end $$;
reset role;
set role anon;
do $$begin
  begin
    perform * from public.jobs;
    raise exception 'ANON_JOB_LEAK';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
select 'Jobs: RLS, unique active job, idempotency, persisted result, anonymous denial passed' as result;
