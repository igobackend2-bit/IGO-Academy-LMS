-- ============================================================
-- IGO Academy — Supabase PostgreSQL Schema
-- ============================================================

-- OPTIONAL RESET (Uncomment the lines below to drop existing tables for a clean reinstall):
-- drop table if exists public.notifications cascade;
-- drop table if exists public.certificates cascade;
-- drop table if exists public.quiz_attempts cascade;
-- drop table if exists public.quiz_questions cascade;
-- drop table if exists public.quizzes cascade;
-- drop table if exists public.lesson_progress cascade;
-- drop table if exists public.enrollments cascade;
-- drop table if exists public.lessons cascade;
-- drop table if exists public.courses cascade;
-- drop table if exists public.categories cascade;
-- drop table if exists public.users cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text unique,
  phone       text unique,
  avatar_url  text,
  bio         text,
  fcm_token   text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null unique,
  description  text,
  icon_url     text,
  color_hex    text,
  course_count int  default 0,
  created_at   timestamptz default now() not null
);

-- ============================================================
-- COURSES
-- ============================================================
create table if not exists public.courses (
  id                     uuid primary key default uuid_generate_v4(),
  title                  text not null,
  description            text,
  thumbnail_url          text,
  category_id            uuid references public.categories(id) on delete set null,
  instructor_id          uuid references public.users(id) on delete set null,
  instructor_name        text,
  instructor_avatar_url  text,
  level                  text    not null default 'beginner'
                           check (level in ('beginner','intermediate','advanced')),
  status                 text    not null default 'draft'
                           check (status in ('draft','published','archived')),
  total_lessons          int     default 0,
  total_duration_seconds int     default 0,
  rating                 numeric(3,2) default 0.0,
  enrollment_count       int     default 0,
  is_featured            boolean default false,
  is_free                boolean default true,
  price                  numeric(10,2),
  tags                   text[]  default '{}',
  created_at             timestamptz default now() not null,
  updated_at             timestamptz default now() not null
);

-- ============================================================
-- LESSONS
-- ============================================================
create table if not exists public.lessons (
  id               uuid primary key default uuid_generate_v4(),
  course_id        uuid not null references public.courses(id) on delete cascade,
  title            text not null,
  description      text,
  type             text not null default 'video'
                     check (type in ('video','pdf','text','quiz')),
  order_index      int  not null default 0,
  duration_seconds int  default 0,
  video_url        text,
  pdf_url          text,
  content          text,
  is_preview       boolean default false,
  is_published     boolean default true,
  created_at       timestamptz default now() not null
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
create table if not exists public.enrollments (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade,
  course_id          uuid not null references public.courses(id) on delete cascade,
  status             text not null default 'active'
                       check (status in ('active','completed','dropped')),
  progress_percent   numeric(5,2) default 0.0,
  completed_lessons  int  default 0,
  enrolled_at        timestamptz default now() not null,
  completed_at       timestamptz,
  last_accessed_at   timestamptz,
  unique (user_id, course_id)
);

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
create table if not exists public.lesson_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz default now(),
  unique (user_id, lesson_id)
);

-- ============================================================
-- QUIZZES
-- ============================================================
create table if not exists public.quizzes (
  id                  uuid primary key default uuid_generate_v4(),
  course_id           uuid not null references public.courses(id) on delete cascade,
  lesson_id           uuid references public.lessons(id) on delete set null,
  title               text not null,
  description         text,
  total_questions     int  default 0,
  passing_score       int  default 60,
  time_limit_minutes  int  default 30,
  is_required         boolean default false,
  created_at          timestamptz default now() not null
);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
create table if not exists public.quiz_questions (
  id                   uuid primary key default uuid_generate_v4(),
  quiz_id              uuid not null references public.quizzes(id) on delete cascade,
  question             text not null,
  options              text[] not null,
  correct_option_index int  not null,
  explanation          text,
  order_index          int  default 0,
  points               int  default 1
);

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================
create table if not exists public.quiz_attempts (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade,
  quiz_id            uuid not null references public.quizzes(id) on delete cascade,
  score              int  not null default 0,
  total_points       int  not null default 0,
  is_passed          boolean not null default false,
  answers            jsonb default '{}',
  attempted_at       timestamptz default now() not null,
  time_taken_seconds int  default 0
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
create table if not exists public.certificates (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade,
  course_id          uuid not null references public.courses(id) on delete cascade,
  course_title       text not null,
  user_name          text,
  certificate_url    text,
  certificate_number text not null unique,
  issued_at          timestamptz default now() not null,
  unique (user_id, course_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  title      text not null,
  body       text not null,
  type       text not null default 'announcement'
               check (type in ('courseUpdate','newLesson','announcement','quiz','certificate')),
  target_id  uuid,
  is_read    boolean default false,
  created_at timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users       enable row level security;
alter table public.courses     enable row level security;
alter table public.lessons     enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts   enable row level security;
alter table public.certificates    enable row level security;
alter table public.notifications   enable row level security;

-- Users: can read/update own profile
create policy "Users: read own"   on public.users for select using (auth.uid() = id);
create policy "Users: update own" on public.users for update using (auth.uid() = id);
create policy "Users: insert own" on public.users for insert with check (auth.uid() = id);

-- Courses: publicly readable
create policy "Courses: public read" on public.courses for select using (status = 'published');

-- Lessons: readable if enrolled or lesson is preview
create policy "Lessons: public preview" on public.lessons for select
  using (is_preview = true or exists (
    select 1 from public.enrollments e
    where e.user_id = auth.uid() and e.course_id = lessons.course_id
  ));

-- Enrollments: own only
create policy "Enrollments: own" on public.enrollments
  for all using (auth.uid() = user_id);

-- Lesson progress: own only
create policy "Progress: own" on public.lesson_progress
  for all using (auth.uid() = user_id);

-- Quiz attempts: own only
create policy "QuizAttempts: own" on public.quiz_attempts
  for all using (auth.uid() = user_id);

-- Certificates: own only
create policy "Certificates: own" on public.certificates
  for select using (auth.uid() = user_id);

-- Notifications: own only
create policy "Notifications: own" on public.notifications
  for all using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_courses_category  on public.courses(category_id);
create index if not exists idx_courses_status    on public.courses(status);
create index if not exists idx_courses_featured  on public.courses(is_featured);
create index if not exists idx_lessons_course    on public.lessons(course_id);
create index if not exists idx_lessons_order     on public.lessons(course_id, order_index);
create index if not exists idx_enrollments_user  on public.enrollments(user_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

-- ============================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================

-- Create public storage buckets if they do not exist
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('lesson-videos', 'lesson-videos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('lesson-pdfs', 'lesson-pdfs', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- Policies for public access and uploads
create policy "Storage: Public Read" on storage.objects
  for select using (bucket_id in ('profile-images', 'course-images', 'lesson-videos', 'lesson-pdfs', 'certificates'));

create policy "Storage: Auth Upload" on storage.objects
  for insert with check (
    bucket_id in ('profile-images', 'course-images', 'lesson-videos', 'lesson-pdfs', 'certificates')
    and auth.role() = 'authenticated'
  );

create policy "Storage: Auth Update" on storage.objects
  for update using (
    bucket_id in ('profile-images', 'course-images', 'lesson-videos', 'lesson-pdfs', 'certificates')
    and auth.role() = 'authenticated'
  );

create policy "Storage: Auth Delete" on storage.objects
  for delete using (
    bucket_id in ('profile-images', 'course-images', 'lesson-videos', 'lesson-pdfs', 'certificates')
    and auth.role() = 'authenticated'
  );
