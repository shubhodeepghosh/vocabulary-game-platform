# Keen Vocabulary Platform - Next Steps

Your complete vocabulary gaming platform is ready! Follow these steps to get it running.

## Step 1: Database Setup (5 minutes)

This is the only manual step required.

### 1a. Open Supabase SQL Editor

1. Log in to your Supabase project at https://supabase.com
2. Click on your project
3. Go to the **SQL Editor** tab on the left sidebar

### 1b. Run the Three SQL Scripts

Copy each SQL script below and paste it into a new Supabase SQL query, then click "Run":

**Script 1: Profiles Table & Trigger**

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

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

**Script 2: Game Tables**

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

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null,
  score int not null default 0,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null,
  unlocked boolean default false,
  unlocked_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.words enable row level security;
alter table public.game_sessions enable row level security;
alter table public.user_stats enable row level security;
alter table public.achievements enable row level security;

create policy "words_select" on public.words
  for select using (true);

create policy "game_sessions_select_own" on public.game_sessions
  for select using (auth.uid() = user_id);

create policy "game_sessions_insert_own" on public.game_sessions
  for insert with check (auth.uid() = user_id);

create policy "user_stats_select_own" on public.user_stats
  for select using (auth.uid() = user_id);

create policy "user_stats_update_own" on public.user_stats
  for update using (auth.uid() = user_id);

create policy "achievements_select_own" on public.achievements
  for select using (auth.uid() = user_id);
```

**Script 3: Seed Words**

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

### 1c. Verify Tables Created

1. In Supabase, click on **Table Editor** in the left sidebar
2. You should see these tables:
   - `profiles`
   - `words`
   - `game_sessions`
   - `user_stats`
   - `achievements`

### 1d. Disable Email Confirmation (Optional - for Development)

1. Go to **Authentication** → **Policies**
2. Find "Require email confirmation before signing in"
3. Toggle it **OFF**

This allows instant signup without email verification (for testing).

## Step 2: Verify Environment Variables

1. Click the **Settings** button in the top right of v0
2. Go to the **Vars** section
3. You should see:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

If any are missing, add them from your Supabase project settings.

## Step 3: Start the Development Server

The app automatically starts when you save files. If not:

1. Open the Preview (click the Version Box in top right)
2. Or manually run: `pnpm dev`
3. App will be at http://localhost:3000

## Step 4: Test the Application

### Create an Account
1. Go to http://localhost:3000/auth/sign-up
2. Enter email and password
3. Click Sign Up
4. You're automatically logged in!

### Try the Dashboard
- View your stats (0 games, 0% average)
- See all available games
- Notice the premium design with your custom color scheme

### Play Wordle
1. Click "Choose a Game" → "Wordle" on dashboard
2. Or go to Games → Wordle
3. Read the hint (word definition)
4. Guess a 5-letter word
5. Get color feedback:
   - 🟩 Green = correct letter in correct position
   - 🟨 Yellow = correct letter in wrong position
   - ⬜ Gray = letter not in word
6. Complete the game and your stats update automatically!

### Check Your Stats
1. Go to Stats page
2. See your game count, average score, and streaks updated

## Step 5: Customize the App

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --primary: oklch(0.52 0.21 264);  /* Change these values */
  --secondary: oklch(0.66 0.15 184);
  --accent: oklch(0.65 0.22 142);
  /* ... more colors ... */
}
```

### Add More Words
In Supabase SQL Editor, run:
```sql
insert into public.words (word, definition, example_sentence, difficulty, length) values
('ELITE', 'A select or superior group', 'The elite athletes competed at the highest level', 'hard', 5),
('MELON', 'A large round fruit', 'The sweet melon was perfect for summer', 'easy', 5);
```

### Update Game Difficulty
Modify Wordle max guesses or word length in `/app/(app)/games/wordle/page.tsx`

## Step 6: Build Other Games

The app has placeholder pages for 4 more games:

1. **Word Match** - `/app/(app)/games/match/page.tsx`
2. **Flashcards** - `/app/(app)/games/flashcard/page.tsx`
3. **Sentence Builder** - `/app/(app)/games/sentence/page.tsx`
4. **Rapid Fire** - `/app/(app)/games/rapid/page.tsx`

Use the Wordle game as a template and `lib/games.ts` for common functions.

## Step 7: Deploy to Production

### Option A: Deploy with Vercel (Recommended)
1. Push your code to GitHub
2. Go to vercel.com and connect your GitHub repo
3. Set environment variables in Vercel project settings
4. Deploy with one click

### Option B: Deploy Elsewhere
The app works with any Node.js hosting:
- Netlify
- Railway
- Render
- AWS
- DigitalOcean
- etc.

## Troubleshooting

### "Cannot GET /" error
- Did you run the SQL scripts? Check Supabase Tables Editor
- Make sure email confirmation is disabled

### "Invalid authentication" when signing up
- Check that Supabase environment variables are set
- Verify they appear in project Settings → Vars

### Wordle won't load
- Check that words table has data (go to Supabase Table Editor)
- Run Script 3 again if words are missing

### Stats not showing on dashboard
- Play a game of Wordle
- Stats are automatically updated on game submission
- Refresh the page if needed

### Can't log in
- Did you disable email confirmation? (See Step 1d)
- Check that your credentials are correct

## Key Files to Know

| File | Purpose |
|------|---------|
| `SETUP_INSTRUCTIONS.md` | Detailed setup guide |
| `README.md` | Project overview |
| `PROJECT_SUMMARY.md` | What's been built |
| `app/(app)/layout.tsx` | Main app layout |
| `app/(app)/games/wordle/page.tsx` | Wordle game (reference) |
| `lib/games.ts` | Game utilities |
| `app/globals.css` | Design system |

## What's Next?

### Immediate (This Week)
- [ ] Follow Steps 1-4 above
- [ ] Test the app works
- [ ] Add 10-20 more words to the database
- [ ] Customize colors to your liking

### Soon (Next Week)
- [ ] Build Word Match game
- [ ] Add leaderboards
- [ ] Create achievement system
- [ ] Add more words by difficulty

### Later (Future)
- [ ] Complete all 5 games
- [ ] Mobile app version
- [ ] Social features
- [ ] Analytics dashboard

## Get Help

- Check `SETUP_INSTRUCTIONS.md` for detailed setup
- Read `README.md` for feature overview
- See `PROJECT_SUMMARY.md` for what's been built
- Check Supabase docs: https://supabase.com/docs

## That's It!

Your premium vocabulary platform is ready to go. Follow the steps above and you'll be running a production-quality app in minutes.

Have fun building! 🚀
