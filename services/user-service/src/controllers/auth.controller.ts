import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { registerSchema, loginSchema } from '@shared/utils';
import { createLogger } from '@shared/utils';

const logger = createLogger('user-service:auth');

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body);

      const result = await userService.register(validatedData);

      logger.info('User registered', { userId: result.user.id, email: result.user.email });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await userService.login(validatedData);

      logger.info('User logged in', { userId: result.user.id });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required',
        });
      }

      const result = await userService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
