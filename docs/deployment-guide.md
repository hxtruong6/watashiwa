# Deployment Guide

**Generated:** 2025-12-29T19:51:25Z

This repo contains multiple deployment-related configs (PM2 deploy scripts, Nginx config, and service integrations).

## Key Files

- `DEPLOYMENT.md`
- `ecosystem.config.cjs`
- `next.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `config/watashiwa.conf`

## Environment Variables

See `.env.example` for the canonical list; key groups: DB (`DATABASE_URL`), Supabase auth, PostHog analytics, Sentry monitoring, web-push, and GCS uploads.

## Operational Notes

- **PM2 deploy:** `pnpm pm2:deploy:prod` (configured in `ecosystem.config.cjs`)
- **Cron/Jobs:** route handlers under `src/app/api/cron/*`
- **Error monitoring:** Sentry via `withSentryConfig()` in `next.config.ts` + `tunnelRoute: /monitoring`

