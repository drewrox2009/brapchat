# Development Progress

## Current goals (MVP)
- Mobile: auth (phone/email), rides list, ride create/join, map + live positions, deep links.
- API: rides + guest policy enforcement, screen-name enforcement, voice metrics, visibility rules.
- Infra: Supabase managed DB/Auth, LiveKit hosted separately, Coolify deploy.

## Completed
- Prisma migration scaffold in `data/` with core models.
- Nest API modules for rides, guest usage, voice metrics, Supabase auth guard.
- Mobile Expo app scaffold with BrapChat home and auth UI.
- Supabase OTP auth wiring and session state in mobile.
- Public rides fetch from API in mobile.

## In progress
- Ride create/join flow: needs ride code handling (API expects rideId currently).
- Location updates: permissions wired, position updates and map view pending.
- Visibility rules and request-to-join logic in API.
- LiveKit token endpoint + client join flow.

## Next up
1) Add ride code resolution endpoint and update join flow.
2) Post position updates to API and add map screen.
3) Enforce guest limits on join.
4) Implement “Who’s Riding” refresh + join request.
5) LiveKit token issuance + client integration.
