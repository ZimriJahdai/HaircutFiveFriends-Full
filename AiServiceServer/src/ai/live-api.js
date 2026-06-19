import WebSocket from 'ws';
import { GoogleAuth } from 'google-auth-library';
import { systemInstruction, barberTools } from './tools.js';
import { getVoiceMemory } from './voice-memory.js';
import { executeFunctionCall } from './barber-tools-executor.js';
import { Chat } from '../chats/chat.model.js';
import { getUserIdFromToken } from '../../middlewares/validate-JWT.js';
import { GCP_PROJECT, GCP_LOCATION, MODELS } from '../../configs/genai.js';
import { summarizeAssistantReply } from '../../services/genaiService.js';

// Cuantos mensajes recientes del historial inyectar en el systemInstruction
const HISTORY_LIMIT = 10;

// Construye un texto de historial reciente (usuario + asistente) para que el
// Live tenga contexto de lo ya hablado desde el primer mensaje.
const buildHistoryText = async (userId) => {
    if (!userId) return '';
    try {
        const doc = await Chat.findOne(
            { userId },
            { messages: 1, _id: 0 }
        ).lean();
        const msgs = Array.isArray(doc?.messages) ? doc.messages : [];
        if (!msgs.length) return '';

        const lines = msgs
            .slice(-HISTORY_LIMIT)
            .map((m) => {
                const text = (m.parts || [])
                    .map((p) => p?.text)
                    .filter(Boolean)
                    .join(' ')
                    .trim();
                if (!text) return null;
                const who = m.role === 'user' ? 'Usuario' : 'Asistente';
                return `- ${who}: ${text}`;
            })
            .filter(Boolean);

        if (!lines.length) return '';
        return `Historial reciente de la conversacion (para contexto):\n${lines.join('\n')}`;
    } catch (error) {
        console.error('[LiveAPI] Error cargando historial:', error);
        return '';
    }
};

// GCP Configs (centralizadas en configs/genai.js)
const location = GCP_LOCATION;
const projectId = GCP_PROJECT;

// Inicializador de Google Auth para ADC
const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

// URL WebSocket para Vertex AI
const buildVertexWsUrl = (loc) => (
    `wss://${loc}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`
);

// Formato de Modelo Completo para Vertex AI
const buildVertexModelPath = (proj, loc, modelId) => (
    `projects/${proj}/locations/${loc}/publishers/google/models/${modelId}`
);

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
        console.log('Cliente WebSocket conectado para Live API (Vertex ADC)');

        let accessToken = '';
        try {
            // Obtener el Token Bearer dinámicamente mediante ADC
            const authClient = await auth.getClient();
            const tokenResponse = await authClient.getAccessToken();
            accessToken = tokenResponse.token;
        } catch (authError) {
            console.error('[LiveAPI] Error obteniendo token de acceso ADC:', authError);
            ws.send(JSON.stringify({
                event: 'gemini_error',
                message: 'Error de autenticación ADC en el servidor.',
            }));
            ws.close();
            return;
        }

        if (!accessToken) {
            console.error('[LiveAPI] Token de acceso vacio');
            ws.close();
            return;
        }

        const wsUrl = buildVertexWsUrl(location);
        
        // Conectar a Vertex AI pasando las credenciales Bearer
        const geminiSocket = new WebSocket(wsUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        let setupReady = false;
        const pendingMessages = [];
        let authToken = '';
        let userId = '';

        // Estado para gatear el envio del setup: necesitamos el token (userId)
        // para inyectar el historial en el systemInstruction. Esperamos el auth
        // un breve momento; si no llega, enviamos setup sin historial.
        let geminiOpen = false;
        let authResolved = false;
        let setupSent = false;
        let setupTimer = null;

        // Acumuladores de la transcripcion del turno actual. El audio no trae
        // texto: con input/outputAudioTranscription Gemini envia fragmentos que
        // unimos y persistimos al cerrar el turno (turnComplete).
        let userTurnText = '';
        let modelTurnText = '';

        const finalizeTurn = async () => {
            const uText = userTurnText.trim();
            const mText = modelTurnText.trim();
            userTurnText = '';
            modelTurnText = '';
            if (!userId) return;

            // Usuario: se guarda verbatim (igual que el chatbot).
            if (uText) {
                await appendVoiceMessage(userId, 'user', uText);
            }

            // Asistente: se resume con un modelo ligero para no inflar tokens
            // del Live. Si el resumen falla, se guarda el texto completo.
            if (mText) {
                let summary = mText;
                try {
                    const s = await summarizeAssistantReply(mText);
                    if (s) summary = s;
                } catch (error) {
                    console.error('[LiveAPI] Error resumiendo respuesta:', error);
                }
                await appendVoiceMessage(userId, 'model', summary);
            }
        };

        const sendSetup = async () => {
            if (setupSent || !geminiOpen) return;
            setupSent = true;
            if (setupTimer) {
                clearTimeout(setupTimer);
                setupTimer = null;
            }

            const memoryText = await getVoiceMemory();
            const historyText = await buildHistoryText(userId);

            const parts = [systemInstruction];
            if (memoryText) parts.push(`Memoria persistente:\n${memoryText}`);
            if (historyText) parts.push(historyText);
            const combinedInstruction = parts.join('\n\n');

            const setupMessage = {
                setup: {
                    // Nota: Vertex requiere la ruta completa del recurso para el modelo
                    model: buildVertexModelPath(projectId, location, MODELS.LIVE),
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                    },
                    systemInstruction: {
                        parts: [{ text: combinedInstruction }],
                    },
                    tools: barberTools,
                    // Habilitar transcripcion para poder persistir el chat de voz.
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            };

            console.log('[LiveAPI] Setup enviado a Vertex AI');
            geminiSocket.send(JSON.stringify(setupMessage));
        };

        geminiSocket.on('open', () => {
            console.log('[LiveAPI] Socket abierto con Gemini Live (Vertex)');
            geminiOpen = true;
            if (authResolved) {
                sendSetup();
            } else {
                // Margen para que llegue el token del cliente; si no, setup sin historial.
                setupTimer = setTimeout(() => sendSetup(), 600);
            }
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

                // Acumular transcripcion del turno (fragmentos incrementales).
                const inputText = parsed?.serverContent?.inputTranscription?.text;
                if (inputText) userTurnText += inputText;

                const outputText = parsed?.serverContent?.outputTranscription?.text;
                if (outputText) modelTurnText += outputText;

                // Al cerrar el turno, persistir usuario (verbatim) y modelo (resumido).
                if (parsed?.serverContent?.turnComplete) {
                    finalizeTurn();
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
            geminiOpen = false;
            if (setupTimer) {
                clearTimeout(setupTimer);
                setupTimer = null;
            }
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
                // Ya tenemos userId: si el socket de Gemini esta abierto y el
                // setup aun no salio, enviarlo ahora con el historial inyectado.
                authResolved = true;
                if (geminiOpen && !setupSent) {
                    sendSetup();
                }
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
