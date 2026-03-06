-- Course difficulty enum
create type course_difficulty as enum 
  ('beginner', 'intermediate', 'advanced');

-- Course status enum  
create type course_status as enum 
  ('draft', 'published', 'archived');

-- Language enum
create type content_language as enum ('en', 'ta', 'both');

-- Categories table
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_ta text,
  slug text unique not null,
  icon text,
  color text,
  description text,
  created_at timestamptz default now()
);

-- Courses table
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  title_ta text,
  slug text unique not null,
  description text,
  description_ta text,
  thumbnail_url text,
  preview_video_url text,
  instructor_id uuid references public.profiles(id),
  category_id uuid references public.categories(id),
  difficulty course_difficulty default 'beginner',
  language content_language default 'en',
  status course_status default 'draft',
  price numeric(10,2) default 0,
  duration_minutes integer default 0,
  total_lectures integer default 0,
  tags text[] default '{}',
  requirements text[] default '{}',
  what_you_learn text[] default '{}',
  rating numeric(3,2) default 0,
  rating_count integer default 0,
  enrollment_count integer default 0,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enrollments table
create table public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  progress_percent integer default 0,
  last_accessed_at timestamptz,
  unique(student_id, course_id)
);

-- Course sections (chapters)
create table public.course_sections (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  title_ta text,
  order_index integer not null,
  created_at timestamptz default now()
);

-- Lectures table
create table public.lectures (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid references public.course_sections(id) 
    on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  title_ta text,
  description text,
  video_url text,
  duration_minutes integer default 0,
  order_index integer not null,
  is_free_preview boolean default false,
  resources jsonb default '[]',
  created_at timestamptz default now()
);

-- Lecture progress
create table public.lecture_progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) on delete cascade,
  lecture_id uuid references public.lectures(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  is_completed boolean default false,
  watch_time_seconds integer default 0,
  completed_at timestamptz,
  unique(student_id, lecture_id)
);

-- Wishlist table
create table public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  added_at timestamptz default now(),
  unique(student_id, course_id)
);

-- Course reviews
create table public.course_reviews (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(course_id, student_id)
);

-- Triggers for updated_at on courses
create trigger courses_updated_at
  before update on public.courses
  for each row execute procedure update_updated_at();

-- Row Level Security
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.categories enable row level security;
alter table public.lectures enable row level security;
alter table public.lecture_progress enable row level security;
alter table public.wishlist enable row level security;
alter table public.course_reviews enable row level security;
alter table public.course_sections enable row level security;

-- Courses: published courses visible to all
create policy "Anyone can view published courses"
  on public.courses for select
  using (status = 'published');

-- Instructors can manage their own courses
create policy "Instructors manage own courses"
  on public.courses for all
  using (instructor_id = auth.uid());

-- Categories: readable by all
create policy "Anyone can view categories"
  on public.categories for select using (true);

-- Enrollments: students see their own
create policy "Students view own enrollments"
  on public.enrollments for select
  using (student_id = auth.uid());

create policy "Students can enroll"
  on public.enrollments for insert
  with check (student_id = auth.uid());

-- Lectures: free previews visible to all, 
--           rest only to enrolled students
create policy "Free preview lectures visible to all"
  on public.lectures for select
  using (is_free_preview = true);

create policy "Enrolled students can view lectures"
  on public.lectures for select
  using (
    exists (
      select 1 from public.enrollments
      where student_id = auth.uid()
      and course_id = lectures.course_id
    )
  );

-- Lecture progress: own only
create policy "Students manage own progress"
  on public.lecture_progress for all
  using (student_id = auth.uid());

-- Wishlist: own only
create policy "Students manage own wishlist"
  on public.wishlist for all
  using (student_id = auth.uid());

-- Reviews: all can read, enrolled students can write
create policy "Anyone can read reviews"
  on public.course_reviews for select using (true);

create policy "Enrolled students can review"
  on public.course_reviews for insert
  with check (
    exists (
      select 1 from public.enrollments
      where student_id = auth.uid()
      and course_id = course_reviews.course_id
    )
  );

-- SEED DATA: Insert 6 categories
insert into public.categories 
  (name, name_ta, slug, icon, color) values
  ('Technology',  'தொழில்நுட்பம்', 'technology',  
    'Cpu',         'indigo'),
  ('Design',      'வடிவமைப்பு',    'design',       
    'Palette',     'pink'),
  ('Business',    'வணிகம்',        'business',     
    'Briefcase',   'amber'),
  ('Science',     'அறிவியல்',      'science',      
    'FlaskConical','emerald'),
  ('Languages',   'மொழிகள்',       'languages',    
    'Languages',   'blue'),
  ('Health',      'உடல்நலம்',      'health',       
    'Heart',       'red');

-- SEED DATA: Insert 8 dummy published courses
insert into public.courses 
  (title, title_ta, slug, description, difficulty, price, rating, rating_count, enrollment_count, is_featured, status, category_id)
values
  ('Complete Web Development Bootcamp', 'முழுமையான இணைய மேம்பாட்டு பயிற்சி', 'complete-web-dev', 'Learn HTML, CSS, JS, React and Node.', 'beginner', 0, 4.8, 120, 500, true, 'published', (select id from categories where slug = 'technology')),
  ('UI/UX Design Masterclass', 'UI/UX வடிவமைப்பு மாஸ்டர்கிளாஸ்', 'ui-ux-masterclass', 'Master Figma and design principles.', 'intermediate', 999, 4.9, 85, 320, true, 'published', (select id from categories where slug = 'design')),
  ('Python for Data Science', 'தரவு அறிவியலுக்கான பைதான்', 'python-data-science', 'Data analysis with Pandas and Numpy.', 'intermediate', 1499, 4.7, 95, 210, true, 'published', (select id from categories where slug = 'technology')),
  ('Digital Marketing Fundamentals', 'டிஜிட்டல் மார்க்கெட்டிங் அடிப்படைகள்', 'digital-marketing', 'SEO, SEM and social media marketing.', 'beginner', 0, 4.5, 60, 450, false, 'published', (select id from categories where slug = 'business')),
  ('Tamil Language for Beginners', 'ஆரம்பநிலைக்கான தமிழ் மொழி', 'tamil-beginners', 'Learn to speak and write Tamil.', 'beginner', 499, 4.9, 40, 150, false, 'published', (select id from categories where slug = 'languages')),
  ('Graphic Design with Figma', 'ஃபிக்மாவுடன் கிராஃபிக் வடிவமைப்பு', 'graphic-design-figma', 'Create stunning graphics for web.', 'beginner', 799, 4.6, 50, 180, false, 'published', (select id from categories where slug = 'design')),
  ('Business Analytics', 'வணிக பகுப்பாய்வு', 'business-analytics', 'Data-driven decision making.', 'advanced', 1999, 4.8, 30, 90, false, 'published', (select id from categories where slug = 'business')),
  ('Yoga & Mindfulness', 'யோகா மற்றும் மனநிறைவு', 'yoga-mindfulness', 'Daily yoga for a healthy life.', 'beginner', 0, 4.9, 110, 600, false, 'published', (select id from categories where slug = 'health'));
