# AI Development Log - TodoGemini Frontend (Client)
**Fecha:** 19 de Abril de 2026
**Estado:** Interfaz de Chat migrada a persistencia en DB.

## Cambios Realizados
1. **Eliminación de LocalStorage:** El historial de chat ya no se guarda en el navegador. Se carga directamente desde MongoDB al iniciar el componente `App.jsx`.
2. **Identidad de Administrador:** Se ha fijado el `ADMIN_USER_ID` como `usr_h7P8aFYXXM7r` (ID del AuthService) para todas las operaciones.
3. **Optimización de Mensajería:** El cliente solo envía el mensaje actual (`input`) y el `userId`. El backend se encarga de recuperar y actualizar el historial completo en la DB.
4. **Gestión de Historial:** Se implementó una función `clearChat` que realiza una petición `DELETE` al servidor para limpiar la base de datos de forma persistente.
5. **Visualización:** Mejora en el renderizado de mensajes para diferenciar visualmente entre el usuario y Gemini, y soporte inicial para indicar estados de "pensando".

## Pendientes UI:
- Implementar componente de carga de imágenes para el Módulo 3 (Visión).
- Implementar componente de visualización de reportes para el Módulo 4 (Reseñas).
- Implementar lógica de `MediaRecorder` para el Módulo 2 (Voz).
