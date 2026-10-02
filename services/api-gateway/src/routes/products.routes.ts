import { Router, Request, Response } from 'express';
import axios from 'axios';
import { createProductSchema, updateProductSchema } from '@shared/utils';
import { createLogger } from '@shared/utils';
import { adminMiddleware, authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const logger = createLogger('api-gateway:products');

export const productsRouter = Router();

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

// Get all products (with pagination and filters)
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', category, minPrice, maxPrice } = req.query;

    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`, {
      params: { page, limit, category, minPrice, maxPrice },
    });

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Get products error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to get products';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Get product by ID
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/${id}`);

    res.json({
      success: true,
      data: response.data.data,
    });
  } catch (error: any) {
    logger.error('Get product error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to get product';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Create product (admin only)
productsRouter.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const response = await axios.post(`${PRODUCT_SERVICE_URL}/products`, validatedData);

    res.status(201).json({
      success: true,
      data: response.data.data,
      message: 'Product created successfully',
    });
  } catch (error: any) {
    logger.error('Create product error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to create product';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Update product (admin only)
productsRouter.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);

    const response = await axios.put(`${PRODUCT_SERVICE_URL}/products/${id}`, validatedData);

    res.json({
      success: true,
      data: response.data.data,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    logger.error('Update product error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to update product';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Delete product (admin only)
productsRouter.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await axios.delete(`${PRODUCT_SERVICE_URL}/products/${id}`);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete product error:', { error: error.message });
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to delete product';
    
    res.status(status).json({
      success: false,
      error: message,
    });
  }
});
