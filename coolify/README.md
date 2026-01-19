# Coolify Deployment

## API

- Use the root `Dockerfile` to build the Nest API service.
- Expose port `3000`.
- Environment variables:
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `JWT_SECRET`

## LiveKit

- Use `coolify/livekit/Dockerfile`.
- Configure LiveKit environment variables in Coolify.
