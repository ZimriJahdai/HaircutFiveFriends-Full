'use strict';
import express, { application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';

const BASE_PATH = '/Gemini/api/v1';

const middlewares = (app) => {
    app.use(express.json({ limit: '10mb'}));
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
            service: 'Gemini Server',
        });
    });

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
        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`Gemini server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/Health`);
        });

    } catch (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
};