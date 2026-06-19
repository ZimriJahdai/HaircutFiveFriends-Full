# Tarea: Fusionar `AiServiceClient` dentro de `HaircutFiveFriendsFrontend` (carpeta única)

Eres **Claude Code** trabajando en el monorepo `HaircutFiveFriends-Full` (microservicios).

**Objetivo final, no negociable:** las funciones de IA (Chat, Voz, Visión, Reseñas IA) viven
**dentro** del frontend normal `HaircutFiveFriendsFrontend` (puerto 5173) como un **feature module**
nuevo, navegables desde su **sidebar** vía **react-router**, reutilizando el **mismo login / mismo
token**. Al terminar y verificar, **la carpeta `AiServiceClient/` desaparece del repo**.

> Esto es **migración real de código** (merge), NO iframe, NO link-out, NO segunda app.
> No hay "Plan B". Hay un solo destino: una sola carpeta frontend.

---

## Regla de oro
- Editas **solo** `HaircutFiveFriendsFrontend/`. Lees `AiServiceClient/` como **fuente**.
- **No toques** `AuthService-The5FadeFriends`, `HaircutFiveFriends`, `AiServiceServer`.
  El backend IA (3007) ya valida el **mismo JWT de AuthService** → el token del frontend normal **ya sirve**.
- No rompas nada del frontend normal. Preserva lógica existente. Componentes desacoplados,
  archivos cortos, una responsabilidad por archivo. Sigue la convención de carpetas ya existente.
- **Rama nueva** + commits pequeños y atómicos. `pnpm build` debe pasar antes de cerrar.
- El borrado de `AiServiceClient/` es el **último paso**, solo tras verificar que todo funciona en el destino.

---

## Mapa del ecosistema (confirmado en código)

| Servicio | Puerto | Rol |
| :-- | :-: | :-- |
| `AuthService-The5FadeFriends` | 3005 | Auth (JWT, PostgreSQL) |
| `HaircutFiveFriends` | 3006 | API negocio (MongoDB) |
| `AiServiceServer` | 3007 | Backend IA (chat/voz/visión/reseñas, MongoDB + Vertex) |
| `HaircutFiveFriendsFrontend` | 5173 | **Frontend único (destino)** |
| `AiServiceClient` | 5174 | Frontend IA (**fuente — se elimina al final**) |

---

## Convención de carpetas del destino (RESPÉTALA)

El frontend normal usa **feature modules**:

```
HaircutFiveFriendsFrontend/src/
  app/        main.jsx, App.jsx, router/{AppRouters,ProtectedRoute,RoleGuard}.jsx, pages/, layouts/
  features/<dominio>/
      components/   pages/   hooks/   store/
  shared/
      api/{api.js, auth.js, ...}   components/layout/{DashboardLayout,Sidebar,Navbar}.jsx   utils/
```

→ Todo lo de IA entra como **`src/features/ai/`** con esa misma forma:

```
src/features/ai/
  pages/        ChatPage.jsx  VoicePage.jsx  VisionPage.jsx  ReviewsPage.jsx  AiDashboard.jsx
  components/   ChatWindow.jsx  ChatForm.jsx  ChatHeader.jsx  ChatFooter.jsx  ...
  hooks/        useChat.js  useVoiceSession.js
  services/     chatApi.js  visionApi.js  arApi.js          (NO authApi.js del AI client)
  constants/    chat.js  voice.js  vision.js  ar.js
  lib/          aiAuth.js                                   (token desde el store normal)
  worklets/     pcm-worklet.js
  styles/       ai.module.css  (o aislado, ver A.3)
```

**NO portar del AI client:** `AppShell`, `SidebarNav`, `UserMenu`, `LoginPage`, `AppRoutes`,
`NotFound`, `authStorage.js` (token `todogemini_auth`), `authApi.js`. El destino ya aporta
layout, sidebar, login, auth y router.

---

## Lee PRIMERO (confírmalo en código, no asumas)

