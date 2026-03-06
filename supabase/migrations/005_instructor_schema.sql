-------------------------------------------------------------------
-- Extend courses table for instructor workflow
-------------------------------------------------------------------

alter table public.courses
  add column if not exists
    rejection_reason text,
  add column if not exists
    submitted_at timestamptz,
  add column if not exists
    approved_at timestamptz,
  add column if not exists
    total_revenue numeric default 0,
  add column if not exists
    promo_video_url text;

-------------------------------------------------------------------
-- Course announcements (instructor → enrolled students)
-------------------------------------------------------------------

create table if not exists public.course_announcements (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null
                references public.courses(id)
                on delete cascade,
  instructor_id uuid not null
                references public.profiles(id)
                on delete cascade,
  title       text not null,
  content     text not null,
  created_at  timestamptz default now()
);

alter table public.course_announcements
  enable row level security;

create policy "Instructors manage own announcements"
  on public.course_announcements
  for all
  using (auth.uid() = instructor_id);

create policy "Enrolled students view announcements"
  on public.course_announcements
  for select
  using (
    exists (
      select 1 from public.enrollments
      where course_id = course_announcements.course_id
      and student_id = auth.uid()
    )
  );

-------------------------------------------------------------------
-- Instructor earnings view (computed)
-------------------------------------------------------------------

create or replace view public.instructor_earnings as
select
  c.instructor_id,
  c.id          as course_id,
  c.title       as course_title,
  c.price       as course_price,
  count(oi.id)  as sales_count,
  sum(oi.unit_price) as gross_revenue,
  -- Platform takes 30%, instructor gets 70%
  sum(oi.unit_price) * 0.70 as net_revenue,
  date_trunc('month', o.created_at) as month
from public.courses c
join public.order_items oi
  on oi.course_id = c.id
  and oi.item_type = 'course'
join public.orders o
  on o.id = oi.order_id
  and o.status = 'paid'
where c.instructor_id is not null
group by
  c.instructor_id,
  c.id,
  c.title,
  c.price,
  date_trunc('month', o.created_at);

-------------------------------------------------------------------
-- RLS for instructor on their own courses
-------------------------------------------------------------------

-- Instructors can view/update their own courses
create policy "Instructors manage own courses"
  on public.courses
  for all
  using (auth.uid() = instructor_id);

-- Instructors can manage sections of own courses
create policy "Instructors manage own sections"
  on public.course_sections
  for all
  using (
    exists (
      select 1 from public.courses
      where id = course_sections.course_id
      and instructor_id = auth.uid()
    )
  );

-- Instructors can manage lectures of own courses
create policy "Instructors manage own lectures"
  on public.lectures
  for all
  using (
    exists (
      select 1 from public.course_sections cs
      join public.courses c on c.id = cs.course_id
      where cs.id = lectures.section_id
      and c.instructor_id = auth.uid()
    )
  );
