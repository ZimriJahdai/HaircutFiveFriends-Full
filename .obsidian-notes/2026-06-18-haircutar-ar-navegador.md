---
tags: [haircutfivefriends, documentacion/frontend]
date: 2026-06-18
---

# HaircutAR → AR de corte en el navegador

## Qué se hizo y por qué
El microservicio **HaircutAR** (Python/FastAPI) se **jubiló**. Capturaba la cámara en el
servidor (`cv2.VideoCapture`) y transmitía MJPEG → lag y no funcionaba en remoto; además
superponía el **retrato opaco completo** de `/analize` (sin transparencia ni pose) → "pegaba
la foto de la persona". Se reimplementó **100% en el navegador**, acelerado por GPU.

## Cambios

### `HaircutFiveFriendsFrontend` (feature nueva, ruta `/client/probar-corte`)
- **Dependencia nueva:** `@mediapipe/tasks-vision` `0.10.35`.
- **`src/shared/ar/`**: `vision.js` (fileset WASM compartido), `faceLandmarker.js`
  (FaceLandmarker en modo VIDEO + helper `getHeadPose`), `hairSegmentation.js`
  (ImageSegmenter selfie-multiclass → recorta SOLO el pelo con alfa).
- **`src/shared/api/aiHaircut.js`**: cliente axios a [[AiServiceServer]] `:3007`
  `POST /api/ai-haircut/analyze` (JWT reusado vía `VITE_AI_URL`).
- **`src/features/ar-tryon/`**: `store/useTryOnStore.js`, `hooks/useTryOn.js`,
  `hooks/useArTryOn.js` (webcam `getUserMedia` + loop de detección),
  `components/ArTryOnCanvas.jsx` (compone el pelo siguiendo posición/escala/roll/giro aprox.),
  `pages/ProbarCorte.jsx`.
- **Wiring:** ruta en `app/router/AppRouters.jsx`, enlace en `features/client/components/NavbarClient.jsx`,
  `VITE_AI_URL=http://localhost:3007` en `.env`.

### `AiServiceClient` (limpieza de la dependencia con el Python)
- `VisionPage.jsx`: se quitó el stream WebSocket a `:8000` y el envío `sendOverlayToAr`.
- Borrados `services/arApi.js` y `constants/ar.js`; quitadas `VITE_AR_*` del `.env`.

### Repo externo `HaircutAR`
- `README.md` de deprecación + banner en `AI_DEVELOPMENT_LOG.md` (código histórico).

## Estado por fases
- ✅ **Fase 1 — hecho:** recorte 2D del pelo (con alfa) siguiendo posición/escala/roll de la
  cabeza en vivo, todo en el navegador. Ver detalle y ubicación de archivos en
  [[HaircutFiveFriendsFrontend]] (sección "Feature: AR Try-On").
- ⏳ **Fase 2 — pendiente, no iniciada:** 3D con **Three.js** (modelo de pelo anclado con la
  matriz de pose + oclusión). El recorte 2D actual pierde realismo en giros fuertes porque el
  retrato de Gemini es frontal/estático. No empezar sin pedirlo explícitamente.

## Verificación — qué falta probar
`pnpm build` y `pnpm lint` del frontend principal en verde. Requiere `AiServiceServer` (3007)
arriba; `getUserMedia` necesita `localhost` o HTTPS.

**Importante:** esto se implementó en una sesión cloud sin cámara ni GPU física, así que
**nunca se probó en vivo con webcam real**. Falta verificar con hardware real (ideal: la RX
550 que motivó el reporte original):
- que el pelo siga la cabeza sin lag notable (objetivo ~30 fps),
- que el recorte de `ImageSegmenter` realmente aísle solo el pelo (no reaparezca la cara/foto
  completa en algún ángulo o iluminación),
- comportamiento en giros de cabeza fuertes (donde se espera que se note la limitación 2D
  mencionada en Fase 2).
