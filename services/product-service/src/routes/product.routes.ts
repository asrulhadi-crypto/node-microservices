import { Router } from 'express';
import { productController } from '../controllers/product.controller';

export const productRoutes = Router();

// Get all products (with pagination and filters)
productRoutes.get('/', productController.getAllProducts);

// Get product by ID
productRoutes.get('/:id', productController.getProductById);

// Create product
productRoutes.post('/', productController.createProduct);

// Update product
productRoutes.put('/:id', productController.updateProduct);

// Delete product
productRoutes.delete('/:id', productController.deleteProduct);
