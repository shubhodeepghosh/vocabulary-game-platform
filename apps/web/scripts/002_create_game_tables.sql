-- Create word_lists table
create table if not exists public.word_lists (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  definition text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  word_category text,
  example_sentence text,
  pronunciation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_stats table
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  games_played integer default 0,
  games_won integer default 0,
  total_score integer default 0,
  average_accuracy numeric(5, 2) default 0,
  total_time_played integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create game_sessions table
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_type text not null check (game_type in ('wordle', 'word_match', 'flashcard', 'sentence_builder', 'rapid_fire')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  score integer not null,
  accuracy numeric(5, 2) not null,
  time_played integer,
  words_completed integer,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  game_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_streaks table
create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  current_streak integer default 1,
  longest_streak integer default 1,
  last_game_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create user_achievements table
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  title text not null,
  description text not null,
  icon_type text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- Enable RLS on all game tables
alter table public.word_lists enable row level security;
alter table public.user_stats enable row level security;
alter table public.game_sessions enable row level security;
alter table public.user_streaks enable row level security;
alter table public.user_achievements enable row level security;

-- RLS Policies for word_lists (public read)
create policy "word_lists_select_all" on public.word_lists
  for select using (true);

-- RLS Policies for user_stats (own data only)
create policy "user_stats_select_own" on public.user_stats
  for select using (auth.uid() = user_id);

create policy "user_stats_insert_own" on public.user_stats
  for insert with check (auth.uid() = user_id);

create policy "user_stats_update_own" on public.user_stats
  for update using (auth.uid() = user_id);

-- RLS Policies for game_sessions (own data only)
create policy "game_sessions_select_own" on public.game_sessions
  for select using (auth.uid() = user_id);

create policy "game_sessions_insert_own" on public.game_sessions
  for insert with check (auth.uid() = user_id);

-- RLS Policies for user_streaks (own data only)
create policy "user_streaks_select_own" on public.user_streaks
  for select using (auth.uid() = user_id);

create policy "user_streaks_insert_own" on public.user_streaks
  for insert with check (auth.uid() = user_id);

create policy "user_streaks_update_own" on public.user_streaks
  for update using (auth.uid() = user_id);

-- RLS Policies for user_achievements (own data only)
create policy "user_achievements_select_own" on public.user_achievements
  for select using (auth.uid() = user_id);

create policy "user_achievements_insert_own" on public.user_achievements
  for insert with check (auth.uid() = user_id);

-- Create indices for performance
create index idx_user_stats_user_id on public.user_stats(user_id);
create index idx_game_sessions_user_id on public.game_sessions(user_id);
create index idx_game_sessions_completed_at on public.game_sessions(completed_at);
create index idx_user_streaks_user_id on public.user_streaks(user_id);
create index idx_user_achievements_user_id on public.user_achievements(user_id);
create index idx_word_lists_difficulty on public.word_lists(difficulty);
