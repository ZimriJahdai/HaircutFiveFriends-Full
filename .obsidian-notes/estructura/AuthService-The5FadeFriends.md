---
tags: [haircutfivefriends, documentacion/auth, estructura]
date: 2026-06-14
---

# Estructura: AuthService-The5FadeFriends

Servicio centralizado de autenticación, control de accesos y aprobación de registros de barberos.

---

## 1. Archivos en `src/` y Estructura Principal

```
AuthService-The5FadeFriends/
├── index.js                     # Punto de entrada principal (Bootstrap)
├── configs/
│   ├── app.js                   # Configuración del Express server
│   ├── cors-configuration.js    # Políticas CORS por entorno
│   ├── db.js                    # Inicialización de Sequelize
│   ├── helmet-configuration.js  # Cabeceras de seguridad
│   └── swagger.js               # Documentación OpenAPI/Swagger
├── helpers/
│   ├── auth-operations.js       # Operaciones de login/registro
│   ├── cloudinary-service.js    # Carga de fotos de perfil
│   ├── data-seeder.js           # Semillero de roles y administrador inicial
│   ├── email-service.js         # Envío de correos de verificación y reseteos
│   ├── file-upload.js           # Configuración de Multer
│   ├── file-validator.js        # Validaciones de imágenes
│   ├── generate-jwt.js          # Generación de tokens de acceso y refresh
│   ├── profile-operations.js    # Edición de perfiles
│   ├── role-constants.js        # Constantes de roles
│   ├── role-db.js               # Consultas a la tabla roles
│   ├── role-seed.js             # Semilla de roles
│   ├── signup-request-db.js     # Operaciones de preregistro
│   ├── user-db.js               # Consultas de usuarios
│   └── uuid-generator.js        # Generador de UUIDs seguros
└── src/
    ├── auth/
    │   ├── auth.controller.js   # Lógica de login, aprobación y registro
    │   ├── auth.routes.js       # Endpoints de autenticación
    │   ├── role.model.js        # Modelo Sequelize de Roles
    │   ├── signup-request.controller.js
    │   └── signup-request.model.js # Modelo Sequelize de solicitudes de registro
    └── users/
        ├── user.controller.js   # Gestión de perfiles de usuario
        ├── user.model.js        # Modelo Sequelize de Usuarios (PostgreSQL)
        └── user.routes.js       # Endpoints de perfiles de usuario
```

---

## 2. Rutas del Servicio (`BASE_PATH = /api/v1`)

* **Rutas de Autenticación (`/auth`):**
  - `POST /login` -> Autenticación de usuarios. Retorna Access JWT + Refresh JWT.
  - `POST /register` -> Autenticación para registro inicial de clientes.
  - `POST /signup-barber` -> Envío de solicitud de registro para barberos. Requiere aprobación.
  - `POST /refresh-token` -> Intercambio de Refresh Token por nuevo Access Token.
  - `POST /verify-email/:token` -> Validación de dirección de correo.
  - `POST /reset-password` -> Solicitud y ejecución de reseteo de clave.
  - `PUT /approve-barber/:id` -> Aprobación de solicitud de registro de barbero (Solo Admin).
* **Rutas de Usuarios (`/users`):**
  - `GET /profile` -> Obtener datos del usuario autenticado.
  - `PUT /profile/edit` -> Actualización de datos de perfil y carga de avatar a Cloudinary.
* **Sistema de Monitoreo:**
  - `GET /health` -> Retorna estado saludable del servidor de base de datos y Express.

---

## 3. Modelos de Base de Datos (PostgreSQL via Sequelize)

- **`Role`:** Define los roles (`ADMIN_ROLE`, `BARBER_ROLE`, `CLIENT_ROLE`).
- **`User`:** Contiene datos principales, contraseñas cifradas con `argon2` y estado de aprobación de cuenta.
- **`SignupRequest`:** Almacena temporalmente los datos y credenciales de barberos pendientes de verificación y aprobación administrativa.
