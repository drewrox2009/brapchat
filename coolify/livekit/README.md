# LiveKit (Coolify)

Use the official LiveKit image for deployment.

Environment options (pick one):

Option A - Config file (recommended):
- Mount `coolify/livekit/config.yaml` as the LiveKit config file.
- Set `LIVEKIT_CONFIG` to `/etc/livekit/config.yaml`.

Option B - Env only:
- `LIVEKIT_KEYS` (must be formatted as `key: secret` with a space)
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_REDIS` (optional)
- `LIVEKIT_TURN_SERVER` (optional)

Ports (defaults):
- 7880 (HTTP)
- 7881 (WS)
- 7882 (UDP)
- 5349 (TURN)
