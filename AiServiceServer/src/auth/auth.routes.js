import { Router } from 'express';
import axios from 'axios';

const router = Router();

const AUTH_BASE_URL = process.env.AUTH_SERVICE_BASE_URL || 'http://localhost:3005/api/v1';

router.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/auth/login`, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });

    const { token, userDetails, expiresAt } = response.data || {};

    return res.status(200).json({
      token,
      userDetails,
      userId: userDetails?.id,
      expiresAt,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: 'Error al autenticar.' };
    return res.status(status).json(data);
  }
});

export default router;
