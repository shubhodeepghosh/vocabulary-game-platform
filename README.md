# Keen Vocabulary Platform

Production-ready vocabulary gaming platform built as a pnpm workspace with:

- `apps/web`: Next.js App Router frontend
- `apps/server`: Express REST API with PostgreSQL and Redis
- `packages/types`: shared contracts between frontend and backend

Current gameplay mode:

- Instant guest play, no signup required
- Anonymous progress stored against guest sessions
- Automated daily-style content selection
- Optional AI-powered automation with Gemini or OpenAI if you later add an API key
- Browser-only demo mode by default, no Docker needed
- Full stack mode still exists under `npm run dev:full`

## Quick Start

1. Copy `.env.example` values into:
   - `apps/web/.env.local`
   - `apps/server/.env`
2. Install dependencies:
   - `corepack pnpm install`
3. Start the browser demo:
   - `npm run dev`

The demo runs on `http://localhost:3000` and uses local browser-backed API state so you can see and play immediately.

## Deployment Notes

- Easiest free public link:
  - Deploy `apps/web` only to Vercel
  - Set `NEXT_PUBLIC_DEMO_MODE=1`
  - Leave `NEXT_PUBLIC_API_BASE_URL=/api`
  - No backend, DB, or Redis required for the demo build
- Full-stack hosted setup later:
  - Point `API_PROXY_TARGET` to your backend service URL
  - Set `CLIENT_ORIGIN` on the server to the public web domain
  - Leave `GAME_AUTOMATION_MODE=local` for a zero-cost automated experience
  - Or set `GAME_AUTOMATION_MODE=gemini` and provide `GEMINI_API_KEY` for AI-picked words/puzzles
- `next.config.mjs` only proxies `/api` when `API_PROXY_TARGET` is present, so the demo build stays clean on static hosting.

## Free Vercel Steps

1. Push the repo to GitHub.
2. In Vercel, click `Add New` -> `Project` and import the Git repo.
3. Choose the `apps/web` root directory.
4. Add this environment variable in Project Settings:
   - `NEXT_PUBLIC_DEMO_MODE=1`
5. Deploy.
6. Share the Vercel URL with friends.

## Scripts

- `npm run dev`: starts the browser-only demo web app
- `npm run dev:full`: starts PostgreSQL, Redis, web, and server
- `npm run build`: builds every workspace package
- `npm run test`: runs backend engine tests
- `npm run db:migrate`: creates tables
- `npm run db:seed`: seeds games and vocabulary data
- `npm run db:setup`: runs migrations and seed data
