'use strict';

import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Client from '../src/client/client.model.js';
import Barber from '../src/barber/barber.model.js';
import Service from '../src/service/service.model.js';
import Appointment from '../src/appointment/appointment.model.js';

const validStatuses = ['PENDIENTE', 'CANCELADA', 'COMPLETADA'];

// Validaciones para crear cita
export const validateCreateAppointment = [
    body('clienteId')
        .custom(async (value, { req }) => {
            if (req.userRole === 'USER_ROLE' && req.clientFromToken) {
                req.body.clienteId = req.clientFromToken._id.toString();
                return true;
            }
            if (!value) {
                throw new Error('El ID del cliente es requerido');
            }
            if (!mongoose.isValidObjectId(value)) {
                throw new Error('El ID del cliente no es válido');
            }
            const client = await Client.findById(value);
            if (!client) {
                throw new Error('El cliente no existe');
            }
            return true;
        }),

    body('barberId')
        .custom(async (value, { req }) => {
            if (req.userRole === 'USER_ROLE' && !value) {
                return true;
            }
            if (!value) {
                throw new Error('El ID del barbero es requerido');
            }
            if (!mongoose.isValidObjectId(value)) {
                throw new Error('El ID del barbero no es válido');
            }
            const barber = await Barber.findById(value);
            if (!barber) {
                throw new Error('El barbero no existe');
            }
            return true;
        }),

    body('serviceId')
        .trim()
        .notEmpty().withMessage('El ID del servicio es requerido')
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error('El ID del servicio no es válido');
            }
            return true;
        })
        .custom(async (value) => {
            const service = await Service.findById(value);
            if (!service) {
                throw new Error('El servicio no existe');
            }
            return true;
        }),

    body('appointmentDate')
        .notEmpty().withMessage('La fecha de la cita es requerida')
        .custom((value) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('El formato de fecha no es válido');
            }
            return true;
        })
        .custom((value) => {
            const appointmentDate = new Date(value);
            const now = new Date();
            if (appointmentDate < now) {
                throw new Error('La fecha de la cita no puede ser en el pasado');
            }
            return true;
        }),

    body('status')
        .optional()
        .trim()
        .toUpperCase()
        .isIn(validStatuses).withMessage(`El estado debe ser uno de: ${validStatuses.join(', ')}`),

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

// Validaciones para actualizar cita
export const validateUpdateAppointment = [
    body('clienteId')
        .optional()
        .trim()
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error('El ID del cliente no es válido');
            }
            return true;
        })
        .custom(async (value) => {
            const client = await Client.findById(value);
            if (!client) {
                throw new Error('El cliente no existe');
            }
            return true;
        }),

    body('barberId')
        .optional()
        .trim()
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error('El ID del barbero no es válido');
            }
            return true;
        })
        .custom(async (value) => {
            const barber = await Barber.findById(value);
            if (!barber) {
                throw new Error('El barbero no existe');
            }
            return true;
        }),

    body('serviceId')
        .optional()
        .trim()
        .custom((value) => {
            if (!mongoose.isValidObjectId(value)) {
                throw new Error('El ID del servicio no es válido');
            }
            return true;
        })
        .custom(async (value) => {
            const service = await Service.findById(value);
            if (!service) {
                throw new Error('El servicio no existe');
            }
            return true;
        }),

    body('appointmentDate')
        .optional()
        .custom((value) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('El formato de fecha no es válido');
            }
            return true;
        }),

    body('status')
        .optional()
        .trim()
        .toUpperCase()
        .isIn(validStatuses).withMessage(`El estado debe ser uno de: ${validStatuses.join(', ')}`),

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

