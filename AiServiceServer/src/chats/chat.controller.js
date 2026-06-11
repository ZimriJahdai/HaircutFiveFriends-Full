import { handleChatAI } from '../ai/chatbot.js';
import { Chat } from './chat.model.js';

const toModelMessage = (message) => ({
    role: message?.role,
    parts: Array.isArray(message?.parts) ? message.parts : [],
});

const toStoredMessage = (message, channel, fallbackTimestamp) => ({
    role: message?.role,
    parts: Array.isArray(message?.parts) ? message.parts : [],
    channel: message?.channel || channel,
    timestamp: message?.timestamp || fallbackTimestamp || new Date(),
});

export const handleChat = async (req, res) => {
    try {
        const { input } = req.body;
        const userId = req.userId || req.body?.userId;

        if (!userId || !input) {
            return res.status(400).json({ error: 'Falta userId o input.' });
        }

        // Recuperar o crear el chat en la base de datos
        let chatDoc = await Chat.findOne({ userId });
        if (!chatDoc) {
            chatDoc = new Chat({ userId, messages: [] });
        }

        const currentHistory = Array.isArray(chatDoc.messages) ? chatDoc.messages : [];
        const historyForAI = currentHistory.map(toModelMessage);

        // Llamar al servicio de IA con el historial actual
        const authToken = (req.header('authorization') || '').replace(/^Bearer\s+/i, '');
        const { response, updatedHistory } = await handleChatAI(historyForAI, input, authToken);

        // Actualizar y guardar en la base de datos
        if (Array.isArray(updatedHistory) && updatedHistory.length > 0) {
            const preservedCount = Math.min(currentHistory.length, updatedHistory.length);
            const preserved = currentHistory
                .slice(0, preservedCount)
                .map((msg) => toStoredMessage(msg, 'text'));

            const newItems = updatedHistory
                .slice(preservedCount)
                .map((msg) => toStoredMessage(msg, 'text'));

            chatDoc.messages = [...preserved, ...newItems];
        } else {
            const baseHistory = currentHistory.map((msg) => toStoredMessage(msg, 'text'));
            const newUserMessage = toStoredMessage({ role: 'user', parts: [{ text: input }] }, 'text');
            chatDoc.messages = [...baseHistory, newUserMessage];
            if (response) {
                chatDoc.messages.push(
                    toStoredMessage({ role: 'model', parts: [{ text: response }] }, 'text')
                );
            }
        }
        chatDoc.markModified('messages');
        await chatDoc.save();

        return res.json({
            response,
            updatedHistory: chatDoc.messages
        });

    } catch (error) {
        console.error('Error en el controlador de chat:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const userId = req.userId || req.params.userId;
        const chatDoc = await Chat.findOne({ userId });
        res.json({ messages: chatDoc ? chatDoc.messages : [] });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial.' });
    }
};

export const clearChatHistory = async (req, res) => {
    try {
        const userId = req.userId || req.params.userId;
        await Chat.findOneAndDelete({ userId });
        res.json({ message: 'Historial eliminado de la base de datos.' });
    } catch (error) {
        console.error('Error al limpiar historial:', error);
        res.status(500).json({ error: 'Error al limpiar historial.' });
    }
};
