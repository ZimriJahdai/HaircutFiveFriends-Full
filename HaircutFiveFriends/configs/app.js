'use strict';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import { dbConnection } from './db.js';
import { seedDatabase } from './seeder.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { swaggerSpec } from './swagger.js';

import serviceRoutes from '../src/service/service.routes.js';
import clientRoutes from '../src/client/client.routes.js';
import barberRoutes from '../src/barber/barber.routes.js';
import favoritesRoutes from '../src/favorites/favorites.routes.js';
import haircutRoutes from '../src/haircut/haircut.routes.js';
import appointmentRoutes from '../src/appointment/appointment.routes.js';
import reviewRoutes from '../src/review/review.routes.js';
import saleRoutes from '../src/sale/sale.routes.js';
import detailSaleRoutes from '../src/detailSale/detail.routes.js';
import invoiceRoutes from '../src/invoice/invoice.routes.js';
import statisticsRoutes from '../src/statistics/statistics.routes.js';
import productRoutes from '../src/product/product.routes.js';

const BASE_PATH = '/HaircutFiveFriends/api/v1';

const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
};

const routes = (app) => {

    app.get(`${BASE_PATH}/Health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'HaircutFiveFriends Server',
        });
    });

    // ── Rutas de negocio ──────────────────────────────────────────────────────
    app.use(`${BASE_PATH}/haircuts`,      haircutRoutes);
    app.use(`${BASE_PATH}/service`,       serviceRoutes);
    app.use(`${BASE_PATH}/review`,        reviewRoutes);
    app.use(`${BASE_PATH}/clients`,       clientRoutes);
    app.use(`${BASE_PATH}/barbers`,       barberRoutes);
    app.use(`${BASE_PATH}/favorites`,     favoritesRoutes);
    app.use(`${BASE_PATH}/appointments`,  appointmentRoutes);
    app.use(`${BASE_PATH}/sales`,         saleRoutes);
    app.use(`${BASE_PATH}/detail-sales`,  detailSaleRoutes);
    app.use(`${BASE_PATH}/invoice`,       invoiceRoutes);
    app.use(`${BASE_PATH}/statistics`,    statisticsRoutes);
    app.use(`${BASE_PATH}/products`,      productRoutes);

    // ── Swagger ───────────────────────────────────────────────────────────────
    app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // ── 404 ───────────────────────────────────────────────────────────────────
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint not found',
        });
    });
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3006;
    app.set('trust proxy', 1);

    try {
        await dbConnection();
        await seedDatabase();
        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`HaircutFiveFriends server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/Health`);
        });

    } catch (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
};