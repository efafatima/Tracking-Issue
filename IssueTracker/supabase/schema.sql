create extension if not exists "pgcrypto";

do $$ begin
  create type user_role as enum ('Student', 'Faculty Member', 'HOD', 'DSA', 'Supervisor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type complaint_status as enum ('Submitted', 'In Progress', 'Resolved', 'Closed', 'Rejected', 'Escalated');
exception when duplicate_object then null; end $$;

do $$ begin
  create type complaint_category as enum ('Academic', 'Administrative', 'Facilities', 'Behavior-related', 'Other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type complaint_priority as enum ('Low', 'Medium', 'High', 'Urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type routed_role as enum ('HOD', 'DSA', 'Supervisor');
exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  role user_role not null default 'Student',
  department_id uuid,
  faculty_designation text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  hod_id uuid references profiles(id) on delete set null,
  dsa_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table profiles
    add constraint profiles_department_id_fkey
    foreign key (department_id) references departments(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists complaints (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete set null,
  title text not null,
  description text not null,
  category complaint_category not null,
  severity complaint_priority not null default 'Medium',
  priority complaint_priority not null default 'Medium',
  suggested_category complaint_category,
  suggested_priority complaint_priority,
  department_id uuid references departments(id) on delete set null,
  routed_to_role routed_role not null default 'HOD',
  is_anonymous boolean not null default false,
  status complaint_status not null default 'Submitted',
  assigned_teacher_id uuid references profiles(id) on delete set null,
  assigned_by_id uuid references profiles(id) on delete set null,
  teacher_comments text,
  deadline timestamptz,
  resolved_at timestamptz,
  rating integer check (rating between 1 and 5),
  feedback text,
  escalated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists complaint_attachments (
  id bigint generated always as identity primary key,
  complaint_id bigint not null references complaints(id) on delete cascade,
  file_path text not null,
  file_url text,
  file_type text default '',
  uploaded_at timestamptz not null default now()
);

create table if not exists complaint_comments (
  id bigint generated always as identity primary key,
  complaint_id bigint not null references complaints(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  description text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  complaint_id bigint references complaints(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  is_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists category_routes (
  id bigint generated always as identity primary key,
  category complaint_category not null,
  default_role routed_role not null,
  department_id uuid references departments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, department_id)
);

create table if not exists activity_logs (
  id bigint generated always as identity primary key,
  complaint_id bigint references complaints(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  old_value text,
  new_value text,
  ip_address inet,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at before update on profiles
for each row execute function set_updated_at();

drop trigger if exists set_departments_updated_at on departments;
create trigger set_departments_updated_at before update on departments
for each row execute function set_updated_at();

drop trigger if exists set_complaints_updated_at on complaints;
create trigger set_complaints_updated_at before update on complaints
for each row execute function set_updated_at();

drop trigger if exists set_category_routes_updated_at on category_routes;
create trigger set_category_routes_updated_at before update on category_routes
for each row execute function set_updated_at();

create index if not exists idx_profiles_role_department on profiles(role, department_id);
create index if not exists idx_complaints_user on complaints(user_id);
create index if not exists idx_complaints_department_route on complaints(department_id, routed_to_role);
create index if not exists idx_complaints_status_priority on complaints(status, priority);
create index if not exists idx_complaints_assignee on complaints(assigned_teacher_id);
create index if not exists idx_notifications_user_read on notifications(user_id, is_read);
create index if not exists idx_activity_logs_complaint on activity_logs(complaint_id);

insert into category_routes (category, default_role, department_id)
select *
from (values
  ('Academic'::complaint_category, 'HOD'::routed_role, null::uuid),
  ('Behavior-related'::complaint_category, 'HOD'::routed_role, null::uuid),
  ('Administrative'::complaint_category, 'DSA'::routed_role, null::uuid),
  ('Facilities'::complaint_category, 'HOD'::routed_role, null::uuid),
  ('Other'::complaint_category, 'HOD'::routed_role, null::uuid)
) as seed(category, default_role, department_id)
where not exists (
  select 1 from category_routes existing
  where existing.category = seed.category
    and existing.department_id is not distinct from seed.department_id
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-attachments',
  'complaint-attachments',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload complaint attachments" on storage.objects;
create policy "Authenticated users can upload complaint attachments" on storage.objects
for insert to authenticated
with check (bucket_id = 'complaint-attachments');

drop policy if exists "Anyone can read complaint attachments" on storage.objects;
create policy "Anyone can read complaint attachments" on storage.objects
for select
using (bucket_id = 'complaint-attachments');

alter table profiles enable row level security;
alter table departments enable row level security;
alter table complaints enable row level security;
alter table complaint_attachments enable row level security;
alter table complaint_comments enable row level security;
alter table notifications enable row level security;
alter table category_routes enable row level security;
alter table activity_logs enable row level security;

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles
for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
for update using (auth.uid() = id);

drop policy if exists "Authenticated users can read departments" on departments;
create policy "Authenticated users can read departments" on departments
for select using (auth.role() = 'authenticated');

drop policy if exists "Students can read own complaints" on complaints;
create policy "Students can read own complaints" on complaints
for select using (auth.uid() = user_id);

drop policy if exists "Students can create complaints" on complaints;
create policy "Students can create complaints" on complaints
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can read own notifications" on notifications;
create policy "Users can read own notifications" on notifications
for select using (auth.uid() = user_id);

-- Server-side Next.js API routes use the Supabase service-role key for
-- cross-role workflows, staff creation, analytics, and object-level checks.
