---
tags: [haircutfivefriends, documentacion/frontend, ui, tailwind]
date: 2026-06-14
---

# Rediseño del chat en [[AiServiceClient]] — Tailwind v4 + ventana más alta

Petición del usuario: el chat se veía poco (alto fijo) y querer mejor diseño con
**ui-ux-pro-max**, en **Tailwind**, sin romper lógica y **fácil de revertir**.

## Contexto

- Tailwind v4 ya estaba instalado y cableado: `@tailwindcss/vite` en `vite.config.js`
  + `@import "tailwindcss"` en `src/styles/index.css`. Antes nadie lo usaba en el chat.
- Los componentes del chat usaban **inline styles** con colores genéricos
  (`#007bff`, `#28a745`, `#ff4d4d`) que **no** casaban con el design system de la app
  (crema cálido, acento teal `#1f8a70`, Space Grotesk, glass — definido en `index.css`).
- `ChatWindow` tenía `height: '500px'` fijo → "no se ve mucho del chat".

## Decisión de diseño

`ui-ux-pro-max --design-system` recomendó patrón **AI-Native UI** (typing indicator,
texto streaming, sin chrome pesado, buen contraste) y un palette morado/teal en dark.
**Se mantuvo el palette existente de la app** (teal/crema) por la regla de **consistencia**
— solo se adoptaron los patrones, no los colores nuevos.

## Cambios (`AiServiceClient/src/app/components/`)

- **ChatWindow.jsx** — alto `500px` → `clamp(420px, calc(100dvh - 340px), 880px)`
  (crece hacia abajo, responsive, `dvh` para móvil). Burbujas alineadas al palette
  (usuario = teal, modelo = gris neutro). Nuevo **indicador de escritura** (3 puntos
  con `animate-bounce`, respeta `motion-reduce`). `aria-live` en el indicador.
- **ChatForm.jsx** — input/botón a Tailwind; botón teal con `hover:accent-strong`,
  `focus:ring`, `cursor-pointer`, estados `disabled`.
- **ChatHeader.jsx** — alineado al palette; botón "Limpiar" en rojo semántico suave.
- **ChatFooter.jsx** — texto `muted`.

**Lógica intacta:** props, `useRef`, `useEffect` de auto-scroll, handlers — sin tocar.
`ChatPage.jsx` no cambió (sigue usando `.page` / `.chat-card` de `index.css`).

## Verificación

- `pnpm lint`: los 8 errores son **pre-existentes** en otros archivos (`VoicePage.jsx`,
  `authStorage.js`, `pcm-worklet.js`, hook de voz). Ningún componente del chat tiene errores.

## Git (revert fácil)

- Trabajo aislado en rama `ft/chat-redesign`, 1 commit (`c14d034`).
- El usuario aprobó → **merge fast-forward a `ft/angel`** + rama borrada (`git branch -d`).
- Si se quisiera deshacer ahora: revertir el commit `c14d034`.

Relacionado: [[2026-06-14-multi-region-genai]], [[2026-06-13-fix-auth-db-y-live-voz]].
