import { axiosAI } from './aiHaircut';

export const fetchChatHistory = (userId) => axiosAI.get(`/api/chats/${userId}`);

export const sendChatMessage = (payload) => axiosAI.post('/api/chats', payload);

export const clearChatHistory = (userId) => axiosAI.delete(`/api/chats/${userId}`);
