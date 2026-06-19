---
tags: [haircutfivefriends, documentacion/backend, estructura]
date: 2026-06-14
---

# Estructura: HaircutFiveFriends (Main Business API)

Servicio principal de negocio para la gestión de barberías: barberos, citas, ventas, inventario y facturación.

---

## 1. Archivos en `src/` y Estructura Principal

```
HaircutFiveFriends/
├── index.js                     # Punto de entrada del servidor
├── configs/
│   ├── app.js                   # Configuración del Express server y ruteador
│   ├── cors-configuration.js    # Políticas CORS
│   ├── db.js                    # Inicialización de Mongoose (MongoDB)
│   ├── helmet-configuration.js  # Seguridad HTTP
│   └── swagger.js               # Documentación de endpoints
├── middlewares/                 # Validadores del negocio (Mongoose schemas)
├── services/
│   ├── base64ImageService.js    # Conversor e integrador de imágenes
│   └── genaiService.js          # Servicio legacy de recomendaciones de IA
└── src/
    ├── aiHaircut/               # Endpoints de generación/análisis de corte por IA (Sincronizado)
    ├── aiHaircutImage/          # Generador de cortes usando Vertex Image AI
    ├── appointment/             # Agenda y disponibilidad de citas de barbería
    ├── barber/                  # Datos de barberos, horarios y asignación
    ├── client/                  # Ficha de clientes, puntos acumulados por compra
    ├── detailSale/              # Detalle del carrito/venta de productos
    ├── favorites/               # Cortes favoritos guardados por clientes
    ├── haircut/                 # Catálogo de cortes de cabello e idoneidad de rostro
    ├── invoice/                 # Generación de facturas físicas en formato PDF
    ├── product/                 # Control de inventario y venta de productos físicos
    ├── review/                  # Reseñas otorgadas a barberos
    ├── sale/                    # Gestión de cobros y transacciones de caja
    ├── service/                 # Servicios ofrecidos (lavado, afeitado, corte)
    └── statistics/              # Reportes de ventas y citas en PDF
```

---

## 2. Rutas del Servicio (`BASE_PATH = /HaircutFiveFriends/api/v1`)

* **Rutas de Barberos (`/barbers`):** `GET /obtener`, `POST /crear`, `PUT /editar/:id`, `DELETE /eliminar/:id`
* **Rutas de Citas (`/appointments`):** `GET /obtener`, `POST /create`, `GET /barber/:id` (disponibilidad)
* **Rutas de Clientes (`/clients`):** `GET /:id/points` (consulta de puntos de fidelidad)
* **Rutas de Cortes (`/haircuts`):** `GET /obtener`, `GET /FaceType/:faceType` (clasificación por rostro)
* **Rutas de Reseñas (`/review`):** `GET /obtener`, `POST /crear`
* **Facturación e Invoicing (`/invoice`):** `GET /pdf/:id` (Generación de PDF con `pdfkit`)
* **IA Generativa / Cortes (`/ai-haircut` & `/ai-haircut-image`):** Endpoints portados para la generación y simulación de cortes de cabello.

---

## 3. Modelos de Base de Datos (MongoDB via Mongoose)

- **`Appointment`:** Fecha, estado (pendiente, completada, cancelada), cliente, barbero y servicios solicitados.
- **`Barber`:** Horarios laborales, nombre, experiencia y promedio de calificación.
- **`Client`:** Puntos acumulados, preferencias y teléfono.
- **`Haircut`:** Nombre del corte, descripción, fotos en Cloudinary e idoneidad según formas de rostro (`OVALADO`, `REDONDO`, `CUADRADO`, `DIAMANTE`, `CORAZON`).
- **`Product`:** Inventario disponible (stock), precio y nombre.
- **`Sale` & `DetailSale`:** Transacciones realizadas con detalle de productos, método de pago y cliente asociado.
- **`Review`:** Calificación numérica y comentario vinculados a un barbero.
- **`Service`:** Catálogo de servicios disponibles con duración estimada y costos.
