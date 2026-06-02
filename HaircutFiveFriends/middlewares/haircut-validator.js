'use strict';

import { body, validationResult } from 'express-validator';

const validFaceTypes = ['OVALADO', 'CUADRADO', 'REDONDO', 'CORAZÓN', 'CUALQUIERA', 'TRIANGULAR'];

// Validaciones para crear haircut
export const validateCreateHaircut = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

    body('description')
        .trim()
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

    body('faceTypeRecommended')
        .trim()
        .notEmpty().withMessage('El tipo de rostro recomendado es requerido')
        .toUpperCase()
        .isIn(validFaceTypes).withMessage(`El tipo de rostro debe ser uno de: ${validFaceTypes.join(', ')}`),

    // Middleware para manejar errores de validación
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }
        
        // Validar que la imagen fue cargada
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'La imagen es requerida'
            });
        }
        
        next();
    }
];

// Validaciones para actualizar haircut
export const validateUpdateHaircut = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

    body('faceTypeRecommended')
        .optional()
        .trim()
        .toUpperCase()
        .isIn(validFaceTypes).withMessage(`El tipo de rostro debe ser uno de: ${validFaceTypes.join(', ')}`),

    body('imageRef')
        .optional()
        .trim(),

    // Middleware para manejar errores de validación
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
