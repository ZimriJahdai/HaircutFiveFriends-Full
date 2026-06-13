# MASTER PROMPT — Refactor real de AiServiceClient + AiServiceServer

## Repo objetivo

Trabaja sobre este repositorio:

`Narizaico-code/HaircutFiveFriends`

El objetivo principal es refactorizar y mejorar **solo**:

* `AiServiceClient`
* `AiServiceServer`

No refactorices otros proyectos del monorepo salvo que sea necesario para entender contratos, endpoints o integración entre servicios.

---

# Regla principal: no alucinar

No inventes rutas, archivos, modelos Gemini, variables de entorno, endpoints ni arquitectura.

Antes de crear cualquier archivo nuevo:

1. Verifica si ya existe una ubicación equivalente.
2. Respeta la estructura actual del proyecto.
3. Si propones una nueva carpeta o archivo, justifica por qué es necesario.
4. No uses nombres genéricos inventados si el proyecto ya tiene una convención distinta.

No asumas que un modelo Gemini existe solo por su nombre. Verifícalo en documentación oficial actualizada antes de cambiarlo.

---

# Contexto real del repo

El repo tiene varios proyectos. Para esta tarea enfócate en:

```txt
AiServiceClient/
AiServiceServer/
```

En `AiServiceClient` ya existe una estructura tipo:

```txt
AiServiceClient/src/
  app/
    components/
    constants/
    hooks/
    layouts/
    pages/
    routes/
    services/
    utils/
    worklets/
    App.jsx
    main.jsx
  styles/
    index.css
```

En `AiServiceServer` ya existe una estructura tipo:

```txt
AiServiceServer/
  configs/
  middlewares/
  services/
  src/
    ai/
    aiHaircut/
    aiHaircutImage/
    auth/
    chats/
    reviews/
    vision/
    index.js
```

Respeta esas carpetas antes de crear otras.

---

# Seguridad obligatoria

Hay archivos `.env` visibles en el repo. No imprimas su contenido.

Audita esto inmediatamente:

* Si `.env` contiene secretos reales, no los copies en logs ni reportes.
* Asegúrate de que `.env` esté en `.gitignore`.
* Crea o corrige `.env.example` con nombres de variables, pero sin valores reales.
* Si detectas credenciales reales trackeadas, reporta que deben rotarse manualmente.
* No intentes “arreglar” una credencial expuesta cambiándola por otra inventada.

---

# Fase 0 — Análisis inicial obligatorio

Antes de tocar archivos:

1. Lee la estructura actual de `AiServiceClient` y `AiServiceServer`.

2. Lee:

   * `AiServiceClient/package.json`
   * `AiServiceClient/vite.config.js`
   * `AiServiceClient/src/app/main.jsx`
   * `AiServiceClient/src/app/App.jsx`
   * `AiServiceClient/src/styles/index.css`
   * `AiServiceServer/package.json`
   * `AiServiceServer/src/index.js`
   * archivos dentro de `AiServiceServer/configs`
   * archivos dentro de `AiServiceServer/middlewares`
   * archivos dentro de `AiServiceServer/services`
   * archivos relevantes dentro de `AiServiceServer/src/ai`
   * archivos relevantes dentro de `AiServiceServer/src/reviews`
   * archivos relevantes dentro de `AiServiceServer/src/vision`
   * `AiServiceServer/MIGRATION_PLAN_ADC.md`

3. Excluye carpetas generadas:

   * `node_modules`
   * `.git`
   * `dist`
   * `build`
   * `coverage`

4. Entrega un resumen antes de modificar:

   * Arquitectura real detectada.
   * Cómo se comunica el cliente con el servidor.
   * Qué endpoints principales usa el cliente.
   * Qué partes del servidor llaman a Gemini.
   * Estado aparente de Tailwind.
   * Estado aparente de la migración a Google Cloud / ADC / Vertex.
   * Riesgos encontrados.
   * Plan de cambios por fases.

No modifiques archivos hasta entregar este resumen.

---

# Fase 1 — Auditoría del servidor

Audita `AiServiceServer`.

Busca bugs como:

* Promesas sin `await`.
* Errores async no manejados.
* `try/catch` que solo hacen `console.log` o silencian errores.
* Validación insuficiente de `req.body`, `req.params`, `req.query`.
* Endpoints que aceptan datos arbitrarios.
* Errores HTTP inconsistentes.
* WebSockets sin cleanup correcto.
* Listeners no removidos.
* Timeouts ausentes en llamadas externas.
* Reintentos mal implementados o inexistentes.
* Variables de entorno usadas sin validación.
* Código que usa modelos Gemini hardcodeados sin validación.
* Uso mezclado de API Key, ADC, Vertex, Gemini Developer API o Google Cloud sin una decisión clara.

Busca malas prácticas como:

* Lógica de negocio dentro de controllers.
* Servicios demasiado largos o con varias responsabilidades.
* Helpers duplicados.
* Configuración repetida.
* Constantes mágicas.
* Respuestas de error que filtran detalles internos.
* Dependencias instaladas pero no usadas.

Por cada problema:

