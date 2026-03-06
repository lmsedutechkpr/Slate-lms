-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUM for user roles
create type user_role as enum ('student', 'instructor', 'vendor', 'admin');

-- ENUM for approval status
create type approval_status as enum ('pending', 'approved', 'rejected');

-- ENUM for preferred language
create type preferred_language as enum ('en', 'ta');

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'student',
  approval_status approval_status default 'approved',
  preferred_language preferred_language default 'en',
  interests text[] default '{}',
  bio text,
  is_onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(
      (new.raw_user_meta_data->>'role')::user_role,
      'student'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at auto-update trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure update_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
