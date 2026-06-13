# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HaircutFiveFriends** is a barbershop management platform built as a microservices architecture. There is no root-level package manager; each service is a standalone Node.js or React app run independently.

| Service | Port | Tech | Purpose |
|---|---|---|---|
| `AuthService-The5FadeFriends` | 3005 | Express + PostgreSQL | Authentication & user management |
| `HaircutFiveFriends` | 3006 | Express + MongoDB | Core barbershop business logic |
| `AiServiceServer` | 3007 | Express + MongoDB + Gemini | AI features backend (chat, voice, vision, reviews) |
| `AiServiceClient` | ~5174 | React 19 + Vite | AI features frontend |
| `HaircutFiveFriendsFrontend` | 5173 | React 19 + Vite | Main customer/admin frontend |

## Commands (run inside each service folder)

```bash
# Install dependencies
pnpm install

# Development (with hot reload)
pnpm dev          # or: nodemon index.js / nodemon src/index.js

# Production
pnpm start

# Lint
pnpm lint
pnpm lint:fix

# Frontend build
pnpm build
pnpm preview
```

**AiServiceServer** entry point is `src/index.js` (not `index.js`).

## Environment Variables

Each service requires a `.env` file. Use the `README.txt` or `README` files in each service folder as the `.env` template — they contain example values with all required keys.

Key variables per service:
- **AuthService**: `PORT=3005`, `DB_HOST/PORT/NAME/USERNAME/PASSWORD` (PostgreSQL), `JWT_SECRET`, `JWT_EXPIRES_IN`, SMTP config, Cloudinary config
- **HaircutFiveFriends**: `PORT=3006`, `URI_MONGO`, `JWT_SECRET`, Cloudinary config, `GEMINI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`
- **AiServiceServer**: `PORT=3007`, `URI_MONGO` (or `MONGODB_URI`), `GEMINI_API_KEY`
- **HaircutFiveFriendsFrontend**: `VITE_AUTH_URL=http://localhost:3005/api/v1`, `VITE_API_URL=http://localhost:3006/HaircutFiveFriends/api/v1`

## Infrastructure

**AuthService** uses PostgreSQL. Start it with Docker Compose from `AuthService-The5FadeFriends/`:
```bash
docker-compose up -d
```

**HaircutFiveFriends** and **AiServiceServer** use MongoDB (connect to `mongodb://localhost:27017/`).

## Architecture

### AuthService-The5FadeFriends
- **ORM**: Sequelize with snake_case fields, `freezeTableName: true`, auto-syncs with `{ alter: true }` in dev
- **Auth flow**: JWT access tokens (30m) + refresh tokens (7d). Tokens accepted via `x-token` header or `Authorization: Bearer`. Passwords hashed with argon2.
- **Email verification** required before login. Password reset via SMTP (nodemailer).
- **Admin approval workflow**: clients submit `/auth/signup-request` → admin approves via `/auth/signup-requests/:id/approve`
- **Helpers pattern**: business logic split into `helpers/` (e.g., `generate-jwt.js`, `email-service.js`, `cloudinary-service.js`, `user-db.js`)
- **Seeding**: `helpers/data-seeder.js` and `helpers/role-seed.js` run on startup
- **Swagger**: `/api/v1/api-docs`

### HaircutFiveFriends (Main API)
- **ODM**: Mongoose (MongoDB)
- **Base path**: `/HaircutFiveFriends/api/v1`
- **Module structure**: each domain in `src/<module>/` with `module.controller.js`, `module.model.js`, `module.routes.js`
- **Domains**: service, client, barber, favorites, haircut, appointment, review, sale, detailSale, invoice, statistics, product, aiHaircut, aiHaircutImage
- **JWT validation**: middleware reads token from AuthService and passes `req.user` downstream
- **AI integration**: `services/genaiService.js` (Gemini text) and `services/base64ImageService.js` (Vertex AI image)
- **Swagger**: `/HaircutFiveFriends/api/v1/api-docs`

### AiServiceServer
- **Entry**: `src/index.js` (not root `index.js`)
- **Base path**: `/api/` (no versioned prefix)
- **Modules**:
  - `src/chats/` — Gemini chatbot with MongoDB chat history per `userId`; function calling via `src/ai/tools.js`
  - `src/ai/live-api.js` — WebSocket proxy to Gemini Live API for real-time voice (`gemini-*-flash-live-preview`)
  - `src/vision/` — facial analysis feeding HaircutFiveFriends haircut DB
  - `src/reviews/` — batch review analysis with Gemini
  - `src/aiHaircut/` and `src/aiHaircutImage/` — haircut recommendation and image generation
  - `src/auth/` — JWT proxy/forwarding from AuthService
- **WebSocket**: raw WebSocket server (`ws` library) on same HTTP server, not Socket.io
- **Model**: `gemini-2.5-flash` for text/chat; live model for voice
- **Swagger**: `/api-docs`

### HaircutFiveFriendsFrontend
- **State**: Zustand stores, React Hook Form for forms, react-hot-toast for notifications
- **Auth**: token stored client-side; `ProtectedRoute` + `RoleGuard` components wrap routes
- **Roles**: `ADMIN_ROLE` → `/dashboard`, `ADMIN_RESTAURANTE`/`ADMIN_RESTAURANT` → `/admin-restaurante`, `USER_ROLE` → `/client`
- **API clients**: `src/shared/api/api.js` (main API) and `src/shared/api/auth.js` (AuthService)
- **Feature modules**: `src/features/auth/` (pages: AuthPage, VerifyEmailPage, ResetPasswordPage, UnauthorizedPage)

### AiServiceClient
- **Pages**: LoginPage, Dashboard, ChatPage, VoicePage, VisionPage, ReviewsPage
- **Hooks**: `useChat.js` (chat session), `useVoiceSession.js` (WebSocket + AudioWorklet for PCM16 audio at 16kHz)
- **Audio**: uses AudioWorklet (not deprecated ScriptProcessorNode); worklets in `src/app/worklets/`
- **Services**: `authApi.js`, `chatApi.js`, `visionApi.js`, `arApi.js`

## Inter-Service Communication

- The main frontend calls AuthService at `http://localhost:3005` and the business API at `http://localhost:3006`
- AiServiceServer calls HaircutFiveFriends API internally for barbershop data (barbers, appointments, haircuts)
- JWT issued by AuthService is validated across all backend services using the same `JWT_SECRET`

## Obsidian Documentation & Memory (`.obsidian-notes`)

This repository includes an Obsidian vault located in the `.obsidian-notes/` directory. This acts as the long-term memory, architecture log, and second brain for the project.

### Documentation Rules
- **Location:** All notes, technical specifications, database diagrams, API endpoint logs, and daily logs MUST be stored inside `.obsidian-notes/`. Do not create markdown documentation in the project subfolders unless it's a specific `README.md`.
- **Link Format:** Use standard Obsidian internal links `[[Note Name]]` when connecting concepts, services, or architectural components.
- **Frontmatter:** Every new note created should include a minimal YAML frontmatter block at the top:
```yaml
  ---
  tags: [haircutfivefriends, documentacion/backend o frontend o auth]
  date: YYYY-MM-DD
  ---
  
@AGENTS.md