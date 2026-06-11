import WebSocket from 'ws';
import { systemInstruction, barberTools } from './tools.js';
import { getVoiceMemory } from './voice-memory.js';
import { executeFunctionCall } from './barber-tools-executor.js';
import { Chat } from '../chats/chat.model.js';
import { getUserIdFromToken } from '../../middlewares/validate-JWT.js';

const buildGeminiWsUrl = (apiKey) => (
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`
);

const extractVoiceTranscripts = (payload) => {
    const entries = [];
    const inputText = payload?.serverContent?.inputTranscription?.text;
    if (inputText) {
        entries.push({ role: 'user', text: inputText });
    }

    const outputText = payload?.serverContent?.outputTranscription?.text;
    if (outputText) {
        entries.push({ role: 'model', text: outputText });
    } else {
        const modelParts = payload?.serverContent?.modelTurn?.parts || [];
        const modelText = modelParts
            .map((part) => part?.text)
            .filter(Boolean)
            .join(' ')
            .trim();
        if (modelText) {
            entries.push({ role: 'model', text: modelText });
        }
    }

    return entries;
};

const appendVoiceMessage = async (userId, role, text) => {
    if (!userId || !text) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
        await Chat.findOneAndUpdate(
            { userId },
            {
                $push: {
                    messages: {
                        role,
                        parts: [{ text: trimmed }],
                        channel: 'voice',
                        timestamp: new Date(),
                    },
                },
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('[LiveAPI] Error guardando mensaje de voz:', error);
    }
};

export const setupLiveApi = (wss) => {
    wss.on('connection', async (ws) => {
        console.log('Cliente WebSocket conectado para Live API');

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[LiveAPI] GEMINI_API_KEY no esta configurada');
            ws.send(JSON.stringify({
                event: 'gemini_error',
                message: 'GEMINI_API_KEY no esta configurada en el servidor.',
            }));
            ws.close();
            return;
        }

        const geminiSocket = new WebSocket(buildGeminiWsUrl(apiKey));
        let setupReady = false;
        const pendingMessages = [];
        const memoryText = await getVoiceMemory();
        const combinedInstruction = memoryText
            ? `${systemInstruction}\n\nMemoria persistente:\n${memoryText}`
            : systemInstruction;
        let authToken = '';
        let userId = '';
        let lastUserTranscript = '';
        let lastModelTranscript = '';

        const sendSetup = () => {
            const setupMessage = {
                setup: {
                    model: 'models/gemini-3.1-flash-live-preview',
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                    },
                    systemInstruction: {
                        parts: [{ text: combinedInstruction }],
                    },
                    tools: barberTools,
                },
            };

            console.log('[LiveAPI] Setup enviado a Gemini');
            geminiSocket.send(JSON.stringify(setupMessage));
        };

        geminiSocket.on('open', () => {
            console.log('[LiveAPI] Socket abierto con Gemini Live');
            sendSetup();
        });

        geminiSocket.on('message', async (data) => {
            const payload = data.toString();
            console.log('[LiveAPI -> Frontend] Mensaje:', payload);
            ws.send(payload);

            try {
                const parsed = JSON.parse(payload);
                if (parsed?.setupComplete) {
                    setupReady = true;
                    while (pendingMessages.length > 0) {
                        const next = pendingMessages.shift();
                        geminiSocket.send(JSON.stringify(next));
                    }
                }

                const transcripts = extractVoiceTranscripts(parsed);
                if (transcripts.length > 0 && userId) {
                    for (const entry of transcripts) {
                        if (entry.role === 'user') {
                            if (entry.text.trim() === lastUserTranscript) continue;
                            lastUserTranscript = entry.text.trim();
                        }
                        if (entry.role === 'model') {
                            if (entry.text.trim() === lastModelTranscript) continue;
                            lastModelTranscript = entry.text.trim();
                        }
                        await appendVoiceMessage(userId, entry.role, entry.text);
                    }
                }

                if (parsed?.toolCall?.functionCalls?.length) {
                    const responses = await Promise.all(
                        parsed.toolCall.functionCalls.map(async (call) => ({
                            name: call.name,
                            id: call.id,
                            response: await executeFunctionCall(call, authToken),
                        }))
                    );

                    const toolResponse = {
                        toolResponse: {
                            functionResponses: responses,
                        },
                    };

                    console.log('[LiveAPI] Enviando toolResponse');
                    if (!setupReady) {
                        pendingMessages.push(toolResponse);
                        return;
                    }
                    geminiSocket.send(JSON.stringify(toolResponse));
                }
            } catch (error) {
                console.error('[LiveAPI] Error parseando mensaje Gemini:', error);
            }
        });

        geminiSocket.on('error', (error) => {
            console.error('[LiveAPI] Error en socket Gemini Live:', error);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    event: 'gemini_error',
                    message: String(error?.message || error),
                }));
            }
        });

        geminiSocket.on('close', (code, reason) => {
            const reasonText = reason?.toString() || '';
            console.log('[LiveAPI] Socket cerrado con Gemini Live:', code, reasonText);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    event: 'gemini_close',
                    code,
                    reason: reasonText,
                }));
                ws.close();
            }
        });

        ws.on('message', (data) => {
            console.log('[Frontend -> LiveAPI] Raw:', String(data));

            let message;
            try {
                message = JSON.parse(data);
            } catch (parseError) {
                console.error('Mensaje Live API invalido:', parseError);
                return;
            }

            console.log('[Frontend -> LiveAPI] Parsed:', message);

            if (message?.auth?.token) {
                authToken = message.auth.token;
                userId = getUserIdFromToken(authToken);
                if (!userId) {
                    console.warn('[LiveAPI] Token invalido para persistir voz');
                }
                console.log('[LiveAPI] Token recibido para tools');
                return;
            }

            if (message?.audio) {
                const outbound = {
                    realtimeInput: {
                        audio: {
                            mimeType: message.audio.mimeType,
                            data: message.audio.data,
                        },
                    },
                };

                console.log('[LiveAPI] Enviando realtimeInput.audio');
                if (!setupReady) {
                    pendingMessages.push(outbound);
                    return;
                }
                geminiSocket.send(JSON.stringify(outbound));
                return;
            }

            if (message?.audioStreamEnd) {
                const outbound = { realtimeInput: { audioStreamEnd: true } };
                console.log('[LiveAPI] Enviando realtimeInput.audioStreamEnd');
                if (!setupReady) {
                    pendingMessages.push(outbound);
                    return;
                }
                geminiSocket.send(JSON.stringify(outbound));
                return;
            }

            if (message?.activityStart || message?.activityEnd) {
                const outbound = { realtimeInput: {} };
                if (message?.activityStart) outbound.realtimeInput.activityStart = {};
                if (message?.activityEnd) outbound.realtimeInput.activityEnd = {};

                console.log('[LiveAPI] Enviando realtimeInput.activity');
                if (!setupReady) {
                    pendingMessages.push(outbound);
                    return;
                }
                geminiSocket.send(JSON.stringify(outbound));
                return;
            }

            if (message?.clientContent) {
                console.log('[LiveAPI] Reenviando clientContent');
                if (!setupReady) {
                    pendingMessages.push(message);
                    return;
                }
                geminiSocket.send(JSON.stringify(message));
            }
        });

        ws.on('close', () => {
            console.log('Cliente WebSocket desconectado');
            if (geminiSocket.readyState === WebSocket.OPEN || geminiSocket.readyState === WebSocket.CONNECTING) {
                geminiSocket.close();
            }
        });
    });
};
