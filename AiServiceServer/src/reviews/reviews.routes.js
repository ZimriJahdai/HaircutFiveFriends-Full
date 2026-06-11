import { Router } from 'express';
import { analyzeBarberReviews } from './reviews.controller.js';

const router = Router();

router.get('/analyze/:barberId', analyzeBarberReviews);

export default router;
