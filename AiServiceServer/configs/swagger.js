import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3007;
const BASE_PATH = '/api';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'TodoGemini AI Platform',
      version: '1.0.0',
      description: 'Documentación Swagger para la API de IA de TodoGemini'
    },
    servers: [
      {
        url: `http://localhost:${PORT}${BASE_PATH}`,
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce el token Bearer para acceder a endpoints protegidos.'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Health', description: 'Salud del servicio' },
      { name: 'Auth', description: 'Autenticación proxy' },
      { name: 'Chat', description: 'Gestión de chatbot' },
      { name: 'Vision', description: 'Análisis facial y recomendaciones' },
      { name: 'AI Haircut', description: 'Generación de cortes con IA' },
      { name: 'AI Haircut Image', description: 'Utilidades de imágenes base64' },
      { name: 'Reviews', description: 'Análisis de reseñas' }
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check del servidor',
          security: [],
          responses: {
            200: { description: 'Servidor saludable' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Autenticar usuario',
          description: 'Proxy hacia AuthService para autenticar y obtener el token JWT',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'admin@example.com' },
                    password: { type: 'string', example: 'Secret123!' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            200: { description: 'Autenticado exitosamente' },
            401: { description: 'Credenciales inválidas' }
          }
        }
      },
      '/chat': {
        post: {
          tags: ['Chat'],
          summary: 'Enviar mensaje al Chatbot',
          description: 'Envía un mensaje al chatbot de IA. Mantiene el contexto de la conversación localmente.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: { type: 'string', description: 'Identificador del usuario' },
                    input: { type: 'string', description: 'Mensaje de texto' }
                  },
                  required: ['userId', 'input']
                }
              }
            }
          },
          responses: {
            200: { description: 'Respuesta generada' },
            400: { description: 'Faltan parámetros' }
          }
        }
      },
      '/chat/{userId}': {
        get: {
          tags: ['Chat'],
          summary: 'Obtener historial de Chatbot',
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Historial obtenido exitosamente' }
          }
        },
        delete: {
          tags: ['Chat'],
          summary: 'Limpiar historial de Chatbot',
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Historial eliminado' }
          }
        }
      },
      '/vision/recommend': {
        post: {
          tags: ['Vision'],
          summary: 'Analizar rostro y recomendar',
          description: 'Usa Vertex AI y Gemini para analizar un rostro a partir de una foto y generar recomendaciones de cortes de pelo.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    imageBase64: { type: 'string', description: 'Foto del cliente en Base64' },
                    mimeType: { type: 'string', example: 'image/jpeg' },
                    haircutName: { type: 'string', example: 'fade' },
                    description: { type: 'string', example: 'Look urbano' },
                    length: { type: 'string', example: 'short' },
                    style: { type: 'string', example: 'modern' }
                  },
                  required: ['imageBase64']
                }
              }
            }
          },
          responses: {
            200: { description: 'Análisis y recomendación exitosos' },
            400: { description: 'Falta la imagen' }
          }
        }
      },
      '/ai-haircut/analyze': {
        post: {
          tags: ['AI Haircut'],
          summary: 'Generar imagen de corte con IA',
          description: 'Acepta archivo o base64 para detectar rostro y superponer corte de cabello generado.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'Archivo de imagen' },
                    imageBase64: { type: 'string', description: 'Base64 string de imagen si no se envía archivo' },
                    mimeType: { type: 'string', example: 'image/jpeg' },
                    haircutName: { type: 'string', example: 'undercut' },
                    description: { type: 'string' },
                    length: { type: 'string' },
                    style: { type: 'string' }
                  }
                }
              },
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    imageBase64: { type: 'string' },
                    mimeType: { type: 'string', example: 'image/jpeg' },
                    haircutName: { type: 'string', example: 'undercut' },
                    description: { type: 'string' },
                    length: { type: 'string' },
                    style: { type: 'string' }
                  },
                  required: ['imageBase64']
                }
              }
            }
          },
          responses: {
            200: { description: 'Imagen generada correctamente' },
            400: { description: 'Petición inválida' }
          }
        }
      },
      '/ai-haircut-image/preview': {
        post: {
          tags: ['AI Haircut Image'],
          summary: 'Previsualizar imagen generada',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    imageBase64: { type: 'string' },
                    mimeType: { type: 'string', example: 'image/png' }
                  },
                  required: ['imageBase64']
                }
              }
            }
          },
          responses: {
            200: { description: 'Imagen decodificada y servida' }
          }
        }
      },
      '/ai-haircut-image/save': {
        post: {
          tags: ['AI Haircut Image'],
          summary: 'Guardar imágenes temporalmente',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    images: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          imageBase64: { type: 'string' },
                          mimeType: { type: 'string' },
                          filename: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Imágenes guardadas exitosamente' }
          }
        }
      },
      '/reviews/analyze/{barberId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Analizar reseñas del barbero con IA',
          parameters: [
            { name: 'barberId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Análisis generado' }
          }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
