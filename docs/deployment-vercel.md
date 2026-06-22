# Deploying WatashiWa to Vercel

A step-by-step guide to deploying the app on **Vercel** with a managed
**PostgreSQL** database, so you can share a live demo link.

## 1. Provision a Postgres database

Use any managed Postgres provider. Two good free-tier options:

- **[Neon](https://neon.tech)** — serverless Postgres, instant branching.
- **[Supabase](https://supabase.com)** — Postgres + Auth (this app already uses Supabase Auth).

Create a project and copy the connection string. You will need a **pooled**
connection string for the app (e.g. Neon's pooled URL, or Supabase's
`...pooler.supabase.com:5432`).

## 2. Apply the schema and seed content

From your machine, point Prisma at the new database and push the schema + seed:

```bash
export DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/<db>"
pnpm db:generate
pnpm prisma migrate deploy
pnpm db:seed            # vocabulary, kanji, stories, courses
```

## 3. Configure Supabase Auth

The app validates sessions against Supabase Auth. In your Supabase project:

1. Get the project URL and **anon** key (Settings → API).
2. Add your Vercel domain to **Authentication → URL Configuration** (Site URL +
   redirect URLs, e.g. `https://<your-app>.vercel.app/auth/callback`).
3. (Optional) Configure the Google OAuth provider if you want social login.

## 4. Import the repo into Vercel

1. [vercel.com/new](https://vercel.com/new) → import `hxtruong6/watashiwa`.
2. Framework preset: **Next.js** (auto-detected). Build command and output are
   detected automatically; no overrides needed.

## 5. Set environment variables

In Vercel → Project → Settings → Environment Variables, add (see `.env.example`
for the full list):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-app>.vercel.app` |

Add any optional integrations you use (Sentry, PostHog, Mailtrap, Inngest, GCS)
from `.env.example`. They are not required for a basic demo.

## 6. Deploy

Trigger a deploy (push to `main`, or click **Deploy**). Vercel runs the
production build and gives you a URL. Add it to the README:

```md
**Live demo:** https://<your-app>.vercel.app
```

## Notes

- **Branches → environments:** Vercel maps `main` to Production and other
  branches/PRs to Preview deployments automatically — a natural fit for the
  `main` / `develop` split in [`.github/workflows/build.yml`](../.github/workflows/build.yml).
- **Demo account:** seed a user with study history (see the local demo-activity
  tooling) so the dashboard and progress screens look populated.
- **Cold migrations:** run `prisma migrate deploy` against the production
  database whenever you ship a schema change.
