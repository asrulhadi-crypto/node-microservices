import { Router } from 'express';
import { orderController } from '../controllers/order.controller';

export const orderRoutes = Router();

// Get all orders (with pagination and filters)
orderRoutes.get('/', orderController.getAllOrders);

// Get order by ID
orderRoutes.get('/:id', orderController.getOrderById);

// Create order
orderRoutes.post('/', orderController.createOrder);

// Update order status
orderRoutes.put('/:id/status', orderController.updateOrderStatus);

// Cancel order
orderRoutes.post('/:id/cancel', orderController.cancelOrder);

// Delete order
orderRoutes.delete('/:id', orderController.deleteOrder);
