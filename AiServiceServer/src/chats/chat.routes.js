import { Router } from 'express';
import { handleChat, getChatHistory, clearChatHistory } from './chat.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/', validateJWT, handleChat);
router.get('/:userId', validateJWT, getChatHistory);
router.delete('/:userId', validateJWT, clearChatHistory);

export default router;