**Destino:**
- `src/app/router/AppRouters.jsx` — **react-router-dom v7** (¡no v6!); guards por rol.
  ⚠️ El AI client usa **react-router v6.30**. NO copies su routing tal cual: adáptalo a la API de
  **v7** que ya usa el destino (revisa cómo declara rutas/`Outlet`/`useNavigate` el `AppRouters.jsx` actual).
- `src/app/router/ProtectedRoute.jsx`, `src/app/router/RoleGuard.jsx`
- `src/shared/components/layout/DashboardLayout.jsx` — Sidebar + Navbar + `<Outlet/>`
- `src/shared/components/layout/Sidebar.jsx` — `NAV_CONFIG` por rol, iconos Tabler `ti ti-*`, `NavLink`
- `src/features/auth/store/authStore.js` — Zustand persistido `auth-storage`: `token`, `refreshToken`, `user`, `isAuthenticated`
- `src/shared/api/api.js` — axios con `Authorization: Bearer <token>` + refresh
- `src/app/pages/ClientHome.jsx`, `src/features/client/pages/Home.jsx`

**Fuente (AI client):**
- `src/app/routes/AppRoutes.jsx`, `src/app/layouts/AppShell.jsx`
- `src/app/pages/{ChatPage,VoicePage,VisionPage,ReviewsPage,Dashboard}.jsx`
- `src/app/components/*`, `src/app/hooks/{useChat,useVoiceSession}.js`
- `src/app/services/{chatApi,visionApi,arApi,authApi}.js`, `src/app/constants/{chat,voice,vision,ar}.js`
- `src/app/utils/{authStorage,messageUtils,handleAuthError}.js`, `src/app/worklets/pcm-worklet.js`
- `src/styles/index.css` (design system: `@theme` + **clases globales genéricas**)

---

## Pasos de la migración

### 1 — Auth unificada + cliente HTTP compartido (un solo token)
- Borra toda dependencia de `todogemini_auth` / `authStorage.getAuth()` / `authApi.js`.
- **HTTP:** las llamadas IA hoy usan `fetch` crudo (`chatApi.js`, `visionApi.js`). **Migrarlas al cliente
  axios compartido `src/shared/api/api.js`** del destino para heredar `Authorization: Bearer` +
  **refresh token** + manejo 401 automático. Reescribe `chatApi.js`/`visionApi.js` como módulos que
  usan esa instancia axios (apuntando al base IA, ver paso 2). Elimina `handleAuthError.js` (el axios
  interceptor del destino ya maneja 401).
- **WS no pasa por axios:** para Voz (`useVoiceSession`) y AR, crea
  `src/features/ai/lib/aiAuth.js` que lea `useAuthStore.getState().token` y devuelva el token para
  inyectarlo en la conexión WS (query/subprotocol según espere el server).
- `userId` del chat: mapea el id real del `user` del store. **Confirma el campo** (`user.uid` / `user._id` / `user.id`)
  leyendo `authStore.js` y cómo lo llena el login — no adivines.

### 2 — Endpoints + WebSocket (env nuevas, sin colisión)
⚠️ El AI client lee `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`, `VITE_AR_BASE_URL`, `VITE_AR_WS_URL`,
y con localhost cae a **rutas relativas vía proxy de Vite** (`/api/chat`, `/ws`, `/api/vision`).
El destino **ya usa `VITE_API_URL` (3006) y `VITE_AUTH_URL` (3005)** para otros backends → **NO reuses
esos nombres**. Crea env **prefijadas `VITE_AI_*`** y reescribe los constants para apuntar **absoluto**
(elimina la lógica localhost→relativa, el destino no tendrá ese proxy):

- En `HaircutFiveFriendsFrontend/.env`:
  - `VITE_AI_API_URL=http://localhost:3007/api`   → chat `…/chat`, vision `…/vision`
  - `VITE_AI_WS_URL=ws://localhost:3007/ws`        → voz (**confirma el path WS real en `AiServiceServer/src/ai/live-api.js`**)
  - `VITE_AI_AR_URL=http://localhost:8000`         → backend AR (servicio aparte, **ver nota AR**)
  - `VITE_AI_AR_WS_URL=ws://localhost:8000/ws/camera`
