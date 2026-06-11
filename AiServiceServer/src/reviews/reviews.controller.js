import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

const BARBER_API_BASE = 'http://localhost:3006/HaircutFiveFriends/api/v1';

export const analyzeBarberReviews = async (req, res) => {
    try {
        const { barberId } = req.params;

        // 1. Obtener reseñas del barbero
        const reviewsRes = await axios.get(`${BARBER_API_BASE}/review/barbero/${barberId}`);
        const reviews = reviewsRes.data;

        if (!reviews || reviews.length === 0) {
            return res.json({ message: 'No hay reseñas suficientes para analizar.' });
        }

        // 2. Preparar el prompt para Gemini
        const reviewsText = reviews.map(r => `- [${r.rating} estrellas]: ${r.comment}`).join('\n');
        
        // Inicializar con ADC y Vertex AI
        const ai = new GoogleGenAI({
            vertexai: true,
            project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID,
            location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
        });

        const prompt = `
            Analiza las siguientes reseñas de un barbero y genera un reporte de insights en español.
            Incluye:
            1. Sentimiento general.
            2. Temas recurrentes (lo que más gusta y lo que menos).
            3. Puntos fuertes.
            4. Áreas de mejora.
            5. Tendencias observadas.

            Reseñas:
            ${reviewsText}
        `;

        // Corrección de sintaxis del SDK: usar ai.models.generateContent directamente
        const response = await ai.models.generateContent({
            model: process.env.VERTEX_TEXT_MODEL || 'gemini-2.5-flash',
            contents: prompt
        });

        // Corrección de acceso al texto de respuesta (propiedad .text, no método .text())
        const report = response.text;

        return res.json({
            barberId,
            reviewCount: reviews.length,
            analysis: report
        });

    } catch (error) {
        console.error('Error al analizar reseñas:', error.message);
        res.status(500).json({ error: 'Error al analizar las reseñas del barbero.' });
    }
};
