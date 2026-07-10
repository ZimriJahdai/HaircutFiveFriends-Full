---
tags: [haircutfivefriends, documentacion/frontend, ui, tailwind, design-system]
date: 2026-06-16
---

# Rediseño visual de [[AiServiceClient]] — Bento + Aurora, hibridación Tailwind y menú de logout

Sesión enfocada **solo** en `AiServiceClient`. No se tocó ningún otro servicio
(explícito del usuario: "de Haircut no toques nada"). Verificado por build limpio
`pnpm build` → `EXIT=0`, 47 módulos.

## Petición del usuario (resumen)

1. Paleta **similar a `HaircutFiveFriendsFrontend`**, estilo **Bento Box Grid + Aurora UI**,
   colores agresivos/alto contraste, tipografía inesperada (sin fuentes de sistema),
   asimetría y espacio negativo generoso. Usar skill **ui-ux-pro-max --design-system**.
2. Hacerlo **lo más híbrido posible** (CSS + Tailwind) sin dañar el diseño.
3. Fondo **estático** (no le gustó el gradiente/aurora animado).
4. **Login** centrado y extravagante (no full-width de izquierda a derecha).
5. **Focus del input del chat**: quitar el amarillo y la doble línea.
6. **Página del chat**: shell fijo a viewport; que solo scrollee el `ChatWindow`,
   no la página ni el sidebar.
7. Añadir **menú en el avatar** para **cerrar sesión**.

## Referencia de paleta (de `HaircutFiveFriendsFrontend`)

Extraída de `src/features/reviews/pages/Reviews.jsx`: oro `#C9A84C`, negros
`#0A0A0A / #1A1A1A / #1E1E1E`, crema `#E8E4DC`, toque teal `#00D2C4` (avatar).
→ Adoptada como base: oro `#E0B84A` (familia Haircut, algo más vivo), negro OLED,
crema `#F2EAD8`, con coral `#FF5E5B` y teal `#00D2C4` como acentos de contraste.

## Decisión de diseño (ui-ux-pro-max)

`--design-system` sugirió **Bento Grid + Dark Mode (OLED)** y, para login,
**Kinetic Brutalism / spotlight gold**. Se **adoptaron los patrones** (bento,
dark, spotlight, tipografía oversized) pero se **rechazó el palette navy** que
proponía el script — se usó la paleta tipo Haircut por pedido explícito.

## Cambios

### 1. `src/styles/index.css` (reescritura del design system)
- **Tokens en `@theme` (Tailwind v4)** → genera utilidades `bg-accent`, `text-ink`,
  `text-muted`, `bg-surface`, `border-line`, `bg-warm`, `font-display`, etc.
- **`:root` como alias** (`--accent: var(--color-accent)`, `--ink`, `--border`...)
  para que todo el CSS de componentes existente siga vivo. **Única fuente de verdad = `@theme`.**
- **Tipografía** (sin fuentes de sistema): **Syne** (display 700/800) + **Space Grotesk**
  (UI) + **IBM Plex Mono** (labels/data). Importadas por Google Fonts.
- **Fondo estático**: se eliminó la aurora animada (`@keyframes auroraDrift`).
  Ahora `body::before` = **dot-grid** tenue (crema 3.5%) sobre negro. Sin gradiente, sin motion.
- **Sistema Bento** (`.bento`, `.bento-tile`, `.is-hero/.is-tall/.is-wide/.is-mini`):
  `grid-template-columns: repeat(6,1fr)` + `grid-auto-flow: dense` → asimetría real.
  Glass, glow en hover, gaps `clamp(16-26px)` (espacio negativo).
- **Layout fijo del shell**: `.app-shell { height:100dvh; overflow:hidden }`,
  `.app-main` y `.sidebar` con `height:100dvh`, `.app-content { flex:1; overflow-y:auto }`.
  En `@media (max-width:900px)` se relaja a `height:auto; overflow:visible` (móvil scrollea normal).
- **Login extravagante** (`.login-stage`, `.login-card-x`, `.login-flair-bar`,
  `.login-ghost`, `.login-submit`): card centrada `max-width:430px`, esquina asimétrica
  `30/30/30/6`, spotlight oro estático, barra oro inclinada `-18°`, wordmark fantasma "AI".
- **Focus inputs**: `.chat-input:focus` / `.login-input:focus` → **una sola** línea sutil
  crema (`rgba(242,234,216,0.5)`), `box-shadow:none` (fuera oro + doble línea).
- **Menú de usuario** (`.user-menu*`) y `.avatar` convertido a botón clicable (hover scale + glow).
- A11y mantenida: `:focus-visible` oro, `@media (prefers-reduced-motion)` mata transiciones.

### 2. `src/app/pages/Dashboard.jsx`
- De grid uniforme a **bento asimétrico** (hero `is-hero` + tiles dispares).
- **SVG icons inline** estilo Lucide (no emoji). Tiles ahora son `<Link>` → navegan a rutas reales.

### 3. Componentes del chat (hibridación a utilidades nombradas)
- `ChatWindow.jsx`: alto `clamp(...)` → **`flex-1 min-h-[420px]`** (solo esta ventana scrollea).
  Burbujas a dark (`bg-white/5 border-line`), usuario en `bg-accent` con texto `#0a0a0a`.
- `ChatForm.jsx`: input `bg-surface border-line`, **focus sin ring** (`focus:border-white/50`);
  botón `bg-accent` texto oscuro.
- `ChatHeader.jsx` / `ChatFooter.jsx`: utilidades `text-ink/text-muted/border-line`, logout en `warm`.
- `ChatPage.jsx`: `<section className="page chat-page">` para el layout de altura fija.

### 4. `src/app/components/UserMenu.jsx` (NUEVO) + `AppShell.jsx`
- Componente aislado: avatar (`<button>`) → dropdown con identidad + **Cerrar sesión**.
- Logout = `clearAuth()` + `navigate('/login', { replace:true })` (no hay endpoint server).
- Identidad **defensiva** desde `getAuth()` (`user.email`/`name`/fallback), iniciales auto.
- A11y: `aria-haspopup="menu"`, `aria-expanded`, `role="menu"/"menuitem"`, cierra con
  **Escape** y **click fuera** (listeners solo cuando abierto + cleanup).
- `AppShell.jsx` solo importa y monta `<UserMenu />` (no se congestionó el layout).

## Verificación
- `pnpm build` → `EXIT=0` (47 módulos). CSS 26.6 → 29.8 kB (utilidades de tokens generadas).
- Confirmado en el bundle que `@theme` generó `.bg-accent`, `.border-line`, `.font-display`,
  `.bg-warm/10`, `.border-warm/40`, etc. (la hibridación funciona; sin clases silenciosas sin estilo).

## Notas / pendientes
- Fondo dot-grid y login extravagante quedaron como **experimentos "para probar"**:
  pueden ajustarse (fondo plano total, login más sobrio/más loco) sin afectar el resto.
- No hubo cambios de rutas/puertos/schemas/dependencias → `AGENT-CONTEXT.md` sin cambios.

Relacionado: [[2026-06-14-chat-ui-redesign]], [[estructura/AiServiceClient]].
