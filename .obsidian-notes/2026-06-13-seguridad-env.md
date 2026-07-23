---
tags: [haircutfivefriends, documentacion/backend, seguridad]
date: 2026-06-13
---

# Seguridad — `.env` trackeados y rotación de secretos

Hallazgo de la auditoría (Fase 4). Decisión del usuario: **solo reportar** (no tocar git). Relacionado:
[[2026-06-13-auditoria-ai-services]], [[AiServiceServer]], [[AiServiceClient]].

## Estado actual (CRÍTICO)

`.env` **trackeados en git** (confirmado con `git ls-files`):

- `.env` (raíz del repo)
- `AiServiceClient/.env`
- `AiServiceServer/.env`  ← incluye `JWT_SECRET` (secreto sensible)
- `HaircutFiveFriendsFrontend/.env`

> En alcance de esta tarea: los dos de los servicios de IA. Los otros dos (`raíz` y `Frontend`) se
> reportan por ser el mismo riesgo, pero **no** se tocan (fuera de alcance).

- `.gitignore` **no excluye** `.env`:
  - `AiServiceServer/.gitignore` solo ignora `node_modules/` y `.DS_Store`.
  - `AiServiceClient/.gitignore` no tiene regla para `.env`.
- **No** se encontraron API keys hardcodeadas ni JSON de service account en el código fuente (solo en
  `node_modules`). La app usa ADC/Vertex, no API key.
- `GOOGLE_GENAI_USE_ENTERPRISE` está en `AiServiceServer/.env` pero **no la lee** `@google/genai` v1.50.1
  (variable muerta; se puede eliminar).

## Acción realizada (sin tocar git)

- Creado `AiServiceServer/.env.example` y `AiServiceClient/.env.example` con **todos los nombres** de
  variables y placeholders, **sin valores reales**. Incluyen comentarios sobre ADC y modelos.

## Pasos que debe ejecutar el usuario (NO ejecutados aquí)

1. **Rotar manualmente** `JWT_SECRET` de `AuthService`/`AiServiceServer` (estuvo en git). Coordinar con
   los demás servicios que comparten el secreto. Revisar también credenciales del `.env` raíz y Frontend.
2. Añadir a `.gitignore` (cada servicio o raíz):
   ```gitignore
   .env
   .env.*
   !.env.example
   ```
3. Dejar de trackear los `.env` sin borrarlos del disco:
   ```bash
   git rm --cached .env AiServiceClient/.env AiServiceServer/.env HaircutFiveFriendsFrontend/.env
   git commit -m "chore(security): dejar de trackear archivos .env y añadir .env.example"
   ```
4. (Opcional, **destructivo**, requiere coordinación + force-push) Purgar los `.env` del historial con
   `git filter-repo` o BFG si el repo es privado y se quiere borrar el rastro histórico.
5. Eliminar `GOOGLE_GENAI_USE_ENTERPRISE` del `.env` (variable muerta) y, si se desea, cambiar
   `VERTEX_TEXT_MODEL=gemini-3.1-flash-lite-preview` → `gemini-3.1-flash-lite` (estable) tras confirmar
   acceso del proyecto GCP.

## Por qué importa

Un secreto trackeado queda en el historial de git aunque se borre del archivo; cualquiera con acceso al
repo (o a un fork/clon) puede leerlo. Por eso la rotación es obligatoria, no solo el `git rm`.
