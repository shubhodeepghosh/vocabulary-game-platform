# Setup Notes

This document has been superseded by the workspace-level setup flow.

Current local setup:

1. Copy `apps/web/.env.example` to `apps/web/.env.local`
2. Copy `apps/server/.env.example` to `apps/server/.env`
3. Run `corepack enable pnpm`
4. Run `pnpm install`
5. Run `pnpm dev`

`pnpm dev` starts PostgreSQL, Redis, runs migrations and seed data, then launches both the frontend and backend.

For the complete command list, see the root [README](../../README.md).