* Indica archivo.
* Explica qué está mal.
* Explica por qué importa.
* Aplica un fix pequeño.
* Reporta qué cambiaste.

---

# Fase 2 — Auditoría Gemini / Google GenAI / Vertex / ADC

Antes de cambiar código, busca documentación oficial actualizada.

Verifica:

* Uso actual de `@google/genai`.
* Si todavía quedan restos de SDKs viejos o métodos viejos.
* Si hay llamadas manuales `fetch` a Gemini que conviene reemplazar.
* Si se usa `GoogleGenAI` correctamente.
* Si el repo está intentando usar:

  * Gemini Developer API con API Key
  * Gemini en Google Cloud / Vertex / Enterprise con ADC
  * una mezcla incompleta de ambas cosas

Debes revisar especialmente:

* `AiServiceServer/services/genaiService.js`
* `AiServiceServer/src/ai`
* `AiServiceServer/src/reviews`
* `AiServiceServer/src/vision`
* cualquier archivo que importe `@google/genai`
* cualquier archivo que use `GEMINI_API_KEY`
* cualquier archivo que use `GOOGLE_CLOUD_PROJECT`
* cualquier archivo que use `GOOGLE_CLOUD_LOCATION`
* cualquier archivo que use `GOOGLE_GENAI_USE_VERTEXAI`
* cualquier archivo que use `GOOGLE_GENAI_USE_ENTERPRISE`
* cualquier archivo que abra WebSocket hacia Gemini

## Modelos Gemini

No cambies modelos a ciegas.

Haz esto:

1. Lista todos los modelos usados actualmente.
2. Indica en qué archivo aparecen.
3. Verifica si existen según documentación oficial actualizada.
4. Si un modelo parece preview/experimental/deprecado/no disponible:

   * No lo reemplaces silenciosamente.
   * Propón alternativa documentada.
   * Explica el impacto.
5. Centraliza modelos en variables de entorno solo si mejora el proyecto.
6. Documenta modelos en `.env.example`.

## Migración Google Cloud / ADC

El repo tiene un plan de migración a ADC. Verifica si se completó realmente.

Revisa:

* Si todavía hay API keys en uso.
* Si `GoogleGenAI` se inicializa una sola vez o en varios archivos.
* Si se usa ADC correctamente.
* Si hay project/location configurados de forma consistente.
* Si el WebSocket usa auth compatible con el backend elegido.
* Si hay variables viejas y nuevas coexistiendo sin necesidad.
* Si el servidor puede iniciar cuando faltan variables obligatorias.
* Si los errores son claros cuando falta configuración.

No declares “migración completada” hasta confirmar que:

* todas las rutas Gemini usan el mismo enfoque,
* no quedan llamadas incompatibles,
* los tests o verificación manual pasan.

---

# Fase 3 — Refactor del servidor

Aplica cambios pequeños y seguros.

Prioridades:

1. Separar configuración de lógica.
2. Separar controllers de servicios.
3. Mantener archivos razonablemente cortos.
4. Evitar crear carpetas nuevas si las existentes sirven.
5. Extraer helpers repetidos.
6. Normalizar errores.
7. Validar inputs.
8. Evitar filtrar secretos.
9. Mantener compatibilidad con el cliente.

Si un archivo está demasiado grande:

* Divide por responsabilidad real.
* No crees abstracciones innecesarias.
* No rompas imports sin actualizar todo.

---

# Fase 4 — Auditoría del cliente

Audita `AiServiceClient`.

Ten en cuenta que el cliente ya usa React + Vite y ya parece tener Tailwind instalado.

Busca:

* Fetch/axios sin `AbortController` cuando aplica.
* Requests que siguen vivos al desmontar componentes.
* `useEffect` con dependencias incorrectas.
* Estado global innecesario.
* Props drilling excesivo.
* Lógica de negocio dentro de componentes visuales.
* Componentes demasiado largos.
* CSS global enorme que podría convertirse a componentes/Tailwind.
* Manejo inconsistente de loading/error/success.
* Botones sin estado disabled durante requests.
* Inputs sin label o accesibilidad básica.
* Falta de feedback visual.
* Renders innecesarios.

Por cada problema:

* Indica archivo.
* Explica el problema.
* Aplica fix.
* No cambies diseño y lógica al mismo tiempo si es un cambio grande.

---

# Fase 5 — Tailwind y rediseño visual

No digas “migrar a Tailwind” sin verificar.

Primero confirma:

* Si `tailwindcss` está instalado.
* Si `@tailwindcss/vite` está configurado en `vite.config.js`.
* Si `src/styles/index.css` importa Tailwind con `@import "tailwindcss";`.
* Si Tailwind realmente funciona en build/dev.
* Si hay CSS viejo que todavía se usa.

Si Tailwind ya está instalado:

* No reinstales dependencias innecesarias.
* No agregues `tailwind.config.js` solo por costumbre si Tailwind v4 no lo necesita.
* No agregues PostCSS/autoprefixer si el setup actual con Vite plugin funciona.
* Enfócate en limpiar CSS global, mejorar componentes y usar utilidades Tailwind.

