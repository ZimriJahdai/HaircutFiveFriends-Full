import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from '../configs/db.js';
import chatRoutes from './chats/chat.routes.js';
import visionRoutes from './vision/vision.routes.js';
import reviewRoutes from './reviews/reviews.routes.js';
import aiHaircutRoutes from './aiHaircut/aiHaircut.routes.js';
import aiHaircutImageRoutes from './aiHaircutImage/image.routes.js';
import { setupLiveApi } from './ai/live-api.js';
import authRoutes from './auth/auth.routes.js';
<<<<<<< HEAD
=======
import swaggerUi from 'swagger-ui-express';
>>>>>>> 7cbf481cb73b47ed36b077cff49bc7ed1f607476
import { swaggerSpec } from '../configs/swagger.js';

dotenv.config();
connectDB(); // Conectar a MongoDB

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes base64

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get('/api/health', (req, res) => {
    res.json({ status: 'TodoGemini API is running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);

// Módulo 1: Chatbot de texto (y gestión de historial)
app.use('/api/chat', chatRoutes);

// Módulo 3: Análisis Facial y Recomendación de Cortes
app.use('/api/vision', visionRoutes);

// Módulo AI Haircut (análisis + generación de imagen)
app.use('/api/ai-haircut', aiHaircutRoutes);
app.use('/api/ai-haircut-image', aiHaircutImageRoutes);

// Módulo 4: Análisis de Reseñas
app.use('/api/reviews', reviewRoutes);

// Swagger UI para TodoGemini
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Módulo 2: Voz en tiempo real (Live API con WebSocket Proxy)
setupLiveApi(wss);

const PORT = process.env.PORT || 3007;
server.listen(PORT, () => {
    console.log("Servidor TodoGemini ejecutándose en el puerto " + PORT);
});
