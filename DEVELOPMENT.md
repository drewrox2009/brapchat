# Development Guide

## Quick start

```sh
npm install
cp .env.example .env
npx prisma generate --schema "data/prisma/schema.prisma"
```

### Start the API

```sh
npx nx serve api
```

### Run a build

```sh
npx nx build api
```

### Run tests

```sh
npx nx e2e api-e2e
npx nx e2e api-e2e --testPathPattern=api-e2e/src/api/api.spec.ts
npx nx e2e api-e2e --testNamePattern="should return a message"
```

## Prisma workflows

```sh
npx prisma migrate dev --schema "data/prisma/schema.prisma"
npx prisma generate --schema "data/prisma/schema.prisma"
```

## Coolify deployment

### API container

Use the root `Dockerfile` to build the Nest API service.

Environment variables:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`

### Postgres

Point the API at your managed Supabase Postgres database using `DATABASE_URL` and include `?sslmode=require`.
If you use the Supabase pooler, add `?pgbouncer=true&sslmode=require`.

### LiveKit + TURN

Set up LiveKit and TURN as separate services on Coolify. If you want, I can add dedicated Dockerfiles and configs for those stacks next.

## Recommended next steps

1) Run an initial Prisma migration once your database is ready.
2) Enforce screen names on Supabase signup (set `screen_name` in user metadata).
3) Add visibility rules (friends-only, previous riders, request-to-join) in ride joins.
4) Add a "Who’s Riding" endpoint that includes host + friends in ride.
5) Add host-only kick and mute flows (already stubbed at the service layer).
6) Add ride code lookup endpoint so mobile can join by code.
7) Add location updates + map view in mobile.
8) Add LiveKit token issuance for voice join.

## Development notes

- `data/` is the Prisma package.
- `api/` is the Nest API app.
- `api-e2e/` contains e2e tests.
