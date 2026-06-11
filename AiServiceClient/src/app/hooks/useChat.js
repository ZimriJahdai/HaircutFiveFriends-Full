import { useCallback, useEffect, useState } from 'react';
import { clearChatHistory, fetchHistory, sendChatMessage } from '../services/chatApi.js';
import { getAuth } from '../utils/authStorage.js';
import { createUserMessage } from '../utils/messageUtils.js';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const userId = auth?.userId || auth?.userDetails?.id || '';
  const token = auth?.token || '';

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        if (!userId || !token) return;
        const data = await fetchHistory({ userId, token });
        if (isMounted && data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error al cargar historial de la DB:', error);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [userId, token]);

  const sendMessage = useCallback(async (event) => {
    event?.preventDefault?.();
    if (!input.trim() || loading) return;

    const userMessage = createUserMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      if (!userId || !token) {
        throw new Error('Debes iniciar sesion para usar el chat.');
      }
      const data = await sendChatMessage({ userId, input: currentInput, token });
      if (data.updatedHistory) {
        setMessages(data.updatedHistory);
      } else if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'model', parts: [{ text: data.response }] },
        ]);
      }
    } catch (error) {
      console.error('Error en chat:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: 'Error al conectar con el servidor.' }] },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, userId, token]);

  const clearChat = useCallback(async () => {
    if (!window.confirm('Estas seguro de que quieres limpiar el historial de la base de datos?')) {
      return;
    }

    try {
      if (!userId || !token) return;
      await clearChatHistory({ userId, token });
      setMessages([]);
    } catch (error) {
      console.error('Error al limpiar chat:', error);
    }
  }, [userId, token]);

  return {
    userId,
    messages,
    input,
    loading,
    setInput,
    sendMessage,
    clearChat,
  };
};
