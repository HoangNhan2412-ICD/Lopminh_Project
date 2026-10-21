-- Chỉ chạy trong DB thử nghiệm đã có auth.uid(), vai authenticated và 2 auth.users giả.
-- Các thay đổi test được rollback; không chạy trên database người dùng.
begin;
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.initialize_account(
  '{"fullName":"Người thử A","callName":"A","gender":"nu","school":"","team":"","subject":"Toán"}',
  '{"lm:chat:p":["A"],"lm:chatmem:p":"ghi nhớ A"}'
);
do $$begin
  if (select call_name from public.profiles) <> 'A' then raise exception 'PROFILE_FAILED'; end if;
  begin
    perform public.initialize_account('{"fullName":"X","callName":"X","gender":"nu"}','{}');
    raise exception 'INIT_REPEATED';
  exception when others then
    if sqlerrm <> 'ALREADY_INITIALIZED' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin
  if exists(select 1 from public.app_state) then raise exception 'READ_LEAK'; end if;
  if exists(select 1 from public.profiles) then raise exception 'PROFILE_LEAK'; end if;
  begin
    insert into public.app_state(user_id,key,value) values('11111111-1111-4111-8111-111111111111','lm:chat:p','[]');
    raise exception 'WRITE_LEAK';
  exception when insufficient_privilege then null;
  end;
end $$;
select public.initialize_account('{"fullName":"Người thử B","callName":"B","gender":"nam"}','{"lm:chat:p":["B"]}');
select public.save_app_profiles('[{"id":"22222222-2222-4222-8222-222222222222","fullName":"Người thử B","callName":"B mới","gender":"nam","yearsTeaching":3,"teachingStyle":{},"interests":[],"accent":"bang"}]');
do $$begin
  if (select call_name from public.profiles) <> 'B mới' then raise exception 'PROFILE_SYNC_FAILED'; end if;
end $$;
delete from public.app_state where key in ('lm:chat:p','lm:chatmem:p');
do $$begin
  if exists(select 1 from public.app_state where key='lm:chat:p') then raise exception 'DELETE_FAILED'; end if;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
  if (select value from public.app_state where key='lm:chat:p') <> '["A"]'::jsonb then raise exception 'CROSS_ACCOUNT_DELETE'; end if;
end $$;
reset role;
set role anon;
do $$begin
  begin
    perform * from public.app_state;
    raise exception 'ANON_LEAK';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
select 'RLS: owner isolation, denied cross-account write, real delete, profile sync, anonymous denial passed' as result;
