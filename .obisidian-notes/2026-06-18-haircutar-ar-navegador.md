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

## Pendiente (Fase 2)
- 3D con **Three.js** (modelo de pelo anclado con la matriz de pose + oclusión). El recorte
  2D actual pierde realismo en giros fuertes porque el retrato de Gemini es frontal/estático.

## Verificación
`pnpm build` y `pnpm lint` del frontend principal en verde. Requiere `AiServiceServer` (3007)
arriba; `getUserMedia` necesita `localhost` o HTTPS.
