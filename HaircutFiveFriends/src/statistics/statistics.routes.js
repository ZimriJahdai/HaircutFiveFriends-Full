import express from 'express';
import { generateStatisticsReport, generateClientStatisticsReport } from './statistics.controller.js';
import { validateJWT, authorizeRoles, attachClientFromToken, requireClientFromToken } from '../../middlewares/validate-JWT.js';
const router = express.Router()

router.get('/pdf', validateJWT, authorizeRoles('ADMIN_ROLE'), generateStatisticsReport);
router.get('/client/pdf', validateJWT, authorizeRoles('USER_ROLE'), attachClientFromToken, requireClientFromToken, generateClientStatisticsReport);

export default router; 