- **Paths exactos a confirmar en el server** antes de fijarlos: `/api/chat/:userId`, `/api/vision`,
  path del WS de voz, y `/ws/camera` del AR.
- Reescribe `features/ai/constants/{chat,voice,vision,ar}.js` con las env `VITE_AI_*`. Documenta
  todas las llaves en `README` / `.env.example` del destino.

> **Nota AR (incluido en la migración):** AR NO vive en 3007, usa un backend **aparte en `:8000`**.
> ANTES de portar AR, un subagente debe **verificar que ese servicio `:8000` existe y se usa**
> (búscalo en el repo / pregunta). Si existe → porta `arApi.js`, `ar.js`, constants AR con las env
> `VITE_AI_AR_*`. Si NO existe → reporta y deja AR fuera con un TODO, no inventes el endpoint.

### 3 — CSS sin colisiones (CRÍTICO)
- `AiServiceClient/src/styles/index.css` define clases **globales genéricas**
  (`.card .page .grid .sidebar .nav .avatar .topbar .bento ...`) que **chocan** con el destino.
  **Prohibido** importarlo global tal cual.
- Estrategia (elige y justifica): **CSS Module** por feature **o** prefijo `.ai-*` + contenedor `.ai-scope`
  **o** anidar bajo `.ai-scope { ... }`. Mantén consistencia.
- Conserva tokens `@theme` del AI client **solo** si no pisan los del destino; si chocan, renómbralos.
  La paleta ya es compatible (oro `#C9A84C`, dark, crema).

### 4 — Rutas + Sidebar (la navegación pedida)
- **Ambos roles** (admin y cliente) acceden a IA. Monta las páginas bajo el router existente,
  dentro de `ProtectedRoute` + `RoleGuard`, en los dos árboles:
  - Admin: `/dashboard/ia/chat`, `/dashboard/ia/voz`, `/dashboard/ia/vision`, `/dashboard/ia/resenas`
  - Cliente: `/client/ia/chat`, `/client/ia/voz`, `/client/ia/vision`, `/client/ia/resenas`
- **Sin landing.** La entrada "IA" del sidebar lleva **directo a Chat** (`.../ia/chat`).
  Voz/Visión/Reseñas son sub-rutas accesibles (sub-items de sidebar o tabs dentro del módulo).
  **NO portes** el `Dashboard.jsx` del AI client (se descarta).
- Añade entradas al `NAV_CONFIG` del `Sidebar.jsx` en **ambos roles**, respetando su patrón
  (`NavLink`, iconos Tabler: `ti-message-chatbot`, `ti-microphone`, `ti-scan-eye`, `ti-star`).

### 5 — Worklet
- Copia `pcm-worklet.js` a `features/ai/worklets/` y arregla la ruta de carga del AudioWorklet
  (debe resolver con Vite en el destino, p. ej. `new URL('../worklets/pcm-worklet.js', import.meta.url)`).

### 6 — Limpieza final (destructivo — solo tras verificar)
- En **esta misma rama**, una vez que **todos** los criterios de aceptación pasen y `pnpm build`
  esté verde: elimina la carpeta `AiServiceClient/` completa y cualquier referencia a ella
  (scripts, docs raíz, `.env`, proxys, `CLAUDE.md`). Hazlo en un **commit separado** dentro de la rama.

---

## Orquestación con SUBAGENTES (obligatorio)

No hagas todo en un solo hilo. Reparte en subagentes especializados y **revisa archivo por archivo
cada cambio**. Sugerencia de fan-out:

1. **Agente Explore (read-only):** inventario completo. Lista cada archivo de `AiServiceClient/src`,
   sus imports, qué token/endpoint/WS usa, y mapea destino exacto en `features/ai/`. Devuelve tabla
   `origen → destino → dependencias → riesgos`. No edita.
