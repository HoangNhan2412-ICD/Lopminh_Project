create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  request_id uuid not null,
  kind text not null check(kind='lesson'),
  status text not null default 'cho' check(status in ('cho','dang-chay','xong','loi')),
  progress integer not null default 0 check(progress between 0 and 100),
  step text not null default 'Đang chờ',
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, request_id)
);
alter table public.jobs enable row level security;
create policy "chu tai khoan" on public.jobs for all to authenticated
  using (auth.uid()=user_id) with check (auth.uid()=user_id);
revoke all on public.jobs from anon;
grant select,insert,update,delete on public.jobs to authenticated;
create index jobs_owner_created on public.jobs(user_id,profile_id,created_at desc);
create unique index jobs_one_active on public.jobs(user_id,profile_id) where status in ('cho','dang-chay');
