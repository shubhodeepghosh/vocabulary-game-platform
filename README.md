# Keen - Vocabulary Gaming Platform

A premium, Duolingo-like vocabulary learning platform built with Next.js, TypeScript, and Supabase. Master vocabulary through engaging word games with achievements, streaks, and comprehensive statistics.

## Features

### Games
- **Wordle** - Guess words in 6 attempts with color-coded feedback
- **Word Match** - Match words with their definitions (coming soon)
- **Flashcards** - Interactive flashcard learning system (coming soon)
- **Sentence Builder** - Construct grammatically correct sentences (coming soon)
- **Rapid Fire** - Quick-fire vocabulary questions (coming soon)

### User System
- Secure email/password authentication with Supabase
- User profiles with stats tracking
- Game history and performance analytics
- Achievement system and streak tracking
- Leaderboards (coming soon)

### Features
- Real-time game progress saving
- Responsive mobile-first design
- Dark mode support
- Beautiful UI with smooth animations
- Bottom navigation for mobile, sidebar for desktop

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Authentication
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm (or npm/yarn)
- Supabase account and project

### Installation

1. **Clone and install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up Supabase** (See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md))
   - Create SQL tables by running the provided scripts in your Supabase SQL Editor
   - Disable email confirmation for development (if desired)
   - Verify environment variables are set

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Visit the app**
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign up at `/auth/sign-up`
   - Log in at `/auth/login`

## Project Structure

```
app/
├── (app)/                    # Protected routes
│   ├── layout.tsx           # App layout with navigation
│   ├── dashboard/page.tsx   # Home dashboard
│   ├── games/               # Game pages
│   │   ├── page.tsx         # Games list
│   │   ├── wordle/          # Wordle game
│   │   ├── match/           # Word match game
│   │   ├── flashcard/       # Flashcard game
│   │   ├── sentence/        # Sentence builder
│   │   └── rapid/           # Rapid fire game
│   ├── stats/page.tsx       # User statistics
│   └── profile/page.tsx     # User profile
├── auth/                    # Authentication pages
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   ├── sign-up-success/page.tsx
│   ├── error/page.tsx
│   └── callback/route.ts
├── api/
│   └── games/
│       └── submit/route.ts  # Game submission API
├── globals.css              # Tailwind and design tokens
└── layout.tsx              # Root layout

lib/
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── proxy.ts            # Session proxy

scripts/
├── 001_create_profiles.sql      # Profile schema
├── 002_create_game_tables.sql   # Game tables schema
└── 003_seed_words.sql           # Sample word data
```

## Database Schema

### profiles
User profile information, auto-created on signup.

### words
Vocabulary database with definitions and examples.

### game_sessions
Individual game play records tracking scores and completion.

### user_stats
Aggregated user statistics including games played, average score, and streaks.

### achievements
User achievement tracking and unlock status.

## Key Features Implementation

### Authentication Flow
1. User signs up at `/auth/sign-up`
2. Account created via Supabase Auth
3. Profile auto-created via database trigger
4. Redirected to dashboard on login

### Game Submission
- Games save results via `/api/games/submit`
- Updates user stats automatically
- Calculates scores and performance metrics

### Data Persistence
- All game data stored in Supabase
- Row-Level Security (RLS) ensures user data privacy
- Real-time synchronization of user statistics

## Environment Variables

The following are automatically set by the Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase API key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role for admin operations

## Customization

### Design System
Edit `/app/globals.css` to customize:
- Color scheme (primary, secondary, accent colors)
- Typography (fonts already set to Geist)
- Spacing and border radius

### Games
Each game can be customized by modifying its respective page in `/app/(app)/games/`

### Database
Add new tables or columns directly in Supabase SQL Editor or by creating migration scripts.

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY not found"
- Ensure Supabase integration is connected in project settings

### "Email confirmation required" error
- Disable email confirmation in Supabase dashboard
- Or configure an email provider for production

### Database tables not found
- Run all three SQL migration scripts in Supabase SQL Editor
- Verify tables appear in Supabase Tables panel

### Game scores not saving
- Check network tab for API errors
- Verify user is authenticated (check browser console)
- Ensure `/api/games/submit` route is accessible

## Future Enhancements

- [ ] Complete remaining 4 games
- [ ] Multiplayer/competitive modes
- [ ] Daily challenges and rewards
- [ ] Advanced analytics dashboard
- [ ] Leaderboards and rankings
- [ ] Mobile app (React Native)
- [ ] Offline support with sync
- [ ] AI-powered hint system
- [ ] Custom word lists and categories
- [ ] Social features (friends, sharing)

## License

MIT - Feel free to use this project for your own purposes.

## Support

For issues or questions, check the [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) or your Supabase documentation.
