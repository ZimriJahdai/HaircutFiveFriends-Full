'use strict';

import { body, validationResult } from 'express-validator';
import Service from '../src/service/service.model.js';

// Validaciones para crear servicio
export const validateCreateService = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del servicio es requerido')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
        .custom(async (value) => {
            // Verificar que el nombre sea único
            const existingService = await Service.findOne({ name: value });
            if (existingService) {
                throw new Error('Ya existe un servicio con ese nombre');
            }
            return true;
        }),

    body('description')
        .trim()
        .notEmpty().withMessage('La descripción del servicio es requerida')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

    body('price')
        .notEmpty().withMessage('El precio del servicio es requerido')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),

    body('duration')
        .trim()
        .notEmpty().withMessage('La duración del servicio es requerida')
        .matches(/^\d+\s?min$/i).withMessage('La duración debe tener formato como "30min" o "30 min"'),

    body('category')
        .trim()
        .notEmpty().withMessage('La categoría del servicio es requerida')
        .isIn([
            'CORTE_DE_CABELLO',
            'AFEITADO',
            'RECORTES_DE_BARBA',
            'ARREGLO_DE_CABELLO',
            'TRATAMIENTOS_CAPILARES',
            'TRATAMIENTOS_FACIALES'
        ]).withMessage('La categoría no es válida'),

    body('status')
        .optional()
        .trim()
        .isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"'),

    body('points')
        .optional()
        .isInt({ min: 0 }).withMessage('Los puntos deben ser un número entero positivo'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }
        next();
    }
];

// Validaciones para actualizar servicio
export const validateUpdateService = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre del servicio no puede estar vacío')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
        .custom(async (value, { req }) => {
            // Verificar que el nombre sea único (excluyendo el servicio actual)
            const existingService = await Service.findOne({ 
                name: value,
                _id: { $ne: req.params.id }
            });
            if (existingService) {
                throw new Error('Ya existe un servicio con ese nombre');
            }
            return true;
        }),

    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('La descripción del servicio no puede estar vacía')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),

    body('duration')
        .optional()
        .trim()
        .matches(/^\d+\s?min$/i).withMessage('La duración debe tener formato como "30min" o "30 min"'),

    body('category')
        .optional()
        .trim()
        .isIn([
            'CORTE_DE_CABELLO',
            'AFEITADO',
            'RECORTES_DE_BARBA',
            'ARREGLO_DE_CABELLO',
            'TRATAMIENTOS_CAPILARES',
            'TRATAMIENTOS_FACIALES'
        ]).withMessage('La categoría no es válida'),

    body('status')
        .optional()
        .trim()
        .isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"'),

    body('points')
        .optional()
        .isInt({ min: 0 }).withMessage('Los puntos deben ser un número entero positivo'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }
        next();
    }
];
