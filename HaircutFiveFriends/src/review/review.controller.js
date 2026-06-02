'use strict';

import mongoose from 'mongoose';
import Review from './review.model.js';
import Client from '../client/client.model.js';
import Barber from '../barber/barber.model.js';
import Service from '../service/service.model.js';

// Crear una nueva reseña
export const createReview = async (req, res)=>{
    try {
        let { clienteName, barberoId, servicioName, score, comment } = req.body;

        const clientFromToken = req.clientFromToken;
        let client = clientFromToken;

        if (!client) {
            if (!clienteName) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del cliente es requerido'
                });
            }
            client = await Client.findOne({ name: clienteName });
        }

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado para crear la reseña'
            });
        }
        const clienteId = client._id;

        // Obtener el ID del servicio si se proporcionó nombre
        let servicioId = null;
        if (servicioName) {
            const service = await Service.findOne({ name: servicioName });
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: `Servicio con nombre "${servicioName}" no encontrado`
                });
            }
            servicioId = service._id;
        }

        // Crear la reseña con los datos obtenidos
        const reviewData = {
            clienteId,
            score,
            comment
        };

        if (barberoId) {
            reviewData.barberoId = barberoId;
        }

        if (servicioId) {
            reviewData.servicioId = servicioId;
        }

        const review = new Review(reviewData);
        await review.save();
        
        res.status(201).json({
            success: true,
            message: 'Reseña creada exitosamente',
            data: review
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// obtener todas las reseñas
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('clienteId', 'name email')
            .populate('barberoId', 'name')
            .populate('servicioId', 'name category price');
        
        res.status(200).json({
            success: true,
            message: 'Reseñas obtenidas exitosamente',
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener una reseña por ID
export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id)
            .populate('clienteId', 'name email')
            .populate('barberoId', 'name')
            .populate('servicioId', 'name category price');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reseña obtenida exitosamente',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Actualizar una reseña
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, comment } = req.body;

        let review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        if (req.userRole === 'USER_ROLE') {
            if (!req.clientFromToken) {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado para el usuario autenticado' });
            }
            if (String(review.clienteId) !== String(req.clientFromToken._id)) {
                return res.status(403).json({ success: false, message: 'Solo puedes editar tu propia reseña' });
            }
        }

        if (score !== undefined) review.score = score;
        if (comment) review.comment = comment;

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Reseña actualizada exitosamente',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Eliminar una reseña
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        if (req.userRole === 'USER_ROLE') {
            if (!req.clientFromToken) {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado para el usuario autenticado' });
            }
            if (String(review.clienteId) !== String(req.clientFromToken._id)) {
                return res.status(403).json({ success: false, message: 'Solo puedes eliminar tu propia reseña' });
            }
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Reseña eliminada exitosamente',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener reseñas por barbero
export const getReviewsByBarbero = async (req, res) => {
    try {
        const { barberoId } = req.params;
        
        // Validar que sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(barberoId)) {
            return res.status(400).json({
                success: false,
                message: 'El ID del barbero no es válido'
            });
        }

        const reviews = await Review.find({ barberoId: barberoId })
            .populate('clienteId', 'name email')
            .populate('servicioId', 'name price');

        res.status(200).json({
            success: true,
            message: `Reseñas del barbero obtenidas exitosamente`,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener reseñas por cliente
export const getReviewsByCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        
        // Validar que sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(clienteId)) {
            return res.status(400).json({
                success: false,
                message: 'El ID del cliente no es válido'
            });
        }

        const reviews = await Review.find({ clienteId: clienteId })
            .populate('barberoId', 'name')
            .populate('servicioId', 'name price');

        res.status(200).json({
            success: true,
            message: `Reseñas del cliente obtenidas exitosamente`,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener reseñas por servicio
export const getReviewsByServicio = async (req, res) => {
    try {
        const { servicioId } = req.params;
        
        // Validar que sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(servicioId)) {
            return res.status(400).json({
                success: false,
                message: 'El ID del servicio no es válido'
            });
        }

        const reviews = await Review.find({ servicioId: servicioId })
            .populate('clienteId', 'name email')
            .populate('barberoId', 'name');

        res.status(200).json({
            success: true,
            message: `Reseñas del servicio obtenidas exitosamente`,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener promedio de calificaciones por barbero
export const getAverageScoreByBarbero = async (req, res) => {
    try {
        const { barberoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(barberoId)) {
            return res.status(400).json({
                success: false,
                message: 'El ID del barbero no es válido'
            });
        }

        const result = await Review.aggregate([
            { $match: { barberoId: new mongoose.Types.ObjectId(barberoId) } },
            {
                $group: {
                    _id: '$barberoId',
                    averageScore: { $avg: '$score' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron reseñas para este barbero'
            });
        }

        // Obtener el nombre del barbero
        const barber = await Barber.findById(result[0]._id).select('name');
        const barberName = barber ? barber.name : 'Desconocido';

        res.status(200).json({
            success: true,
            message: 'Promedio calculado exitosamente',
            data: {
                barberoId: result[0]._id,
                barberName: barberName,
                averageScore: result[0].averageScore.toFixed(2),
                totalReviews: result[0].totalReviews
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};