// Middleware para validar disponibilidad del barbero (para CREATE)
export const validateBarberAvailability = async (req, res, next) => {
    try {
        const { barberId, appointmentDate, serviceId } = req.body;

        if (!barberId || !appointmentDate || !serviceId) {
            return next();
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return next();
        }

        // Convertir duración del servicio a minutos
        const durationMatch = service.duration?.match(/(\d+)\s*(minutos?|mins?|horas?|hrs?)/i);
        let durationInMinutes = 30; // Duración por defecto
        
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            durationInMinutes = unit.startsWith('h') ? value * 60 : value;
        }

        const requestedDate = new Date(appointmentDate);
        const requestedEndTime = new Date(requestedDate.getTime() + durationInMinutes * 60000);

        // Buscar citas del barbero que NO estén canceladas
        const existingAppointments = await Appointment.find({
            barberId: barberId,
            status: { $ne: 'CANCELADA' },
            appointmentDate: {
                $gte: new Date(requestedDate.getTime() - 24 * 60 * 60 * 1000), // 24 horas antes
                $lte: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000)  // 24 horas después
            }
        }).populate('serviceId');

        // Verificar solapamientos
        for (const appointment of existingAppointments) {
            const existingStart = new Date(appointment.appointmentDate);
            
            const existingDurationMatch = appointment.serviceId?.duration?.match(/(\d+)\s*(minutos?|mins?|horas?|hrs?)/i);
            let existingDurationInMinutes = 30;
            
            if (existingDurationMatch) {
                const value = parseInt(existingDurationMatch[1]);
                const unit = existingDurationMatch[2].toLowerCase();
                existingDurationInMinutes = unit.startsWith('h') ? value * 60 : value;
            }

            const existingEnd = new Date(existingStart.getTime() + existingDurationInMinutes * 60000);

            // Verificar si hay solapamiento
            if (
                (requestedDate >= existingStart && requestedDate < existingEnd) ||
                (requestedEndTime > existingStart && requestedEndTime <= existingEnd) ||
                (requestedDate <= existingStart && requestedEndTime >= existingEnd)
            ) {
                return res.status(409).json({
                    success: false,
                    message: 'El barbero no está disponible en este horario',
                    conflict: {
                        existingAppointment: existingStart,
                        suggestedTime: new Date(existingEnd.getTime() + 5 * 60000) // 5 min después
                    }
                });
            }
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al validar disponibilidad',
            error: error.message
        });
    }
};

// Middleware para validar disponibilidad del barbero (para UPDATE)
export const validateBarberAvailabilityUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { barberId, appointmentDate, serviceId } = req.body;

        // Si no se actualiza barbero ni fecha, continuar
        if (!barberId && !appointmentDate && !serviceId) {
            return next();
        }

        // Obtener la cita actual
        const currentAppointment = await Appointment.findById(id);
        if (!currentAppointment) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }

        const finalBarberId = barberId || currentAppointment.barberId;
        const finalDate = appointmentDate || currentAppointment.appointmentDate;
        const finalServiceId = serviceId || currentAppointment.serviceId;

        const service = await Service.findById(finalServiceId);
        if (!service) {
            return next();
        }

        // Convertir duración del servicio a minutos
        const durationMatch = service.duration?.match(/(\d+)\s*(minutos?|mins?|horas?|hrs?)/i);
        let durationInMinutes = 30;
        
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            durationInMinutes = unit.startsWith('h') ? value * 60 : value;
        }

        const requestedDate = new Date(finalDate);
        const requestedEndTime = new Date(requestedDate.getTime() + durationInMinutes * 60000);

        // Buscar citas del barbero excluyendo la cita actual y las canceladas
        const existingAppointments = await Appointment.find({
            _id: { $ne: id },
            barberId: finalBarberId,
            status: { $ne: 'CANCELADA' },
            appointmentDate: {
                $gte: new Date(requestedDate.getTime() - 24 * 60 * 60 * 1000),
                $lte: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000)
            }
        }).populate('serviceId');

        // Verificar solapamientos
        for (const appointment of existingAppointments) {
            const existingStart = new Date(appointment.appointmentDate);
            
            const existingDurationMatch = appointment.serviceId?.duration?.match(/(\d+)\s*(minutos?|mins?|horas?|hrs?)/i);
            let existingDurationInMinutes = 30;
            
            if (existingDurationMatch) {
                const value = parseInt(existingDurationMatch[1]);
                const unit = existingDurationMatch[2].toLowerCase();
                existingDurationInMinutes = unit.startsWith('h') ? value * 60 : value;
            }

            const existingEnd = new Date(existingStart.getTime() + existingDurationInMinutes * 60000);

            // Verificar si hay solapamiento
            if (
                (requestedDate >= existingStart && requestedDate < existingEnd) ||
                (requestedEndTime > existingStart && requestedEndTime <= existingEnd) ||
                (requestedDate <= existingStart && requestedEndTime >= existingEnd)
            ) {
                return res.status(409).json({
                    success: false,
                    message: 'El barbero no está disponible en este horario',
                    conflict: {
                        existingAppointment: existingStart,
                        suggestedTime: new Date(existingEnd.getTime() + 5 * 60000)
                    }
                });
            }
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al validar disponibilidad',
            error: error.message
        });
    }
};
