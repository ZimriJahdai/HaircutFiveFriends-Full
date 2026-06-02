import express from 'express';
import { generateStatisticsReport } from './statistics.controller.js';
import { validateJWT, authorizeRoles } from '../../middlewares/validate-JWT.js';
const router = express.Router();

router.get('/pdf', validateJWT, authorizeRoles('ADMIN_ROLE'), generateStatisticsReport);

export default router; 