'use strict';

import { body, validationResult } from 'express-validator';
import Barber from '../src/barber/barber.model.js';

// Validaciones para crear barbero
export const validateCreateBarber = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

    body('phone')
        .trim()
        .notEmpty().withMessage('El teléfono es requerido')
        .isLength({ min: 8, max: 8 }).withMessage('El teléfono debe tener exactamente 8 caracteres')
        .matches(/^[0-9]+$/).withMessage('El teléfono debe contener solo números'),

    body('email')
        .trim()
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('El correo no es válido')
        .toLowerCase()
        .custom(async (value) => {
            // Verificar que el correo esté en minúsculas
            if (value !== value.toLowerCase()) {
                throw new Error('El correo debe estar en minúsculas');
            }
            // Verificar que el correo sea único
            const existingBarber = await Barber.findOne({ email: value });
            if (existingBarber) {
                throw new Error('El correo ya está registrado');
            }
            return true;
        }),

    body('password')
        .trim()
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

    body('schedule')
        .optional()
        .trim(),

    body('userId')
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

// Validaciones para actualizar barbero
export const validateUpdateBarber = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

    body('phone')
        .optional()
        .trim()
        .isLength({ min: 8, max: 8 }).withMessage('El teléfono debe tener exactamente 8 caracteres')
        .matches(/^[0-9]+$/).withMessage('El teléfono debe contener solo números'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('El correo no es válido')
        .toLowerCase()
        .custom(async (value, { req }) => {
            if (!value) return true;
            // Verificar que el correo esté en minúsculas
            if (value !== value.toLowerCase()) {
                throw new Error('El correo debe estar en minúsculas');
            }
            // Verificar que el correo sea único (pero permitir el mismo correo para el barbero actual)
            const barberId = req.params.id;
            const existingBarber = await Barber.findOne({ email: value, _id: { $ne: barberId } });
            if (existingBarber) {
                throw new Error('El correo ya está registrado');
            }
            return true;
        }),

    body('password')
        .optional()
        .trim()
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

    body('schedule')
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
