---
tags: [haircutfivefriends, documentacion/frontend, estructura]
date: 2026-06-14
---

# Estructura: HaircutFiveFriendsFrontend

Aplicación cliente principal de la barbería para programar citas, ver cortes, comprar productos y administrar la sucursal.

---

## 1. Estructura de Directorios en `src/`

```
HaircutFiveFriendsFrontend/
├── index.html                   # HTML Principal
├── vite.config.js               # Ajustes de empaquetado (React 19 + Tailwind v4)
└── src/
    ├── app/
    │   ├── layouts/             # Plantillas base (LayoutAdmin, LayoutClient)
    │   ├── pages/               # Vistas principales (Home, BarberDashboard, Profile)
    │   ├── router/              # Declarador de rutas mediante React Router Dom v7
    │   ├── App.jsx              # Configuración global y toasts
    │   └── main.jsx             # Punto de montaje del Virtual DOM
    ├── assets/                  # Logos, imágenes por defecto de cortes y barberos
    ├── features/                # Módulos encapsulados por dominio
    │   ├── auth/                # Pantalla de Login, Registro, Recuperación de clave
    │   ├── barber-admin/        # Panel del barbero (revisar citas de hoy, marcar completado)
    │   ├── barber-client/       # Selección interactiva de barbero para agendamiento
    │   ├── client/              # Perfil de cliente, historial de visitas y puntos
    │   ├── client-admin/        # Gestión administrativa global de clientes (Solo Admin)
    │   ├── favorites/           # Sección de cortes de cabello guardados
    │   └── haircut/             # Galería visual de cortes de cabello de la barbería
    ├── shared/
    │   ├── api/                 # Cliente de Axios configurado con interceptor de tokens
    │   ├── components/          # Botones, entradas de formulario, loaders compartidos
    │   └── utils/               # Formateadores de fecha, gestores de almacenamiento
    └── styles/
        └── index.css            # Archivo CSS global (con importación de Tailwind v4)
```

---

## 2. Tecnologías y Librerías Clave

- **React 19:** Biblioteca base de renderizado e interfaces reactivas.
- **Vite (v8):** Bundler ultrarrápido con plugin de recarga en caliente en desarrollo.
- **Zustand (v5):** Gestor de estado ligero y escalable para almacenar tokens de sesión y estados de carga de forma sincrónica.
- **TailwindCSS (v4):** Estilos modernos basados en utilidades compilados mediante Vite Compiler.
- **React Router Dom (v7):** Manejo declarativo del enrutamiento de páginas con soporte de Guards para roles (Client, Barber, Admin).
- **React Hook Form & React Hot Toast:** Validación rápida de formularios y notificaciones visuales emergentes libres de bloqueos.

---

## 3. Conexiones con Backends

- **Autenticación (Puerto 3005):** Consume `VITE_AUTH_URL` para validar claves, crear sesiones y renovar tokens de seguridad JWT.
- **Negocio (Puerto 3006):** Consume `VITE_API_URL` para registrar citas, actualizar perfiles de barberos, ver estadísticas de ganancias e interactuar con el catálogo físico de servicios.
- **Políticas de Desecho:** Uso de `AbortController` integrado en llamadas de red clave para abortar respuestas en desmonte y evitar fugas de memoria.
