'use strict';

import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3006;
const BASE_PATH = '/HaircutFiveFriends/api/v1';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'HaircutFiveFriends API',
            version: '1.0.0',
            description: 'Documentación Swagger de la API HaircutFiveFriends'
        },
        servers: [
            {
                url: `http://localhost:${PORT}${BASE_PATH}`,
                description: 'Servidor local'
            }
        ],
        tags: [
            { name: 'Health', description: 'Salud del servicio' },
            { name: 'Services', description: 'Gestión de servicios' },
            { name: 'Clients', description: 'Gestión de clientes' },
            { name: 'Barbers', description: 'Gestión de barberos' },
            { name: 'Favorites', description: 'Gestión de favoritos' },
            { name: 'Haircuts', description: 'Gestión de cortes' },
            { name: 'Appointments', description: 'Gestión de citas' },
            { name: 'Reviews', description: 'Gestión de reseñas' },
            { name: 'Sales', description: 'Gestión de ventas' },
            { name: 'DetailSales', description: 'Gestión de detalle de ventas' },
            { name: 'Products', description: 'Gestión de productos' },
            { name: 'Invoice', description: 'Generación de facturas PDF' },
            { name: 'Statistics', description: 'Generación de reportes estadísticos' },
            { name: 'AI Haircut', description: 'Generación de cortes con IA' },
            { name: 'AI Haircut Image', description: 'Utilidades de imagen base64 para IA' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingresa tu token JWT (Bearer)'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        paths: {
            '/Health': {
                get: {
                    tags: ['Health'],
                    summary: 'Health check del servidor',
                    responses: {
                        200: {
                            description: 'Servidor saludable'
                        }
                    }
                }
            },

            '/service/crear': {
                post: {
                    tags: ['Services'],
                    summary: 'Crear servicio',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Corte de cabello' },
                                        description: { type: 'string', example: 'Corte clásico' },
                                        price: { type: 'number', example: 50 },
                                        duration: { type: 'string', example: '30 min' },
                                        category: { type: 'string', enum: ['CORTE_DE_CABELLO', 'AFEITADO', 'RECORTES_DE_BARBA', 'ARREGLO_DE_CABELLO', 'TRATAMIENTOS_CAPILARES', 'TRATAMIENTOS_FACIALES'] },
                                        status: { type: 'string', enum: ['activo', 'inactivo'] },
                                        points: { type: 'number', example: 10 }
                                    },
                                    required: ['name', 'description', 'price', 'duration', 'category', 'points']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Corte de cabello' },
                                        description: { type: 'string', example: 'Corte clásico' },
                                        price: { type: 'number', example: 50 },
                                        duration: { type: 'string', example: '30 min' },
                                        category: { type: 'string', enum: ['CORTE_DE_CABELLO', 'AFEITADO', 'RECORTES_DE_BARBA', 'ARREGLO_DE_CABELLO', 'TRATAMIENTOS_CAPILARES', 'TRATAMIENTOS_FACIALES'] },
                                        status: { type: 'string', enum: ['activo', 'inactivo'] },
                                        points: { type: 'number', example: 10 }
                                    },
                                    required: ['name', 'description', 'price', 'duration', 'category', 'points']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Servicio creado' }, 400: { description: 'Datos inválidos' } }
                }
            },
            '/service/obtener': {
                get: {
                    tags: ['Services'],
                    summary: 'Obtener todos los servicios',
                    responses: { 200: { description: 'Listado de servicios' } }
                }
            },
            '/service/obtener/{id}': {
                get: {
                    tags: ['Services'],
                    summary: 'Obtener servicio por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Servicio encontrado' }, 404: { description: 'No encontrado' } }
                }
            },
            '/service/actualizar/{id}': {
                put: {
                    tags: ['Services'],
                    summary: 'Actualizar servicio',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Corte de cabello' },
                                        description: { type: 'string', example: 'Corte clásico' },
                                        price: { type: 'number', example: 50 },
                                        duration: { type: 'string', example: '30 min' },
                                        category: { type: 'string', enum: ['CORTE_DE_CABELLO', 'AFEITADO', 'RECORTES_DE_BARBA', 'ARREGLO_DE_CABELLO', 'TRATAMIENTOS_CAPILARES', 'TRATAMIENTOS_FACIALES'] },
                                        status: { type: 'string', enum: ['activo', 'inactivo'] },
                                        points: { type: 'number', example: 10 }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Corte de cabello' },
                                        description: { type: 'string', example: 'Corte clásico' },
                                        price: { type: 'number', example: 50 },
                                        duration: { type: 'string', example: '30 min' },
                                        category: { type: 'string', enum: ['CORTE_DE_CABELLO', 'AFEITADO', 'RECORTES_DE_BARBA', 'ARREGLO_DE_CABELLO', 'TRATAMIENTOS_CAPILARES', 'TRATAMIENTOS_FACIALES'] },
                                        status: { type: 'string', enum: ['activo', 'inactivo'] },
                                        points: { type: 'number', example: 10 }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Servicio actualizado' } }
                }
            },
            '/service/eliminar/{id}': {
                delete: {
                    tags: ['Services'],
                    summary: 'Eliminar servicio',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Servicio eliminado' } }
                }
            },
            '/service/estado/{status}': {
                get: {
                    tags: ['Services'],
                    summary: 'Filtrar servicios por estado',
                    parameters: [{ name: 'status', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Servicios filtrados' } }
                }
            },
            '/service/tipo/{name}': {
                get: {
                    tags: ['Services'],
                    summary: 'Buscar servicios por nombre',
                    parameters: [{ name: 'name', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Servicios encontrados' } }
                }
            },

            '/clients': {
                post: {
                    tags: ['Clients'],
                    summary: 'Crear cliente',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Juan Pérez' },
                                        phone: { type: 'string', example: '+58 1234567890' },
                                        email: { type: 'string', example: 'juan@example.com' },
                                        password: { type: 'string', example: 'password123' },
                                        faceshape: { type: 'string', example: 'OVALADO' },
                                        profilePicture: { type: 'string' }
                                    },
                                    required: ['name', 'phone', 'email', 'password']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        phone: { type: 'string' },
                                        email: { type: 'string' },
                                        password: { type: 'string' },
                                        faceshape: { type: 'string' },
                                        profilePicture: { type: 'string', format: 'binary' }
                                    },
                                    required: ['name', 'phone', 'email', 'password']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Cliente creado' } }
                },
                get: {
                    tags: ['Clients'],
                    summary: 'Obtener clientes',
                    responses: { 200: { description: 'Listado de clientes' } }
                }
            },
            '/clients/{id}': {
                get: {
                    tags: ['Clients'],
                    summary: 'Obtener cliente por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Cliente encontrado' }, 404: { description: 'No encontrado' } }
                },
                put: {
                    tags: ['Clients'],
                    summary: 'Actualizar cliente',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Juan Pérez' },
                                        phone: { type: 'string', example: '+58 1234567890' },
                                        email: { type: 'string', example: 'juan@example.com' },
                                        password: { type: 'string', example: 'password123' },
                                        faceshape: { type: 'string', example: 'OVALADO' },
                                        profilePicture: { type: 'string' }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        phone: { type: 'string' },
                                        email: { type: 'string' },
                                        password: { type: 'string' },
                                        faceshape: { type: 'string' },
                                        profilePicture: { type: 'string', format: 'binary' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Cliente actualizado' } }
                },
                delete: {
                    tags: ['Clients'],
                    summary: 'Eliminar cliente',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Cliente eliminado' } }
                }
            },

            '/barbers': {
                post: {
                    tags: ['Barbers'],
                    summary: 'Crear barbero',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Carlos López' },
                                        email: { type: 'string', example: 'carlos@example.com' },
                                        password: { type: 'string', example: 'password123' },
                                        phone: { type: 'string', example: '+58 1234567890' },
                                        profilePicture: { type: 'string' },
                                        schedule: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    days: { type: 'string', example: 'Lunes-Viernes' },
                                                    hours: { type: 'string', example: '9AM-6PM' }
                                                }
                                            }
                                        }
                                    },
                                    required: ['name', 'email', 'password', 'phone']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        email: { type: 'string' },
                                        password: { type: 'string' },
                                        phone: { type: 'string' },
                                        profilePicture: { type: 'string', format: 'binary' }
                                    },
                                    required: ['name', 'email', 'password', 'phone']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Barbero creado' } }
                },
                get: {
                    tags: ['Barbers'],
                    summary: 'Obtener barberos',
                    responses: { 200: { description: 'Listado de barberos' } }
                }
            },
            '/barbers/{id}': {
                get: {
                    tags: ['Barbers'],
                    summary: 'Obtener barbero por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Barbero encontrado' } }
                },
                put: {
                    tags: ['Barbers'],
                    summary: 'Actualizar barbero',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Carlos López' },
                                        email: { type: 'string', example: 'carlos@example.com' },
                                        password: { type: 'string', example: 'password123' },
                                        phone: { type: 'string', example: '+58 1234567890' },
                                        profilePicture: { type: 'string' },
                                        schedule: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    days: { type: 'string', example: 'Lunes-Viernes' },
                                                    hours: { type: 'string', example: '9AM-6PM' }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        email: { type: 'string' },
                                        password: { type: 'string' },
                                        phone: { type: 'string' },
                                        profilePicture: { type: 'string', format: 'binary' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Barbero actualizado' } }
                },
                delete: {
                    tags: ['Barbers'],
                    summary: 'Eliminar barbero',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Barbero eliminado' } }
                }
            },

            '/favorites': {
                post: {
                    tags: ['Favorites'],
                    summary: 'Crear favorito',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                        typeFavorite: { type: 'string', example: 'barber' },
                                        barberOrServiceId: { type: 'string', example: '507f1f77bcf86cd799439012' }
                                    },
                                    required: ['clientId', 'typeFavorite', 'barberOrServiceId']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string' },
                                        typeFavorite: { type: 'string' },
                                        barberOrServiceId: { type: 'string' }
                                    },
                                    required: ['clientId', 'typeFavorite', 'barberOrServiceId']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Favorito creado' } }
                },
                get: {
                    tags: ['Favorites'],
                    summary: 'Obtener favoritos',
                    parameters: [
                        { name: 'clientId', in: 'query', required: false, schema: { type: 'string' } },
                        { name: 'typeFavorite', in: 'query', required: false, schema: { type: 'string' } }
                    ],
                    responses: { 200: { description: 'Listado de favoritos' } }
                }
            },
            '/favorites/{id}': {
                get: {
                    tags: ['Favorites'],
                    summary: 'Obtener favorito por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Favorito encontrado' } }
                },
                put: {
                    tags: ['Favorites'],
                    summary: 'Actualizar favorito',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string' },
                                        typeFavorite: { type: 'string' },
                                        barberOrServiceId: { type: 'string' }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string' },
                                        typeFavorite: { type: 'string' },
                                        barberOrServiceId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Favorito actualizado' } }
                },
                delete: {
                    tags: ['Favorites'],
                    summary: 'Eliminar favorito',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Favorito eliminado' } }
                }
            },

            '/haircuts/create': {
                post: {
                    tags: ['Haircuts'],
                    summary: 'Crear corte',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Fade Clásico' },
                                        description: { type: 'string', example: 'Corte moderno y limpio' },
                                        faceTypeRecommended: { type: 'string', enum: ['OVALADO', 'CUADRADO', 'REDONDO', 'CORAZÓN', 'CUALQUIERA', 'TRIANGULAR'] },
                                        imageRef: { type: 'string' }
                                    },
                                    required: ['name', 'description', 'faceTypeRecommended']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        faceTypeRecommended: { type: 'string' },
                                        imageRef: { type: 'string', format: 'binary' }
                                    },
                                    required: ['name', 'description', 'faceTypeRecommended']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Corte creado' } }
                }
            },
            '/haircuts': {
                get: {
                    tags: ['Haircuts'],
                    summary: 'Obtener cortes',
                    parameters: [
                        { name: 'limit', in: 'query', required: false, schema: { type: 'number' } },
                        { name: 'page', in: 'query', required: false, schema: { type: 'number' } }
                    ],
                    responses: { 200: { description: 'Listado de cortes' } }
                }
            },
            '/haircuts/FaceType/{faceType}': {
                get: {
                    tags: ['Haircuts'],
                    summary: 'Filtrar corte por tipo de rostro',
                    parameters: [{ name: 'faceType', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Listado filtrado' } }
                }
            },
            '/haircuts/Name/{name}': {
                get: {
                    tags: ['Haircuts'],
                    summary: 'Buscar corte por nombre',
                    parameters: [{ name: 'name', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Listado filtrado' } }
                }
            },
            '/haircuts/{id}': {
                get: {
                    tags: ['Haircuts'],
                    summary: 'Obtener corte por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Corte encontrado' } }
                },
                put: {
                    tags: ['Haircuts'],
                    summary: 'Actualizar corte',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Fade Clásico' },
                                        description: { type: 'string', example: 'Corte moderno y limpio' },
                                        faceTypeRecommended: { type: 'string', enum: ['OVALADO', 'CUADRADO', 'REDONDO', 'CORAZÓN', 'CUALQUIERA', 'TRIANGULAR'] },
                                        imageRef: { type: 'string' }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        faceTypeRecommended: { type: 'string' },
                                        imageRef: { type: 'string', format: 'binary' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Corte actualizado' } }
                },
                delete: {
                    tags: ['Haircuts'],
                    summary: 'Eliminar corte',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Corte eliminado' } }
                }
            },

            '/appointments/create': {
                post: {
                    tags: ['Appointments'],
                    summary: 'Crear cita',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                        barberId: { type: 'string', example: '507f1f77bcf86cd799439012' },
                                        serviceId: { type: 'string', example: '507f1f77bcf86cd799439013' },
                                        appointmentDate: { type: 'string', format: 'date-time', example: '2026-03-10T14:30:00Z' },
                                        status: { type: 'string', enum: ['PENDIENTE', 'CANCELADA', 'COMPLETADA'] }
                                    },
                                    required: ['clienteId', 'barberId', 'serviceId', 'appointmentDate']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string' },
                                        barberId: { type: 'string' },
                                        serviceId: { type: 'string' },
                                        appointmentDate: { type: 'string' },
                                        status: { type: 'string' }
                                    },
                                    required: ['clienteId', 'barberId', 'serviceId', 'appointmentDate']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Cita creada' } }
                }
            },
            '/appointments': {
                get: {
                    tags: ['Appointments'],
                    summary: 'Obtener citas',
                    responses: { 200: { description: 'Listado de citas' } }
                }
            },
            '/appointments/date/{date}': {
                get: {
                    tags: ['Appointments'],
                    summary: 'Obtener citas por fecha',
                    parameters: [{ name: 'date', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Citas por fecha' } }
                }
            },
            '/appointments/barber/{barberId}': {
                get: {
                    tags: ['Appointments'],
                    summary: 'Obtener citas por barbero',
                    parameters: [{ name: 'barberId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Citas por barbero' } }
                }
            },
            '/appointments/client/{clientId}': {
                get: {
                    tags: ['Appointments'],
                    summary: 'Obtener citas por cliente',
                    parameters: [{ name: 'clientId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Citas por cliente' } }
                }
            },
            '/appointments/{id}': {
                get: {
                    tags: ['Appointments'],
                    summary: 'Obtener cita por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Cita encontrada' } }
                },
                put: {
                    tags: ['Appointments'],
                    summary: 'Actualizar cita',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string' },
                                        barberId: { type: 'string' },
                                        serviceId: { type: 'string' },
                                        appointmentDate: { type: 'string', format: 'date-time' },
                                        status: { type: 'string', enum: ['PENDIENTE', 'CANCELADA', 'COMPLETADA'] }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string' },
                                        barberId: { type: 'string' },
                                        serviceId: { type: 'string' },
                                        appointmentDate: { type: 'string' },
                                        status: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Cita actualizada' } }
                },
                delete: {
                    tags: ['Appointments'],
                    summary: 'Cancelar cita',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Cita cancelada' } }
                }
            },

            '/review/crear': {
                post: {
                    tags: ['Reviews'],
                    summary: 'Crear reseña',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                        barberoId: { type: 'string', example: '507f1f77bcf86cd799439012' },
                                        servicioId: { type: 'string', example: '507f1f77bcf86cd799439013' },
                                        score: { type: 'number', minimum: 1, maximum: 5, example: 5 },
                                        comment: { type: 'string', example: 'Excelente servicio' }
                                    },
                                    required: ['clienteId', 'barberoId', 'servicioId', 'score', 'comment']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string' },
                                        barberoId: { type: 'string' },
                                        servicioId: { type: 'string' },
                                        score: { type: 'number' },
                                        comment: { type: 'string' }
                                    },
                                    required: ['clienteId', 'barberoId', 'servicioId', 'score', 'comment']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Reseña creada' } }
                }
            },
            '/review/obtener': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Obtener reseñas',
                    responses: { 200: { description: 'Listado de reseñas' } }
                }
            },
            '/review/obtener/{id}': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Obtener reseña por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Reseña encontrada' } }
                }
            },
            '/review/actualizar/{id}': {
                put: {
                    tags: ['Reviews'],
                    summary: 'Actualizar reseña',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string' },
                                        barberoId: { type: 'string' },
                                        servicioId: { type: 'string' },
                                        score: { type: 'number', minimum: 1, maximum: 5 },
                                        comment: { type: 'string' }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clienteId: { type: 'string' },
                                        barberoId: { type: 'string' },
                                        servicioId: { type: 'string' },
                                        score: { type: 'number' },
                                        comment: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Reseña actualizada' } }
                }
            },
            '/review/eliminar/{id}': {
                delete: {
                    tags: ['Reviews'],
                    summary: 'Eliminar reseña',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Reseña eliminada' } }
                }
            },
            '/review/barbero/{barberoId}': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Obtener reseñas por barbero',
                    parameters: [{ name: 'barberoId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Reseñas por barbero' } }
                }
            },
            '/review/cliente/{clienteId}': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Obtener reseñas por cliente',
                    parameters: [{ name: 'clienteId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Reseñas por cliente' } }
                }
            },
            '/review/servicio/{servicioId}': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Obtener reseñas por servicio',
                    parameters: [{ name: 'servicioId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Reseñas por servicio' } }
                }
            },
            '/review/promedio/{barberoId}': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Obtener promedio de barbero',
                    parameters: [{ name: 'barberoId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Promedio calculado' } }
                }
            },

            '/sales/create': {
                post: {
                    tags: ['Sales'],
                    summary: 'Crear venta',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                        saleType: { type: 'string', enum: ['LOCAL', 'DOMICILIO'], example: 'LOCAL' },
                                        addressSale: { type: 'string', example: 'Calle Principal 123' },
                                        saleDate: { type: 'string', format: 'date-time' },
                                        total: { type: 'number', example: 150.50 },
                                        paymentMethod: { type: 'string', enum: ["TARJETA", "EFECTIVO"], example: 'EFECTIVO' },
                                        status: { type: 'string', enum: ['COMPLETADO', 'CANCELADO', 'PENDIENTE'] }
                                    },
                                    required: ['clientId', 'saleDate', 'total', 'paymentMethod']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string' },
                                        saleType: { type: 'string' },
                                        addressSale: { type: 'string' },
                                        saleDate: { type: 'string' },
                                        total: { type: 'number' },
                                        paymentMethod: { type: 'string' },
                                        status: { type: 'string' }
                                    },
                                    required: ['clientId', 'saleDate', 'total', 'paymentMethod']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Venta creada' } }
                }
            },
            '/sales/my-sales': {
                get: {
                    tags: ['Sales'],
                    summary: 'Obtener mis ventas',
                    responses: { 200: { description: 'Listado de ventas del usuario' } }
                }
            },
            '/sales': {
                get: {
                    tags: ['Sales'],
                    summary: 'Obtener ventas',
                    responses: { 200: { description: 'Listado de ventas' } }
                }
            },
            '/sales/{id}': {
                get: {
                    tags: ['Sales'],
                    summary: 'Obtener venta por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Venta encontrada' } }
                },
                put: {
                    tags: ['Sales'],
                    summary: 'Actualizar venta',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string' },
                                        saleType: { type: 'string', enum: ['LOCAL', 'DOMICILIO'] },
                                        addressSale: { type: 'string' },
                                        saleDate: { type: 'string', format: 'date-time' },
                                        total: { type: 'number' },
                                        paymentMethod: { type: 'string', enum: ['TARJETA', 'EFECTIVO'] },
                                        status: { type: 'string', enum: ['COMPLETADO', 'CANCELADO', 'PENDIENTE'] }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        clientId: { type: 'string' },
                                        saleType: { type: 'string' },
                                        addressSale: { type: 'string' },
                                        saleDate: { type: 'string' },
                                        total: { type: 'number' },
                                        paymentMethod: { type: 'string' },
                                        status: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Venta actualizada' } }
                },
                delete: {
                    tags: ['Sales'],
                    summary: 'Eliminar venta',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Venta eliminada' } }
                }
            },

            '/detail-sales/create': {
                post: {
                    tags: ['DetailSales'],
                    summary: 'Crear detalle de venta',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        saleId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                        productId: { type: 'string', example: '507f1f77bcf86cd799439012' },
                                        quantity: { type: 'number', example: 2 },
                                        total: { type: 'number', example: 100.00 }
                                    },
                                    required: ['saleId', 'productId', 'quantity', 'total']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        saleId: { type: 'string' },
                                        productId: { type: 'string' },
                                        quantity: { type: 'number' },
                                        total: { type: 'number' }
                                    },
                                    required: ['saleId', 'productId', 'quantity', 'total']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Detalle creado' } }
                }
            },
            '/detail-sales/sale/{saleId}': {
                get: {
                    tags: ['DetailSales'],
                    summary: 'Obtener detalle por venta',
                    parameters: [{ name: 'saleId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Detalle de la venta' } }
                }
            },
            '/detail-sales': {
                get: {
                    tags: ['DetailSales'],
                    summary: 'Obtener todos los detalles',
                    responses: { 200: { description: 'Listado de detalles' } }
                }
            },
            '/detail-sales/{id}': {
                get: {
                    tags: ['DetailSales'],
                    summary: 'Obtener detalle por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Detalle encontrado' } }
                },
                put: {
                    tags: ['DetailSales'],
                    summary: 'Actualizar detalle',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        saleId: { type: 'string' },
                                        productId: { type: 'string' },
                                        quantity: { type: 'number' },
                                        total: { type: 'number' }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        saleId: { type: 'string' },
                                        productId: { type: 'string' },
                                        quantity: { type: 'number' },
                                        total: { type: 'number' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Detalle actualizado' } }
                },
                delete: {
                    tags: ['DetailSales'],
                    summary: 'Eliminar detalle',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Detalle eliminado' } }
                }
            },

            '/products/create': {
                post: {
                    tags: ['Products'],
                    summary: 'Crear producto',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Hair Gel Strong Hold' },
                                        description: { type: 'string', example: 'Long lasting shiny hair gel' },
                                        price: { type: 'number', example: 35 },
                                        stock: { type: 'number', example: 50 },
                                        category: { type: 'string', example: 'GEL' }
                                    },
                                    required: ['name', 'description', 'price', 'stock', 'category']
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Hair Gel Strong Hold' },
                                        description: { type: 'string', example: 'Long lasting shiny hair gel' },
                                        price: { type: 'number', example: 35 },
                                        stock: { type: 'number', example: 50 },
                                        category: { type: 'string', example: 'GEL' }
                                    },
                                    required: ['name', 'description', 'price', 'stock', 'category']
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Producto creado' } }
                }
            },
            '/products': {
                get: {
                    tags: ['Products'],
                    summary: 'Obtener todos los productos',
                    responses: { 200: { description: 'Listado de productos' } }
                }
            },
            '/products/{id}': {
                get: {
                    tags: ['Products'],
                    summary: 'Obtener producto por ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Producto encontrado' } }
                },
                put: {
                    tags: ['Products'],
                    summary: 'Actualizar producto',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', example: 'Hair Gel Strong Hold' },
                                        description: { type: 'string', example: 'Long lasting shiny hair gel' },
                                        price: { type: 'number', example: 35 },
                                        stock: { type: 'number', example: 50 },
                                        category: { type: 'string', example: 'GEL' }
                                    }
                                }
                            },
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        price: { type: 'number' },
                                        stock: { type: 'number' },
                                        category: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Producto actualizado' } }
                },
                delete: {
                    tags: ['Products'],
                    summary: 'Eliminar producto',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Producto eliminado' } }
                }
            },

            '/invoice/pdf/{saleId}': {
                get: {
                    tags: ['Invoice'],
                    summary: 'Descargar factura en PDF',
                    description: 'Genera y descarga la factura en formato PDF para una venta específica',
                    parameters: [
                        { 
                            name: 'saleId', 
                            in: 'path', 
                            required: true, 
                            schema: { type: 'string' },
                            description: 'ID de la venta'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Factura PDF generada exitosamente',
                            content: {
                                'application/pdf': {
                                    schema: {
                                        type: 'string',
                                        format: 'binary'
                                    }
                                }
                            }
                        },
                        404: { description: 'Venta no encontrada' },
                        500: { description: 'Error al generar la factura' }
                    }
                }
            },

            '/statistics/pdf': {
                get: {
                    tags: ['Statistics'],
                    summary: 'Generar reporte de estadísticas en PDF',
                    description: 'Genera un reporte completo de estadísticas de ventas, servicios y barberos en formato PDF',
                    responses: {
                        200: {
                            description: 'Reporte PDF generado exitosamente',
                            content: {
                                'application/pdf': {
                                    schema: {
                                        type: 'string',
                                        format: 'binary'
                                    }
                                }
                            }
                        },
                        500: { description: 'Error al generar el reporte' }
                    }
                }
            },

            '/ai-haircut/analyze': {
                post: {
                    tags: ['AI Haircut'],
                    summary: 'Analizar rostro y generar corte con IA',
                    description: 'Envía una foto (archivo o base64) y devuelve resumen del rostro y una imagen con el corte solicitado.',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        image: { type: 'string', format: 'binary', description: 'Foto del cliente (alternativa a imageBase64)' },
                                        imageBase64: { type: 'string', description: 'Foto en base64 si no envías archivo' },
                                        mimeType: { type: 'string', example: 'image/jpeg' },
                                        haircutName: { type: 'string', example: 'fade' },
                                        description: { type: 'string', example: 'borde limpio, look moderno' },
                                        length: { type: 'string', enum: ['short', 'medium', 'long'], example: 'short' },
                                        style: { type: 'string', enum: ['classic', 'modern', 'urban'], example: 'modern' }
                                    }
                                }
                            },
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        imageBase64: { type: 'string', description: 'Foto en base64' },
                                        mimeType: { type: 'string', example: 'image/jpeg' },
                                        haircutName: { type: 'string', example: 'fade' },
                                        description: { type: 'string', example: 'borde limpio, look moderno' },
                                        length: { type: 'string', enum: ['short', 'medium', 'long'], example: 'short' },
                                        style: { type: 'string', enum: ['classic', 'modern', 'urban'], example: 'modern' }
                                    },
                                    required: ['imageBase64']
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Análisis y propuesta de corte generados',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            faceSummary: { type: 'string', example: 'Rostro ovalado, cabello lacio oscuro...' },
                                            haircutImageBase64: { type: 'string', description: 'Imagen editada en base64' },
                                            haircutParams: {
                                                type: 'object',
                                                properties: {
                                                    haircutName: { type: 'string' },
                                                    description: { type: 'string' },
                                                    length: { type: 'string' },
                                                    style: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'Solicitud inválida (sin imagen o base64 inválido)' },
                        500: { description: 'Error al procesar la imagen' }
                    }
                }
            },

            '/ai-haircut-image/preview': {
                post: {
                    tags: ['AI Haircut Image'],
                    summary: 'Previsualizar imagen base64',
                    description: 'Devuelve la imagen decodificada desde base64 (útil para probar render).',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        imageBase64: { type: 'string', description: 'Imagen en base64' },
                                        mimeType: { type: 'string', example: 'image/png' }
                                    },
                                    required: ['imageBase64']
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Imagen devuelta en binario con el mimeType indicado',
                            content: {
                                '*/*': {
                                    schema: {
                                        type: 'string',
                                        format: 'binary'
                                    }
                                }
                            }
                        },
                        400: { description: 'Falta imageBase64' }
                    }
                }
            },

            '/ai-haircut-image/save': {
                post: {
                    tags: ['AI Haircut Image'],
                    summary: 'Guardar imágenes base64 en /tmp',
                    description: 'Acepta una o varias imágenes base64 y devuelve las rutas locales temporales.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        // modo múltiple
                                        images: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    imageBase64: { type: 'string' },
                                                    mimeType: { type: 'string', example: 'image/png' },
                                                    filename: { type: 'string', example: 'img1.png' }
                                                },
                                                required: ['imageBase64']
                                            }
                                        },
                                        // modo legacy (single)
                                        imageBase64: { type: 'string', description: 'Usar cuando no se envía array images' },
                                        mimeType: { type: 'string', example: 'image/png' },
                                        filename: { type: 'string', example: 'preview.png' }
                                    },
                                    oneOf: [
                                        { required: ['images'] },
                                        { required: ['imageBase64'] }
                                    ]
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Imágenes guardadas',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            files: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        filePath: { type: 'string' },
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
                        400: { description: 'Solicitud inválida (array vacío o sin imageBase64)' }
                    }
                }
            }
        }
    },
    apis: ['./src/**/*.routes.js', './src/**/*.router.js']
};

export const swaggerSpec = swaggerJsdoc(options);
