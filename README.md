# Portal Lite

Small-agency **client portal** portfolio piece (clients → projects → milestones). Visitors get a **sandbox** later (Phase 1); all data is synthetic and can be deleted on a schedule.

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Prisma, Supabase Postgres, Auth.js (GitHub), Vercel.

## Local setup

1.  Copy env template:
    ```bash
    cp .env.example .env.local
    ```
    On Windows: `copy .env.example .env.local`
2.  Fill in `.env.local`:
    - `DATABASE_URL` — Supabase **pooled** connection string
    - `DIRECT_URL` — Supabase **direct** connection string (migrations)
    - `AUTH_SECRET` — run `openssl rand -base64 32` (or any 32+ char secret)
    - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth app
3.  For Prisma CLI, also put `DATABASE_URL` and `DIRECT_URL` in a root `.env` file (same values), or migrate will not see `.env.local`.
4.  Install and migrate:
    ```bash
    npm install
    npm run db:migrate
    ```
5.  GitHub OAuth app:
    - Homepage: `http://localhost:3000`
    - Callback: `http://localhost:3000/api/auth/callback/github`
6.  Run dev:
    ```bash
    npm run dev
    ```

## Scripts

| Command              | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Dev server                                |
| `npm run build`      | Generate Prisma client + production build |
| `npm run db:migrate` | Create/apply migrations (local)           |
| `npm run db:deploy`  | Apply migrations (CI/Vercel)              |

## Deploy (Vercel)

- Link repo, set the same env vars as `.env.example`.
- Run `prisma migrate deploy` on deploy (add to build command or run once manually).
- Set `NEXT_PUBLIC_APP_URL` to your production URL.

## Sandbox disclaimer

This demo is for portfolio viewers only. Data is **not** production-ready, may be **reset or deleted**, and Stripe (when added) runs in **test mode** only.
