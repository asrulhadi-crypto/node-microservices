import { Router, Request, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { createLogger } from '@shared/utils';

const logger = createLogger('api-gateway:users');

export const usersRouter = Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Get current user profile
usersRouter.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Get profile error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to get profile';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Update current user profile
usersRouter.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updateData = req.body;

    const response = await axios.put(`${USER_SERVICE_URL}/users/${userId}`, updateData);

    res.json({
      success: true,
      data: response.data.data,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    logger.error('Update profile error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to update profile';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Get user by ID (admin only)
usersRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${USER_SERVICE_URL}/users/${id}`);

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Get user error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to get user';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});
