---
tags: [haircutfivefriends, documentacion/frontend, estructura, ai]
date: 2026-06-14
---

# Estructura: AiServiceClient

Cliente React especializado para interactuar con las herramientas de IA inteligente (chat interactivo, recomendador facial y agente telefónico por voz bidireccional).

---

## 1. Estructura de Directorios en `src/`

```
AiServiceClient/
├── index.html                   # Contenedor DOM
├── vite.config.js               # Plugin de React 19 y Tailwind v4
└── src/
    ├── app/
    │   ├── components/          # Voz interactiva, burbujas de chat, SidebarNav, UserMenu (logout)
    │   ├── constants/           # Direcciones de endpoints y configuraciones de audio
    │   ├── hooks/               # useChat (gestión de estado de chatbot), useLiveAudio
    │   ├── layouts/             # Contenedor visual de las páginas de IA
    │   ├── pages/               # ChatPage, FacialAnalysisPage, VoiceAgentPage
    │   ├── routes/              # Navegador de rutas React Router v6
    │   ├── services/            # Servicios de audio y adaptadores WebSocket
    │   ├── utils/               # Conversores PCM y gestores de dispositivos
    │   ├── worklets/            # AudioWorklet (Procesador PCM16 @16kHz en hilo alterno)
    │   ├── App.jsx              # Configuración del enrutador y layout base
    │   └── main.jsx             # Renderizado del virtual DOM
    ├── assets/                  # Ilustraciones animadas e iconos vectoriales SVG
    └── styles/
        └── index.css            # Design system: tokens @theme (Tailwind v4) + Bento + dark gold
```

> Design system (ver [[2026-06-16-aiserviceclient-rediseno-bento-aurora]]): tokens en
> `@theme` → utilidades `bg-accent`/`text-ink`/`font-display`...; `:root` como alias.
> Paleta dark gold (tipo Haircut), Bento Grid asimétrico, fondo dot-grid estático,
> fuentes Syne + Space Grotesk + IBM Plex Mono. Shell de altura fija (solo `ChatWindow` scrollea).

---

## 2. Tecnologías y Estructuras Específicas de IA

- **Audio de Baja Latencia (AudioWorklet API):**
  - Implementado para evitar retardos en la retransmisión de voz bidireccional de la Live API.
  - El procesador reside en `src/app/worklets/pcm-processor.js` y captura audio directo a 16,000Hz (PCM16 Mono) en un hilo auxiliar para no degradar el renderizado del browser. Reemplaza el uso de ScriptProcessorNode (deprecated).
- **Conectores WebSockets:**
  - Comunicación interactiva directa con `ws://localhost:3007` para habilitar el agente de voz.
- **React Router Dom (v6.30):**
  - Navegación simplificada entre las tres funcionalidades insignia de la plataforma.
- **TailwindCSS (v4):**
  - Diseño responsivo y oscuro con animaciones y efectos de gradientes fluidos para simular ondas de audio activas.

---

## 3. Conexiones con Backends

- **Servidor de Inteligencia Artificial (Puerto 3007):**
  - Se comunica mediante la variable de entorno `VITE_API_URL` para transacciones REST (mensajes de chat, carga de fotos faciales de la webcam, análisis de reseñas de barbería).
  - Utiliza la variable `VITE_WS_URL` para orquestar la conexión de WebSocket en vivo y recibir transmisiones fluidas de audio.
