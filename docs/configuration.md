# Configuration reference

Server config lives in `server/config.ts` (`loadServerConfig`). Copy
`.env.example` to `.env` for local development. Vite loads repo-root
`.env*` files (`envDir` in `vite.config.ts`); the server reads
`process.env` at startup and fails fast in production on missing required
variables. No secret is committed, logged, or served — enforced by
`server/config.test.ts`.

## Scope separation

| Variable | Scope | Required | Env | Example (non-sensitive) | If missing |
|---|---|---|---|---|---|
| `NODE_ENV` | server + build | no (default `development`) | all | `development` | defaults to `development`; must be `development\|test\|production` or startup throws naming `NODE_ENV` |
| `PORT` | server runtime | no (default `3000`) | all | `3000` | listens on `3000`; non-integer or out of `1–65535` throws naming `PORT` |
| `DATABASE_URL` | server only (future) | no (until DB prompt) | prod later | `postgresql://user:password@localhost:5432/web1409` | `undefined`; no connection attempted |
| `SESSION_SECRET` | server only (future sessions) | **yes, in production** | prod | 32+ random chars (generate locally, never commit) | production: startup throws naming `SESSION_SECRET`; dev/test: documented fallback `dev-only-insecure-secret-do-not-use-in-production` |
| `BUILT_IN_FORGE_API_URL` | server dev middleware only | no | dev | (empty) | storage proxy replies `500 Storage proxy not configured` (existing behavior, untouched) |
| `BUILT_IN_FORGE_API_KEY` | server dev middleware only, secret | no | dev | (empty) | same as above; never logged, never served |
| `VITE_OAUTH_PORTAL_URL` | **public** (embedded in client bundle) | no | all | `https://oauth-portal.example.com` | `getLoginUrl()` in `client/src/const.ts` builds a broken URL |
| `VITE_APP_ID` | **public** (embedded in client bundle) | no | all | `demo-app-id` | same as above |

Rules: no `VITE_*` secret, no `DATABASE_URL`/`SESSION_SECRET` in `client/**`,
no default production secrets, errors name variables only (see `ConfigError`).
