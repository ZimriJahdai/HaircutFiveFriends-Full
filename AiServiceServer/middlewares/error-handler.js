// Manejador de errores central de Express.
// Objetivo: respuestas consistentes y SIN filtrar stack traces ni detalles internos
// (secretos, rutas, mensajes crudos de Gemini/Vertex) al cliente.

const isProd = process.env.NODE_ENV === 'production';

/**
 * Normaliza el status de un error proveniente de Gemini/Vertex (status/code)
 * o de axios (response.status). Los 429/503 se exponen como 503 (reintentar).
 */
const resolveStatus = (err) => {
  const raw =
    Number(err?.status) ||
    Number(err?.code) ||
    Number(err?.response?.status) ||
    0;

  if (raw === 429 || raw === 503) return 503;
  if (raw >= 400 && raw <= 599) return raw;
  return 500;
};

const messageForStatus = (status) => {
  if (status === 503) return 'Servicio de IA temporalmente no disponible. Reintenta en unos segundos.';
  if (status === 429) return 'Demasiadas solicitudes. Intenta de nuevo mas tarde.';
  if (status >= 400 && status < 500) return 'Solicitud invalida.';
  return 'Error interno del servidor.';
};

// eslint-disable-next-line no-unused-vars -- Express requiere los 4 parametros
export const errorHandler = (err, req, res, next) => {
  const status = resolveStatus(err);

  // Log completo del lado del servidor (incluye stack); nunca al cliente.
  console.error(`[ErrorHandler] ${req.method} ${req.originalUrl} -> ${status}:`, err);

  if (res.headersSent) return next(err);

  const body = { error: { message: messageForStatus(status) } };
  // En desarrollo, adjuntar detalle para depurar (no en produccion).
  if (!isProd && err?.message) body.error.detail = err.message;

  res.status(status).json(body);
};
