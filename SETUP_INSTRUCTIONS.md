# Keen Vocabulary Game - Setup Instructions

## 1. Supabase Configuration

Your project is already connected to Supabase. Follow these steps to complete the database setup:

### Step 1: Run SQL Migrations in Supabase Dashboard

1. Go to your Supabase dashboard → Click on your project
2. Navigate to the **SQL Editor** tab
3. Copy each of the following SQL scripts and execute them in order in the Supabase SQL Editor:

#### Script 1: Create Profiles Table
```sql
-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Create RLS policies for profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Create function to handle new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

#### Script 2: Create Game Tables
```sql
-- Create words table
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  definition text not null,
  example_sentence text,
  language text default 'en',
  difficulty text default 'medium',
  length int default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create game sessions table
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null,
  score int not null default 0,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user stats table
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  total_games_played int default 0,
  average_score float default 0,
  current_streak int default 0,
  best_streak int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null,
  unlocked boolean default false,
  unlocked_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on game tables
alter table public.words enable row level security;
alter table public.game_sessions enable row level security;
alter table public.user_stats enable row level security;
alter table public.achievements enable row level security;

-- RLS policies for words (public read for authenticated users)
create policy "words_select" on public.words
  for select using (true);

-- RLS policies for game sessions
create policy "game_sessions_select_own" on public.game_sessions
  for select using (auth.uid() = user_id);

create policy "game_sessions_insert_own" on public.game_sessions
  for insert with check (auth.uid() = user_id);

-- RLS policies for user stats
create policy "user_stats_select_own" on public.user_stats
  for select using (auth.uid() = user_id);

create policy "user_stats_update_own" on public.user_stats
  for update using (auth.uid() = user_id);

-- RLS policies for achievements
create policy "achievements_select_own" on public.achievements
  for select using (auth.uid() = user_id);
```

#### Script 3: Seed Initial Word Data
```sql
insert into public.words (word, definition, example_sentence, difficulty, length) values
('REACT', 'A JavaScript library for building user interfaces with component-based architecture', 'React makes it easy to create interactive UI applications', 'easy', 5),
('BEAST', 'A large or powerful wild animal', 'The beast roamed through the forest in search of prey', 'easy', 5),
('STOKE', 'To tend to a fire; to increase interest or excitement', 'The captain tried to stoke the flames of enthusiasm among the team', 'medium', 5),
('GLEAN', 'To collect information from various sources', 'She would glean knowledge from books and conversations alike', 'hard', 5),
('ABBEY', 'A religious community headed by an abbot or abbess', 'The ancient abbey stood magnificently on the hilltop', 'medium', 5),
('EVOKE', 'To bring or recall a feeling or memory', 'The old photograph evoked memories of childhood summers', 'medium', 5),
('APTLY', 'In a suitable or fitting manner', 'The author aptly named the character after his grandfather', 'hard', 5),
('ABODE', 'A place of residence; past tense of abide', 'The hermit chose the mountain cave as his abode', 'medium', 5),
('BADGE', 'A small emblem or token worn as identification', 'She wore her achievement badge with pride', 'easy', 5),
('BRUTE', 'A wild animal; a person who is cruel or insensitive', 'The brute force approach was not suitable for this problem', 'easy', 5);
```

### Step 2: Disable Email Confirmation (Development Only)

For development purposes, it's easier to disable email confirmation:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Policies**
3. Under "Require email confirmation before signing in", toggle to **OFF**

**Note:** For production, you should enable email confirmation and configure an email provider.

### Step 3: Verify Environment Variables

Your environment variables should be automatically set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Check your project settings (top right) → **Vars** section.

## 2. Running the Application

```bash
npm run dev
# or
pnpm dev
```

The app will start on `http://localhost:3000`

## 3. Database Schema Overview

### profiles
- User profile information
- Auto-created on signup via trigger
- RLS: Users can only see/edit their own profile

### words
- Vocabulary database for games
- Language, difficulty, definition, example
- Public read access for all authenticated users

### game_sessions
- Individual game play records
- Tracks game type, score, date
- RLS: Users see only their own sessions

### user_stats
- Aggregated user statistics
- Total games played, average score, best streak
- Updated via trigger after each game

### achievements
- Achievement definitions (locked/earned)
- RLS: Users see their own achievement progress

## 4. Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY not found"
- Check your environment variables in project settings
- Make sure Supabase integration is enabled

### "Email confirmation required"
- Disable email verification in Supabase → Authentication → Policies
- Or configure an email provider in Supabase dashboard

### Database tables not found
- Run all three SQL migration scripts in your Supabase SQL Editor
- Verify by checking the Tables list in Supabase dashboard

## 5. Next Steps

After setup:
1. Visit http://localhost:3000/auth/sign-up to create an account
2. Log in to access the home dashboard
3. Start playing games!
