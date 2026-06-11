import { Router } from 'express';
import { recommendHaircut } from './vision.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/recommend', validateJWT, recommendHaircut);

export default router;
