import axios from 'axios';
import { analyzeReviewsWithAI } from './reviews.service.js';

const BARBER_API_BASE = 'http://localhost:3006/HaircutFiveFriends/api/v1';
const REQUEST_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS) || 15000;

export const analyzeBarberReviews = async (req, res, next) => {
    const { barberId } = req.params;

    // Validacion: barberId presente y con formato razonable (Mongo ObjectId o numerico)
    if (!barberId || !/^[a-fA-F0-9]{24}$|^\d+$/.test(barberId)) {
        return res.status(400).json({ error: 'barberId invalido.' });
    }

    try {
        // 1. Obtener reseñas del barbero
        const reviewsRes = await axios.get(
            `${BARBER_API_BASE}/review/barbero/${barberId}`,
            { timeout: REQUEST_TIMEOUT_MS }
        );
        const reviews = reviewsRes.data;

        if (!reviews || reviews.length === 0) {
            return res.json({ message: 'No hay reseñas suficientes para analizar.' });
        }

        // 2. Analizar con Gemini (logica en reviews.service.js)
        const analysis = await analyzeReviewsWithAI(reviews);

        return res.json({
            barberId,
            reviewCount: reviews.length,
            analysis,
        });
    } catch (error) {
        // Delega al error-handler central (no filtra detalles internos)
        return next(error);
    }
};
