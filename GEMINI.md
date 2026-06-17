# Gemini CLI Project Instructions — HaircutFiveFriends

This file serves as the definitive reference and instructional context for Gemini CLI, Claude Code, and human developers working in the `HaircutFiveFriends-Full` workspace.

---

## 1. Project Overview

**HaircutFiveFriends** is a complete, multi-service barbershop management and AI-assisted recommendation platform. The repository is organized as a microservices architecture consisting of three backend services and two frontend applications. There is no root-level package manager; each service is independent, utilizes `pnpm` as its package manager, and must be configured and run from its own subdirectory.

### System Components

| Service | Port | Tech Stack | Purpose & Core Responsibility |
| :--- | :---: | :--- | :--- |
| **`AuthService-The5FadeFriends`** | `3005` | Node.js (Express), PostgreSQL (Sequelize), Argon2, Cloudinary | Authentication, JWT issue/refresh, role-based security, email validation, and admin-approval workflows. |
| **`HaircutFiveFriends`** | `3006` | Node.js (Express), MongoDB (Mongoose), Cloudinary | Main business logic, appointments, services, haircuts database, client records, billing/invoicing, and core backend operations. |
| **`AiServiceServer`** | `3007` | Node.js (Express), MongoDB, `@google/genai` (Vertex AI + ADC) | AI feature backend including text chatbot, reviews analyzer, facial-feature analysis (Vision) for haircut suggestions, and real-time voice integration via a WebSocket proxy. |
| **`HaircutFiveFriendsFrontend`** | `5173` | React 19, Vite, Zustand, TailwindCSS | Main user and administrator frontend portal (dashboard, appointment scheduling, and customer profile management). |
| **`AiServiceClient`** | `5174` | React 19, Vite, AudioWorklets, WebSockets | Dedicated frontend application for accessing advanced AI capabilities (voice chat, facial analysis, text chatbot). |

---

## 2. Infrastructure & Databases

### Databases Setup
1. **PostgreSQL (AuthService):** 
   * Handled via Docker Compose in the `AuthService-The5FadeFriends` directory.
   * To launch: `docker-compose up -d`
   * ORM: Sequelize with `snake_case` fields and `freezeTableName: true`. Auto-syncs with `{ alter: true }` in development mode.
2. **MongoDB (Main API & AiServiceServer):**
   * Expected to run locally at `mongodb://localhost:27017/`.
   * Databases: `HaircutFiveFriends` (Main business API) and `GeminiDB` / `TodoGemini` (for AI Chat histories).

---

## 3. Google GenAI & Vertex AI Integration

The AI features backend (`AiServiceServer`) is fully migrated from standard Google AI Studio (API keys) to enterprise-grade **Vertex AI on Google Cloud (GCP) with Application Default Credentials (ADC)**.

### SDK Version & Mode
* **SDK:** `@google/genai` (v1.50.1)
* **Authentication:** Application Default Credentials (ADC) via OAuth 2.0 Bearer tokens. No API keys are used in the backend.
* **Initialization:** Instantiated via `new GoogleGenAI({ vertexai: true, project: GCP_PROJECT, location: GCP_LOCATION })`.

### Shared Configuration (`configs/genai.js`)
* Centralized client management is handled via a **Lazy Singleton Pattern**:
  ```javascript
  import { GoogleGenAI } from "@google/genai";
  // Export central client getter
  export const getGenAI = () => { ... }
  ```
* **Models Mapping (`MODELS`):**
  * **Text/Chat:** `gemini-3.1-flash-lite` (Default)
  * **Facial Analysis (Vision):** `gemini-3.5-flash`
  * **Image Generation:** `gemini-3-pro-image-preview`
  * **Real-time Voice (Live API):** `gemini-3.1-flash-live`

### Real-Time Voice WebSocket Proxy (`src/ai/live-api.js`)
* Built using a raw `ws` server co-hosted on the primary Express port (`3007`).
* Connects downstream to Google Vertex Live API:
  `wss://${location}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`
* Dynamically fetches OAuth tokens at runtime using `google-auth-library`:
  ```javascript
  const authClient = await auth.getClient();
  const tokenResponse = await authClient.getAccessToken();
  const accessToken = tokenResponse.token;
  ```
* Connects with the `Authorization: Bearer <accessToken>` header.
* Note: Bearer tokens expire in 1 hour; for long voice sessions, handle re-authentication on 401 closures.

---

## 4. Building and Running Commands

All commands must be executed within the respective service's directory. 

| Task | Command | Notes |
| :--- | :--- | :--- |
| **Install Dependencies** | `pnpm install` | Required for all directories before starting development. |
| **Run Dev Server** | `pnpm dev` | Starts the service with hot-reloading (Vite for frontends, Nodemon for backends). |
| **Run Production** | `pnpm start` | Builds/Runs in production mode (for backends). |
| **Build Frontend** | `pnpm build` | Compiles Vite production bundles (`dist/` directory). |
| **Preview Build** | `pnpm preview` | Serves compiled production build locally. |
| **Run Linter** | `pnpm lint` | Performs static analysis checking for code errors. |
| **Fix Lint Issues** | `pnpm lint:fix` | Automatically fixes style and syntax warnings. |

