# 🏟️ SportLK Backend

<p align="center">
  <strong>The API and data layer for a connected Sri Lankan sports community.</strong>
</p>

SportLK brings players, teams, event organizers, and spectators together to discover sports events and manage tournaments. This repository provides the NestJS API used by the mobile app and admin website.

## 🧰 Technology

| Layer | Technology |
| --- | --- |
| API | NestJS · TypeScript · REST · WebSockets |
| Database | MySQL · TypeORM |
| Mobile client | [Expo / React Native](https://github.com/SportLK/mobile-frontend) |
| Admin website | [Next.js](https://github.com/SportLK/web-admin-frontend) |

## ✨ Capabilities

- User registration, authentication, profiles, and role-based access
- Team and roster management, venues, matches, and statistics
- Community posts, notifications, reports, and moderation workflows
- Live match updates over WebSockets

## 🚀 Run locally

### Requirements

- Node.js 20 or later and npm
- MySQL 8 or later

Create a MySQL database, copy `.env.example` to `.env`, and set the database connection and JWT secrets. Then install dependencies and start the API:

```bash
npm ci
npm run start:dev
```

The API listens at [http://localhost:3000/api/v1](http://localhost:3000/api/v1).

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Start the development server with reload |
| `npm run build` | Build the production app |
| `npm run start:prod` | Run the production build |

Development mode synchronizes the database schema from entities. Production disables automatic schema synchronization; use reviewed migrations for production changes. Set separate random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in deployed environments.

## 🔗 SportLK repositories

- [Backend API](https://github.com/SportLK/backend)
- [Mobile app](https://github.com/SportLK/mobile-frontend)
- [Admin website](https://github.com/SportLK/web-admin-frontend)