2. **Agente Auth+Endpoints:** implementa paso 1 y 2 (aiAuth, env, constants). Reescribe services.
3. **Agente UI/CSS:** implementa paso 3 y 5 (aislamiento CSS, worklet, copia componentes/pages/hooks).
4. **Agente Router/Sidebar:** implementa paso 4 (rutas + NAV_CONFIG + guards).
5. **Agente Revisor (read-only):** tras cada agente, revisa **cada archivo tocado** contra los
   criterios de aceptación; reporta regresiones, imports rotos, clases CSS sin aislar, tokens viejos.

**Reglas para los subagentes:**
- Cada uno reporta de vuelta: archivos creados/editados, decisiones, y qué quedó pendiente.
- Ningún subagente borra `AiServiceClient/` (eso es el paso 6, manual, con confirmación).
- Tras cada bloque de cambios: correr verificación (abajo) y **no avanzar** si rompe el build.

---

## Tests y verificación (por cada cambio)

> El repo **no tiene tests automáticos** (los `test` scripts son placeholders). La verificación es:

- `pnpm build` en `HaircutFiveFriendsFrontend/` **verde** tras cada bloque de cambios.
- `pnpm lint` (existe en el destino) sin errores nuevos.
- Si introduces lógica nueva aislable (p. ej. `aiAuth`, `messageUtils`), añade un **test ligero**
  (Vitest) solo si el destino ya lo soporta; si no, deja la verificación manual documentada.
- **Smoke manual** (con 3005/3006/3007 arriba): login normal → entra a `/dashboard/ia` → Chat
  responde con token del store → Voz conecta WS y carga worklet → Visión y Reseñas cargan → ninguna
  vista existente del frontend normal cambió de estilo.

---

## Criterios de aceptación
- Login normal único → el sidebar muestra el grupo **IA** → navego a Chat/Voz/Visión/Reseñas
  **dentro de la misma app** (mismo layout/sidebar, **sin segundo login**).
- Servicios IA funcionan con el **token del store normal** (cero `todogemini_auth`).
- Voz: WS a `VITE_AI_WS_URL`; AudioWorklet carga sin error de ruta.
- CSS de IA **no altera** ninguna vista existente del destino.
- `pnpm build` + `pnpm lint` OK. Rutas/roles actuales intactos.
- `AiServiceClient/` eliminado y sin referencias colgantes.

## Decisiones ya tomadas (NO vuelvas a preguntar)
- **Roles:** IA para **admin y cliente** (rutas en ambos árboles, ver paso 4).
- **Landing:** **sin landing**, "IA" → directo a Chat. Se descarta `Dashboard.jsx` del AI client.
- **Borrado:** `AiServiceClient/` se elimina **en esta misma rama**, en commit separado, paso 6.
- **`userId`:** lo resuelves tú leyendo `authStore.js` y el login (campo `user.id` / `user._id` / `user.uid`).
  No es decisión del usuario — solo úsalo correcto y déjalo anotado en el log.
- **AR:** **incluido** en la migración (backend aparte `:8000`). Verifica que el servicio exista antes
  de portar; si no existe, AR queda con TODO (ver Nota AR, paso 2).
- **HTTP:** las llamadas IA se migran al **axios compartido `shared/api/api.js`** (refresh token gratis).
  No `fetch` crudo nuevo. WS sigue siendo WS nativo con token de `aiAuth`.
- **react-router:** destino es **v7**; adapta el routing portado, no copies el v6 del AI client.

## Cierre (obligatorio)
- Log en `.obisidian-notes/logs/` (convención: `YYYY-MM-DD-<tema>.md`, frontmatter `tags`/`date`, enlaces `[[...]]`).
- Actualiza `estructura/HaircutFiveFriendsFrontend.md` y `AGENT-CONTEXT.md` (rutas/env/deps nuevas,
  baja de `AiServiceClient`).
