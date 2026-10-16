# SportLK API

NestJS API for identity, player profiles, roles, community content, moderation, and notifications. Team, roster, tournament, and event data belong to their own platform modules. This API grants approved workspace roles and exposes the user/community information those modules can use.

## Run locally

Requirements: Node.js 20+, MySQL 8+, and npm.

1. Create a MySQL database named `sportlk` (or set `DB_NAME`).
2. Copy `.env.example` to `.env` and set your database connection and JWT secrets.
3. Run `npm install`, then `npm run start:dev`.
4. The API listens on `http://localhost:3000/api/v1`.

The development configuration creates tables from the entities. Production disables TypeORM schema synchronization; use reviewed migrations for production schema changes.

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` to create the first administrator during startup. If those values are absent, registration only creates player accounts and admin-only workflows stay protected.

## API surface

All routes except registration, login, and refresh require `Authorization: Bearer <accessToken>`. Access tokens last 15 minutes. Refresh tokens last 30 days, are stored as a hash, and rotate when refreshed.

| Area | Routes | Access |
| --- | --- | --- |
| Authentication | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | Public sign-in; logout requires a token |
| Profiles and accounts | `GET /users/me`, `PATCH /users/me`, `GET /users`, `PATCH /users/:id/status` | Self-service; account management is admin-only |
| Communities and feed | `GET /communities`, `POST /communities`, `POST/DELETE /communities/:id/join`, `GET/POST /community/posts`, post likes/comments and moderation | Signed-in members; hiding posts is admin-only |
| Role applications | `POST /role-applications`, `GET /role-applications/mine`, `GET /role-applications/pending`, `PATCH /role-applications/:id/review` | Applicants; queue and decisions are admin-only |
| Reports | `POST /reports`, `GET /reports`, `PATCH /reports/:id` | Submitters; review is admin-only |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` | Own notifications only |

Approving a Team Manager or Tournament Organizer application adds that role to the user and creates a notification. The team and tournament modules can read `user.roles` to decide which workspaces to expose.

## Environment variables

See `.env.example`. Use separate random JWT secrets in deployed environments. Set `CORS_ORIGIN` to a comma-separated allowlist in production; development allows local origins by default.
