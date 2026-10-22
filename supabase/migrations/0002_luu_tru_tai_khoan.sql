-- Snapshot theo khóa giữ API useLocal; không sửa/bỏ các bảng 0001.
create table public.app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (length(key) <= 240 and key like 'lm:%'),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.app_state enable row level security;
create policy "chu tai khoan" on public.app_state for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke all on public.app_state from anon;
grant select, insert, update, delete on public.app_state to authenticated;
alter table public.students add column hoc_luc text check (hoc_luc in ('gioi','kha','trung-binh','yeu'));
alter table public.students add column noi_bat jsonb;
alter table public.student_notes add column evidence jsonb not null default '[]';

-- Hồ sơ lần đầu + dữ liệu được đồng ý chuyển nằm trong cùng giao dịch.
create or replace function public.initialize_account(p_profile jsonb, p_state jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  if exists(select 1 from public.app_state where user_id=uid and key='lm:account-setup') then
    raise exception 'ALREADY_INITIALIZED';
  end if;
  insert into public.profiles(user_id, full_name, call_name, gender, school, team, subject)
  values(uid, p_profile->>'fullName', p_profile->>'callName', p_profile->>'gender', p_profile->>'school', p_profile->>'team', p_profile->>'subject')
  on conflict(user_id) do update set full_name=excluded.full_name, call_name=excluded.call_name, gender=excluded.gender, school=excluded.school, team=excluded.team, subject=excluded.subject;
  insert into public.app_state(user_id,key,value)
    select uid, e.key, e.value from jsonb_each(p_state) e
    on conflict(user_id,key) do update set value=excluded.value, updated_at=now();
  insert into public.app_state(user_id,key,value) values(uid,'lm:account-setup','true')
    on conflict(user_id,key) do update set value='true', updated_at=now();
end $$;
revoke execute on function public.initialize_account(jsonb,jsonb) from public, anon;
grant execute on function public.initialize_account(jsonb,jsonb) to authenticated;

create or replace function public.save_app_profiles(p_profiles jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid(); p jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select v into p from jsonb_array_elements(p_profiles) v where v->>'id'=uid::text limit 1;
  if p is null then raise exception 'OWN_PROFILE_REQUIRED'; end if;
  update public.profiles set full_name=p->>'fullName', call_name=p->>'callName', gender=p->>'gender',
    honorific_override=p->>'honorificOverride', school=p->>'school', team=p->>'team', subject=p->>'subject',
    years_teaching=(p->>'yearsTeaching')::int, teaching_style=p->'teachingStyle',
    interests=ARRAY(select jsonb_array_elements_text(p->'interests')), accent=p->>'accent', updated_at=now() where user_id=uid;
  insert into public.app_state(user_id,key,value) values(uid,'lm:profiles',p_profiles)
    on conflict(user_id,key) do update set value=excluded.value,updated_at=now();
end $$;
revoke execute on function public.save_app_profiles(jsonb) from public, anon;
grant execute on function public.save_app_profiles(jsonb) to authenticated;
