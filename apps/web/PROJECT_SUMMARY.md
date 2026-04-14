# Project Summary

The original single-app Supabase scaffold has been converted into a workspace-based vocabulary gaming platform.

Current architecture:

- `apps/web`: Next.js App Router frontend
- `apps/server`: Express REST API
- `packages/types`: shared contracts
- PostgreSQL: persistent users, sessions, results, and word data
- Redis: leaderboard cache
- Zustand: auth, stats, and active game session state

Implemented game flows:

- Wordle
- Scramble
- Spelling Bee
- Speed Vocab
- Quiz

Use the root [README](../../README.md) for the current operational guide.