---

## 5. Development Conventions

### Backend Patterns (Node.js + Express)
* **Structure:** Clean MVC-inspired domain-driven folders (e.g., `src/chats`, `src/vision`).
* **Bootstrap Environment Validation:** Environment variable checks are executed synchronously on server boot (within `index.js` calling validation files like `configs/genai.js`) rather than as side effects of library imports. This prevents servers starting in partially broken states.
* **Error Handling:** 
  * Always delegate async errors using `next(err)`.
  * Standardized global error handler in `middlewares/error-handler.js` to prevent stack-trace leakage in production.
* **External HTTP Timeouts:** All `axios` or external requests **must** enforce explicit timeouts (e.g., `HTTP_TIMEOUT_MS = 15000`) to prevent connection hanging.
* **Sanitization:** Input path parameters (like `barberId`) and authentication login bodies must be aggressively sanitized and validated before downstream usage.

### Frontend Patterns (React 19 + Vite)
* **State Management:** Leverage Zustand stores for global UI and domain states.
* **Resource Disposal (AbortController):** 
  * React pages and hooks (e.g., `useChat.js`, `VisionPage.jsx`, `LoginPage.jsx`) **must** integrate an `AbortController` and pass its `signal` to fetch/axios requests.
  * Always trigger `.abort()` inside useEffect cleanup or component unmounting to prevent state updates on unmounted components and eliminate network leaks.
* **Accessibility (A11y):** Form fields and components must utilize accessible labels (`aria-label`), autocomplete properties (`autoComplete`), busy indicators (`aria-busy`), and error indicators (`role="alert"`).
* **Audio handling:** In `AiServiceClient`, real-time voice streaming utilizes the modern `AudioWorklet` processor (PCM16 at 16kHz) instead of deprecated `ScriptProcessorNode`. Worklets reside in `src/app/worklets/`.

---

## 6. Environment Variables Templates

Each service subdirectory must include its own `.env` file configured. Examples can be found below:

### `AuthService-The5FadeFriends/.env`
```env
NODE_ENV=development
PORT=3005

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=HaircutFiveFriends
DB_USERNAME=postgres
DB_PASSWORD=root
DB_SQL_LOGGING=false

# JWT Configuration
JWT_SECRET=MyVerySecretKeyForJWTTokenAuthenticationWith256Bits!
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=The5FadeFriends
JWT_AUDIENCE=The5FadeFriends

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENABLE_SSL=true
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-smtp-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Auth HaircutFiveFriends

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=djuxr89ny
CLOUDINARY_API_KEY=756418949615516
CLOUDINARY_API_SECRET=kueZn4ZlPo8fPEI6LwiYtnwTBiQ
CLOUDINARY_BASE_URL=https://res.cloudinary.com/djuxr89ny/image/upload/
CLOUDINARY_FOLDER=HaircutFiveFriends/images
CLOUDINARY_DEFAULT_AVATAR_FILENAME=default-avatar_ewzxwx.png

# File Upload
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ADMIN_ALLOWED_ORIGINS=http://localhost:5173
VERIFICATION_EMAIL_EXPIRY_HOURS=24
PASSWORD_RESET_EXPIRY_HOURS=1
```

### `HaircutFiveFriends/.env`
```env
NODE_ENV=development
PORT=3006
URI_MONGO=mongodb://localhost:27017/HaircutFiveFriends

JWT_SECRET=MyVerySecretKeyForJWTTokenAuthenticationWith256Bits!
JWT_ISSUER=The5FadeFriends
JWT_AUDIENCE=The5FadeFriends

CLOUDINARY_CLOUD_NAME=djuxr89ny
CLOUDINARY_API_KEY=756418949615516
CLOUDINARY_API_SECRET=kueZn4ZlPo8fPEI6LwiYtnwTBiQ
CLOUDINARY_BASE_URL=https://res.cloudinary.com/djuxr89ny/image/upload/
CLOUDINARY_FOLDER=HaircutFiveFriends/images

# Vertex AI Settings (HaircutFiveFriends legacy/separate integration)
GOOGLE_PROJECT_ID=project-4be61ab3-b84b-41d6-bf6
GEMINI_API_KEY=AIzaSyCnaDDur3qLbcmGs2Ar7KgC2MPoGUiP4Bs
GOOGLE_VERTEX_LOCATION=us-central1
VERTEX_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
VERTEX_IMAGE_MODEL=imagen-3.0-capability
GOOGLE_APPLICATION_CREDENTIALS=C:/Users/Angel Geovanny/Downloads/project-4be61ab3-b84b-41d6-bf6-0343c4f77f6a.json
```

