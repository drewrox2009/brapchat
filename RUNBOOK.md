# Coolify Runbook

This runbook covers deploying Supabase, the API, and LiveKit using Coolify.

## Prereqs

- Coolify instance with at least one server online.
- Git repository connected to Coolify.
- Optional: DNS records ready for API and Supabase.

## 1) Supabase (managed free tier)

1. Create a Supabase project on the free tier.
2. In the Supabase project settings, copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - Postgres connection string (use as `DATABASE_URL`). Make sure it includes `?sslmode=require`.
3. If you use the Supabase pooler, append `?pgbouncer=true&sslmode=require` instead.
4. Make sure your Supabase database allows connections from your Coolify host (if IP allowlisting is enabled).

## 2) API service (Coolify)

1. Click **Create New Resource** → **Application**.
2. Select **Dockerfile** build type.
3. Connect this repo and select the branch.
4. Dockerfile path: `Dockerfile`.
5. Expose port `3000`.
6. Environment variables:
   - `DATABASE_URL` (from Supabase Postgres)
   - `SUPABASE_URL` (from Supabase)
   - `SUPABASE_ANON_KEY` (from Supabase)
   - `JWT_SECRET` (random string)
7. Deploy.

## 3) Database migrations (first time only)

Run this locally after Supabase is up and the API is deployed:

```sh
npx prisma migrate dev --schema "data/prisma/schema.prisma"
```

## 4) LiveKit service (optional until voice)

1. Click **Create New Resource** → **Application**.
2. Select **Dockerfile** build type.
3. Repo: this repo.
4. Dockerfile path: `coolify/livekit/Dockerfile`.
5. Expose ports:
   - `7880` (HTTP)
   - `7881` (WS)
   - `5349` (TURN, optional)
6. Environment variables:
   - `LIVEKIT_KEYS`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `LIVEKIT_REDIS` (optional)
   - `LIVEKIT_TURN_SERVER` (optional)
7. Deploy.

## 5) Supabase Auth config (managed)

1. Enable email magic link and phone OTP.
2. Add OAuth providers (Apple/Google/Microsoft) before beta.
3. Ensure `user_metadata.screen_name` is set during signup.

## 6) Health checks

- API: `GET /api` returns `{ "message": "Hello API" }`.
- Supabase: check auth provider settings.
- LiveKit: open the LiveKit admin console if enabled.

## Common pitfalls

- Missing `DATABASE_URL` prevents Prisma from connecting.
- Supabase URL/anon key mismatch causes auth failures.
- LiveKit ports must be exposed if clients cannot connect.

## When to add Redis

- API: not required.
- LiveKit: add when you scale to multiple nodes or need higher resiliency.
