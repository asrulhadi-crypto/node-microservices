import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { updateUserSchema } from '@shared/utils';
import { createLogger } from '@shared/utils';

const logger = createLogger('user-service:user');

export const userRoutes = Router();

// Get user by ID
userRoutes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user
userRoutes.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

    const user = await userService.updateUser(id, validatedData);

    logger.info('User updated', { userId: id });

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
userRoutes.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    logger.info('User deleted', { userId: id });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
