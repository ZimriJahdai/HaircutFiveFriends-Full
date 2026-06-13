import { Router } from 'express';
import axios from 'axios';

const router = Router();

const AUTH_BASE_URL = process.env.AUTH_SERVICE_BASE_URL || 'http://localhost:3005/api/v1';
const REQUEST_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS) || 15000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'Email invalido o ausente.' });
  }
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ message: 'Password requerido.' });
  }

  try {
    const response = await axios.post(`${AUTH_BASE_URL}/auth/login`, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: REQUEST_TIMEOUT_MS,
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