### `AiServiceServer/.env`
```env
NODE_ENV=development
PORT=3007
URI_MONGO=mongodb://localhost:27017/TodoGemini
JWT_SECRET=MyVerySecretKeyForJWTTokenAuthenticationWith256Bits!

# Google Cloud Platform (ADC / Vertex AI)
GOOGLE_CLOUD_PROJECT=project-4be61ab3-b84b-41d6-bf6
GOOGLE_CLOUD_LOCATION=us-central1

# Model Overrides (Optional - Defaults are applied by configs/genai.js)
VERTEX_TEXT_MODEL=gemini-3.1-flash-lite
VERTEX_VISION_MODEL=gemini-3.5-flash
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
VERTEX_LIVE_MODEL=gemini-3.1-flash-live-preview

# Timeouts & HTTP Configs (in ms)
GENAI_TIMEOUT_MS=30000
HTTP_TIMEOUT_MS=15000
```

### `HaircutFiveFriendsFrontend/.env`
```env
VITE_AUTH_URL=http://localhost:3005/api/v1
VITE_API_URL=http://localhost:3006/HaircutFiveFriends/api/v1
```

### `AiServiceClient/.env`
```env
VITE_API_URL=http://localhost:3007/api
VITE_WS_URL=ws://localhost:3007
```

---

## 7. Obsidian Documentation & Memory Rules

This project uses an Obsidian Vault inside `.obsidian-notes/` to store structural models, developer logs, and deep system architecture reports. 

### Documentation Guidelines
* **Storage Location:** All technical summaries, diagrams, architecture guides, and developer progress logs **must** be stored inside `.obsidian-notes/`. 
* **Linking Concept:** Link pages using standard wiki links (e.g., `[[AiServiceServer]]`, `[[2026-06-13-seguridad-env]]`).
* **YAML Frontmatter Mandate:** Every new note created inside `.obsidian-notes/` must contain the following frontmatter block:
  ```yaml
  ---
  tags: [haircutfivefriends, documentacion/backend | documentacion/frontend | refactor | seguridad]
  date: YYYY-MM-DD
  ---
  ```

---

## 8. Security & Git Compliance Policies

1. **Credential Protection:** Never, under any circumstances, hardcode, log, print, or commit API keys, JSON credentials (like Service Account files), or credentials. 
2. **Tracked Environment Files Risk:** 
   * *Acknowledge Risk:* Currently, some `.env` files are tracked in the repository.
   * *Remediation Steps Required:* Developers must untrack `.env` files immediately without deleting them from local storage using:
     ```bash
     git rm --cached .env
     git rm --cached AiServiceServer/.env
     git rm --cached AuthService-The5FadeFriends/.env
     git rm --cached HaircutFiveFriends/.env
     ```
   * Add `.env` and `.env.*` rules to the global and folder-specific `.gitignore` files.
3. **JWT Secret Rotations:** If any keys are exposed or tracked, they must be proactively rotated. Keep `JWT_SECRET` keys matching across `AuthService`, `HaircutFiveFriends`, and `AiServiceServer` to maintain cross-service signature compatibility.

---

## 9. Current Technical Debt & Backlog

| Task | Priority | Component | Recommendation / Goal |
| :--- | :---: | :--- | :--- |
| **Untrack `.env` files** | High | Git Setup | Remove cached local `.env` files and add to `.gitignore` to prevent secret leaks. |
| **Rotate exposed secrets** | High | Security | Rotate JWT Secret keys, SMTP passwords, and Cloudinary keys because they are tracked in git history. |
| **Stabilize Model Versions** | Medium | `AiServiceServer` | Confirm performance of stable `gemini-3.1-flash-lite` vs preview version, then update configuration files. |
| **Clean up Dead Config Modules** | Medium | `AiServiceServer` | Remove legacy `index.js` and consolidate cors/helmet configuration into `configs/app.js` during the next refactoring cycle. |
| **Secure Reviews Analyzer Endpoint** | Medium | `AiServiceServer` | Add `validateJWT` middleware to `GET /reviews/analyze/:barberId` to prevent unauthenticated access. |
| **Establish Test Suite** | Medium | Backends & Frontends | Create testing environments (Supertest/Vitest on server, Testing Library on clients). |
| **Tailwind Migration & CSS Cleanup** | Low | Client Frontends | Transition raw/inline styles to TailwindCSS classes and modularize bloated `index.css` files. |

## Protocolo de inicio obligatorio
Antes de cualquier acción, lee: .obsidian-notes/AGENT-CONTEXT.md
Luego lee el log más reciente en: .obsidian-notes/logs/
No leas archivos fuente hasta saber en qué servicio trabajamos hoy.

INICIO DE SESIÓN — Protocolo de contexto mínimo

1. Lee .obsidian-notes/AGENT-CONTEXT.md  ← OBLIGATORIO PRIMERO
2. Lee .obsidian-notes/logs/ del día más reciente (si existe)
3. NO leas ningún archivo fuente hasta que el usuario te indique
   en qué servicio o feature trabajaremos hoy

Solo entonces pregunta: ¿En qué servicio trabajamos hoy?
Y lee ÚNICAMENTE los archivos de ese servicio que necesites.

Al terminar la sesión, actualiza:
- AGENT-CONTEXT.md si algo estructural cambió
- Crea logs/YYYY-MM-DD.md con solo lo que tocaste hoy