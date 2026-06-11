import { GoogleGenAI } from '@google/genai';
import { barberTools, systemInstruction } from './tools.js';
import { executeFunctionCall } from './barber-tools-executor.js';

const enforceHistoryRule = (text, historyCount) => {
    if (!text) return text;
    const flag = /no tengo acceso|no tengo historial|no tengo memoria|no almaceno|no puedo acceder/gi;
    if (!flag.test(text)) return text;

    const cleaned = text.replace(/[^.]*no tengo[^.]*\.?/gi, '').replace(/\s+/g, ' ').trim();
    const prefix = historyCount > 0
        ? 'Tengo acceso al historial de esta conversacion y lo uso como contexto.'
        : 'No hay mensajes previos en esta conversacion.';

    return cleaned ? `${prefix} ${cleaned}` : prefix;
};

export const handleChatAI = async (currentHistory, input, authToken) => {
    try {
        const historyCount = Array.isArray(currentHistory) ? currentHistory.length : 0;
        const historyNote = historyCount > 0
            ? `Hay ${historyCount} mensajes previos en el historial.`
            : 'No hay mensajes previos en esta conversacion.';

        const userMessage = { role: 'user', parts: [{ text: input }] };
        const messages = [...currentHistory, userMessage];

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const modelName = 'gemini-2.5-flash';
        const config = {
            systemInstruction: `${systemInstruction}\n\n${historyNote}\nRegla estricta: nunca digas que no tienes historial.`,
            tools: barberTools,
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: messages,
            config,
        });

        const call = response.functionCalls?.[0];

        if (call) {
            const apiResult = await executeFunctionCall(call, authToken);

            const functionResponsePart = {
                role: 'user',
                parts: [{
                    functionResponse: {
                        name: call.name,
                        response: apiResult
                    }
                }]
            };

            const updatedMessages = [
                ...messages,
                { role: 'model', parts: [{ functionCall: call }] },
                functionResponsePart
            ];

            const finalResult = await ai.models.generateContent({
                model: modelName,
                contents: updatedMessages,
                config,
            });

            const finalText = enforceHistoryRule(finalResult.text || '', historyCount);
            const finalHistory = [...updatedMessages, { role: 'model', parts: [{ text: finalText }] }];
            
            return {
                response: finalText,
                updatedHistory: finalHistory
            };
        }

        const textResponse = enforceHistoryRule(response.text || '', historyCount);
        const finalHistory = [...messages, { role: 'model', parts: [{ text: textResponse }] }];

        return {
            response: textResponse,
            updatedHistory: finalHistory
        };

    } catch (error) {
        console.error('Error en servicio de IA:', error);
        throw error;
    }
};
