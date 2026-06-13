import { getGenAI, MODELS } from '../../configs/genai.js';

// Logica de negocio del analisis de reseñas con Gemini.
// El controller solo orquesta (valida, obtiene datos, responde); aqui vive la IA.

const buildReviewsPrompt = (reviewsText) => `
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

/**
 * Genera un reporte de insights a partir de las reseñas de un barbero.
 * @param {Array<{rating:number, comment:string}>} reviews
 * @returns {Promise<string>} texto del análisis
 */
export const analyzeReviewsWithAI = async (reviews) => {
    const reviewsText = reviews
        .map((r) => `- [${r.rating} estrellas]: ${r.comment}`)
        .join('\n');

    const ai = getGenAI();
    const response = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: buildReviewsPrompt(reviewsText),
    });

    return response.text;
};
