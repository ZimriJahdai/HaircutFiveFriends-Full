'use strict';

import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// ============ VALIDADORES SIMPLIFICADOS ============
// Cliente: solo NOMBRE
// Barbero: solo ID  
// Servicio: solo NOMBRE

// Middleware para validar CREATE REVIEW
export const validateCreateReview = async (req, res, next) => {
    try {
        // Validar campos requeridos
        const { clienteName, barberoId, servicioName, score, comment } = req.body || {};

        // Validar cliente nombre
        if ((!clienteName || !clienteName.trim()) && !req.clientFromToken) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del cliente es requerido'
            });
        }

        // Validar barbero XOR servicio
        if (!barberoId && !servicioName) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar barberoId O servicioName (uno de los dos)'
            });
        }

        if (barberoId && servicioName) {
            return res.status(400).json({
                success: false,
                message: 'Solo puede calificar un barbero O un servicio, no ambos'
            });
        }

        // Validar score
        if (!score) {
            return res.status(400).json({
                success: false,
                message: 'La puntuación es requerida'
            });
        }

        const scoreNum = parseInt(score, 10);
        if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5) {
            return res.status(400).json({
                success: false,
                message: 'La puntuación debe estar entre 1 y 5'
            });
        }

        // Validar comentario
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'El comentario es requerido'
            });
        }

        const commentTrimmed = comment.trim();
        if (commentTrimmed.length < 10 || commentTrimmed.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'El comentario debe tener entre 10 y 500 caracteres'
            });
        }

        // Validar barberoId si se proporciona
        if (barberoId && !mongoose.Types.ObjectId.isValid(barberoId)) {
            return res.status(400).json({
                success: false,
                message: 'El ID del barbero no es válido'
            });
        }

        // Si todas las validaciones pasaron
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en validación: ' + error.message
        });
    }
};

// Middleware para validar UPDATE REVIEW
export const validateUpdateReview = async (req, res, next) => {
    try {
        const { score, comment } = req.body || {};

        // Validar score si se proporciona
        if (score) {
            const scoreNum = parseInt(score, 10);
            if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'La puntuación debe estar entre 1 y 5'
                });
            }
        }

        // Validar comentario si se proporciona
        if (comment) {
            const commentTrimmed = comment.trim();
            if (commentTrimmed.length < 10 || commentTrimmed.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: 'El comentario debe tener entre 10 y 500 caracteres'
                });
            }
        }

        // Si todas las validaciones pasaron
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en validación: ' + error.message
        });
    }
};
