import { cloudinary } from './file-uploader.js';

/**
 * Middleware para limpiar imagen de Cloudinary si falla la creación/actualización
 * Debe colocarse DESPUÉS del controlador que maneja la lógica
 */
export const cleanupUploadOnError = (err, req, res, next) => {
    // Si hay error y se subió un archivo, eliminarlo de Cloudinary
    if (err && req.file && req.file.filename) {
        cloudinary.uploader.destroy(req.file.filename, (destroyErr) => {
            if (destroyErr) {
                console.error('Error al eliminar imagen de Cloudinary:', destroyErr);
            } else {
                console.log('Imagen eliminada de Cloudinary:', req.file.filename);
            }
        });
    }

    // Pasar el error al siguiente manejador
    next(err);
};

/**
 * Wrapper para controladores async que captura errores y limpia archivos subidos
 */
export const asyncHandlerWithCleanup = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            // Si hay archivo subido y ocurre error, eliminarlo
            if (req.file && req.file.filename) {
                try {
                    await cloudinary.uploader.destroy(req.file.filename);
                    console.log('Imagen eliminada de Cloudinary tras error:', req.file.filename);
                } catch (destroyErr) {
                    console.error('Error al eliminar imagen:', destroyErr);
                }
            }
            
            // Responder con error al cliente
            return res.status(500).json({
                success: false,
                message: error.message || 'Error en la operación'
            });
        }
    };
};
