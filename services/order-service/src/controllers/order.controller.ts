import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { createOrderSchema } from '@shared/utils';
import { createLogger } from '@shared/utils';

const logger = createLogger('order-service:order');

export const orderController = {
  getAllOrders: async (req: Request, res: Response) => {
    try {
      const { userId, page, limit, status } = req.query;

      const params = {
        userId: userId as string | undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string | undefined,
      };

      const result = await orderService.getAllOrders(params);

      res.json({
        success: true,
        data: {
          orders: result.orders,
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

  getOrderById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const order = await orderService.getOrderById(id);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      throw error;
    }
  },

  createOrder: async (req: Request, res: Response) => {
    try {
      const validatedData = createOrderSchema.parse(req.body);

      const order = await orderService.createOrder({
        ...validatedData,
        userId: req.body.userId,
      });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  updateOrderStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
        });
      }

      const order = await orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  cancelOrder: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const order = await orderService.cancelOrder(id);

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      throw error;
    }
  },

  deleteOrder: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await orderService.deleteOrder(id);

      logger.info('Order deleted', { orderId: id });

      res.json({
        success: true,
        message: 'Order deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  },
};
