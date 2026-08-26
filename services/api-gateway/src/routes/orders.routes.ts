import { Router, Request, Response } from 'express';
import axios from 'axios';
import { createOrderSchema } from '@shared/utils';
import { createLogger } from '@shared/utils';
import { AuthRequest } from '../middleware/auth';

const logger = createLogger('api-gateway:orders');

export const ordersRouter = Router();

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Get user orders
ordersRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '10', status } = req.query;

    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`, {
      params: { userId, page, limit, status },
    });

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Get orders error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to get orders';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Get order by ID
ordersRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${id}`);

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Get order error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to get order';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Create order
ordersRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const validatedData = createOrderSchema.parse(req.body);

    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, {
      ...validatedData,
      userId,
    });

    res.status(201).json({
      success: true,
      data: response.data.data,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    logger.error('Create order error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to create order';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Update order status
ordersRouter.put('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
      });
    }

    const response = await axios.put(`${ORDER_SERVICE_URL}/orders/${id}/status`, {
      status,
    });

    res.json({
      success: true,
      data: response.data.data,
      message: 'Order status updated successfully',
    });
  } catch (error: any) {
    logger.error('Update order status error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to update order status';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Cancel order
ordersRouter.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const response = await axios.post(`${ORDER_SERVICE_URL}/orders/${id}/cancel`);

    res.json({
      success: true,
      data: response.data.data,
      message: 'Order cancelled successfully',
    });
  } catch (error: any) {
    logger.error('Cancel order error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to cancel order';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});