Rediseño esperado:

* UI moderna, limpia y profesional.
* Mobile-first.
* Estados hover/focus/active/disabled.
* Buen contraste.
* Layout estable.
* Componentes reutilizables.
* Accesibilidad básica.

Puedes crear o mejorar componentes solo si el proyecto realmente los necesita:

* Button
* Input
* Textarea
* Card
* Modal
* Badge
* Spinner
* Alert
* EmptyState

No crees una librería de componentes gigante si solo se usan 2 o 3 piezas.

---

# Fase 6 — Testing

Primero detecta si ya hay framework de tests.

Revisa scripts en `package.json`.

Si no existen tests:

## Server

Agrega testing de forma mínima y útil.

Para Node/Express moderno:

* Usa Vitest o Jest, el que encaje mejor con el setup ESM.
* Usa Supertest para endpoints HTTP.
* Mockea Gemini / Google GenAI.
* No hagas llamadas reales a Gemini en tests.

Tests mínimos:

* Endpoint crítico con payload válido.
* Payload inválido devuelve 400.
* Error Gemini 429 se traduce a respuesta controlada.
* Error Gemini 500/503 se maneja sin crashear.
* No se filtran secretos ni stack traces al cliente.

## Client

Para Vite + React:

* Usa Vitest + Testing Library si no hay framework existente.
* Mockea servicios de API.
* No dependas del servidor real.

Tests mínimos:

* Render básico de páginas principales.
* Interacción principal.
* Estado loading.
* Estado success.
* Estado error.
* Request abortado si el componente se desmonta durante una llamada.

Actualiza scripts:

* `test`
* `test:watch` si aplica
* `coverage` solo si lo configuras realmente

---

# Fase 7 — Verificación manual y automática

Después de cada fase ejecuta lo que exista o lo que agregaste:

Cliente:

```bash
cd AiServiceClient
npm install
npm run lint
npm run build
npm test
```

Servidor:

```bash
cd AiServiceServer
npm install
npm run lint
npm test
npm run dev
```

Si algún comando no existe:

* No inventes que pasó.
* Reporta “no existe script”.
* Propón agregarlo si aporta.

Si un comando falla:

* Copia el error relevante.
* Explica si bloquea o no.
* Corrige si está dentro del scope.

---

# Reglas de edición

En cada cambio:

* Haz commits conceptuales pequeños, aunque no puedas commitear.
* Cambia pocos archivos por paso.
* No mezcles refactor, diseño y tests en el mismo cambio grande.
* No cambies endpoints sin actualizar cliente y tests.
* No borres lógica sin buscar referencias.
* No imprimas secretos.
* No dejes código comentado muerto.
* Usa nombres consistentes con el repo.
* Prefiere named exports si ya es consistente con el proyecto.
* Mantén imports ordenados.
* Evita archivos enormes.
* Si un archivo crece demasiado, divide por responsabilidad real.

---

# Reporte obligatorio al terminar cada fase

Entrega:

```txt
FASE X — Resultado

Archivos editados:
- ...

Archivos creados:
- ...

Archivos eliminados:
- ...

Cambios realizados:
- ...

Verificación:
- comando: resultado
- comando: resultado

Pendientes / riesgos:
- ...
```

---

# Reporte final

Al terminar todo, entrega:

## 1. Bugs corregidos

Tabla:

* Bug
* Archivo
* Causa raíz
* Fix
* Verificación

## 2. Malas prácticas eliminadas

Tabla:

* Problema
* Archivo
* Cambio aplicado
* Motivo

## 3. Estado real de Gemini / Google Cloud

Incluye:

* SDK detectado.
* SDK final usado.
* Backend final usado:

  * Gemini Developer API con API Key
  * o Gemini en Google Cloud / Vertex / Enterprise con ADC
* Variables de entorno finales.
* Modelos usados.
* Modelos descartados o reemplazados.
* Evidencia de que la migración ADC quedó completa o no.

## 4. Cambios de rendimiento

Incluye:

* Cliente Gemini singleton o no.
* Retry/backoff.
* Timeouts.
* Streaming o motivo para no implementarlo.
* Reducción de llamadas innecesarias.
* Manejo de errores.

## 5. Cambios del cliente

Incluye:

* Componentes refactorizados.
* Hooks/services creados o mejorados.
* CSS eliminado o reducido.
* Uso real de Tailwind.
* Mejoras responsive.
* Mejoras de accesibilidad.

## 6. Tests

Incluye:

* Tests creados.
* Tests modificados.
* Qué cubren.
* Qué se mockeó.
* Resultado de los comandos.

## 7. Seguridad

Incluye:

* Estado de `.env`.
* Estado de `.env.example`.
* Si hay secretos expuestos.
* Qué debe rotarse manualmente.
* Qué quedó protegido.

## 8. Deuda técnica pendiente

Tabla:

* Pendiente
* Prioridad: alta/media/baja
* Riesgo
* Recomendación

## 9. Estado final

Di claramente:

* Qué funciona.
* Qué no se pudo verificar.
* Qué requiere acción humana.