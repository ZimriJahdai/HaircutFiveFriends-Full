export const createUserMessage = (text) => ({
  role: 'user',
  parts: [{ text }],
  timestamp: new Date().toISOString(),
});

export const getMessageText = (msg) => {
  if (msg?.parts?.[0]) {
    if (msg.parts[0].text) return msg.parts[0].text;
    if (msg.parts[0].functionCall) {
      return `[Llamada a funcion: ${msg.parts[0].functionCall.name}]`;
    }
    if (msg.parts[0].functionResponse) {
      return `[Respuesta de API: ${msg.parts[0].functionResponse.name}]`;
    }
  }
  return '';
};

export const isTextMessage = (msg) => Boolean(msg?.parts?.[0]?.text);
