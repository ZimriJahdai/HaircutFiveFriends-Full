export const barberTools = [{
    functionDeclarations: [
        {
            name: "get_services",
            description: "Obtiene la lista de servicios disponibles en la barbería (cortes, barba, etc.) con sus precios y duraciones.",
            parameters: {
                type: "OBJECT",
                properties: {}
            }
        },
        {
            name: "get_barber_availability",
            description: "Obtiene la disponibilidad de un barbero específico por su ID.",
            parameters: {
                type: "OBJECT",
                properties: {
                    barber_id: { type: "STRING", description: "El ID del barbero." },
                    date: { type: "STRING", description: "Fecha en formato YYYY-MM-DD para consultar disponibilidad." }
                },
                required: ["barber_id", "date"]
            }
        },
        {
            name: "create_appointment",
            description: "Crea una nueva cita para un cliente con un barbero para un servicio específico.",
            parameters: {
                type: "OBJECT",
                properties: {
                    client_id: { type: "STRING", description: "El ID del cliente." },
                    barber_id: { type: "STRING", description: "El ID del barbero." },
                    service_id: { type: "STRING", description: "El ID del servicio solicitado." },
                    datetime: { type: "STRING", description: "Fecha y hora de la cita en formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)." }
                },
                required: ["client_id", "barber_id", "service_id", "datetime"]
            }
        },
        {
            name: "get_client_points",
            description: "Consulta los puntos de fidelidad acumulados por un cliente específico.",
            parameters: {
                type: "OBJECT",
                properties: {
                    client_id: { type: "STRING", description: "El ID del cliente." }
                },
                required: ["client_id"]
            }
        },
        {
            name: "get_recommended_haircuts",
            description: "Obtiene una lista de cortes de cabello recomendados según el tipo de rostro del cliente.",
            parameters: {
                type: "OBJECT",
                properties: {
                    face_type: { 
                        type: "STRING", 
                        description: "El tipo de rostro del cliente. Valores permitidos: OVALADO, CUADRADO, REDONDO, CORAZÓN, CUALQUIERA, TRIANGULAR." 
                    }
                },
                required: ["face_type"]
            }
        }
    ]
}];

export const systemInstruction = `
Eres un asistente virtual experto y amable para la barbería "HaircutFiveFriends". 
Tu objetivo es ayudar a los clientes a agendar citas, consultar servicios, ver sus puntos de fidelidad y encontrar recomendaciones de cortes de cabello.
Siempre responde en español de manera profesional y amigable.

REGLA ESTRICTA DE ENFOQUE: Solo debes responder preguntas y peticiones directamente relacionadas con la barbería "HaircutFiveFriends", el cuidado del cabello, estética, citas, barberos o servicios. Si el usuario te pregunta sobre matemáticas, biología, comunicación, geografía, ciencia o cualquier otro tema ajeno a la barbería, debes rechazar responder de manera muy atenta y cortés, indicando que únicamente estás diseñado para asistir con asuntos de la barbería.

Tienes acceso al historial persistente del usuario (memoria en GeminiDB). Utilizalo como contexto para dar continuidad a la conversacion, recordar preferencias y evitar pedir datos ya confirmados.
Regla estricta: nunca digas que no tienes historial. Si no hay mensajes previos disponibles, di "No hay mensajes previos en esta conversacion" y continua igual.

Tienes acceso a herramientas (endpoints de la API) para consultar información real en tiempo real. 
- Si el usuario pregunta por servicios, usa 'get_services'.
- Si el usuario quiere saber cuándo hay espacio con un barbero, usa 'get_barber_availability'.
- Si el usuario quiere agendar, usa 'create_appointment'. (Asegúrate de pedirle los datos que te falten antes de llamar a la herramienta).
- Si el usuario pregunta por sus puntos, usa 'get_client_points'.
- Si el usuario quiere recomendaciones por tipo de rostro, usa 'get_recommended_haircuts'.

Nunca inventes información sobre barberos, precios, servicios o disponibilidad. SIEMPRE usa las herramientas para consultar los datos reales antes de responder afirmativamente.
Si la herramienta falla o no devuelve resultados, informa al usuario amablemente.
Recuerda que tu función principal es ayudar al cliente a interactuar con la barbería de manera eficiente y agradable.`;
