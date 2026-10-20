-- Lớp Mình V4 — bảng khởi tạo. Chưa được app dùng ở giai đoạn 1 (đang chạy dữ liệu demo trên trình duyệt).
-- Mọi bảng có user_id và RLS: giáo viên chỉ thấy dữ liệu của chính mình.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  call_name text not null,
  gender text not null check (gender in ('nam', 'nu')),
  honorific_override text,
  school text,
  team text,
  subject text,
  years_teaching int,
  teaching_style jsonb not null default '{"summary": "", "tags": []}',
  interests text[] not null default '{}',
  accent text not null default 'bang',
  font_scale text not null default 'vua',
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  role text not null check (role in ('chu-nhiem', 'bo-mon')),
  subject text not null
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  full_name text not null,
  short_name text not null,
  gender text check (gender in ('nam', 'nu')),
  traits text[] not null default '{}'
);

create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  raw_name text not null default '',
  kind text not null check (kind in ('chuyen-can', 'suc-khoe', 'tam-ly', 'hoc-tap', 'khen-thuong', 'khac')),
  text text not null,
  until date,
  absent_today boolean not null default false,
  source text not null check (source in ('giong-noi', 'go-tay', 'dong-bo')),
  created_at timestamptz not null default now()
);

create table if not exists public.timetable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weekday int not null check (weekday between 1 and 6),
  period int not null check (period between 1 and 10),
  starts time not null,
  ends time not null,
  class_id uuid not null references public.classes (id) on delete cascade,
  unique (user_id, weekday, period)
);

-- Bật RLS và chính sách "chỉ chủ tài khoản"
do $$
declare t text;
begin
  foreach t in array array['profiles', 'classes', 'students', 'student_notes', 'timetable'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "chu tai khoan" on public.%I', t);
    execute format(
      'create policy "chu tai khoan" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
  end loop;
end $$;

create index if not exists student_notes_class_idx on public.student_notes (user_id, class_id, created_at desc);
