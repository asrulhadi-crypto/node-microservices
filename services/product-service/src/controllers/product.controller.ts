import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '@shared/utils';
import { createLogger } from '@shared/utils';

const logger = createLogger('product-service:product');

export const productController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const { page, limit, category, minPrice, maxPrice } = req.query;

      const params = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        category: category as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      };

      const result = await productService.getAllProducts(params);

      res.json({
        success: true,
        data: {
          products: result.products,
          pagination: {
            page: params.page,
            limit: params.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / params.limit),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  },

  getProductById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      throw error;
    }
  },

  createProduct: async (req: Request, res: Response) => {
    try {
      const validatedData = createProductSchema.parse(req.body);

      const product = await productService.createProduct(validatedData);

      logger.info('Product created', { productId: product.id, name: product.name });

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  updateProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);

      const product = await productService.updateProduct(id, validatedData);

      logger.info('Product updated', { productId: id });

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await productService.deleteProduct(id);

      logger.info('Product deleted', { productId: id });

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  },
};
