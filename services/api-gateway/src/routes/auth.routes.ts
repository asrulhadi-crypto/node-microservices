import { Router, Request, Response } from 'express';
import axios from 'axios';
import { registerSchema, loginSchema } from '@shared/utils';
import { createLogger } from '@shared/utils';

const logger = createLogger('api-gateway:auth');

export const authRouter = Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Register new user
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const response = await axios.post(`${USER_SERVICE_URL}/auth/register`, validatedData);

    res.status(201).json({
      success: true,
      data: response.data.data,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    logger.error('Registration error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Registration failed';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const response = await axios.post(`${USER_SERVICE_URL}/auth/login`, validatedData);

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Login error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Login failed';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Refresh token
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    const response = await axios.post(`${USER_SERVICE_URL}/auth/refresh`, { refreshToken });

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Token refresh error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Token refresh failed';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});
