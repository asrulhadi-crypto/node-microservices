import { Router } from 'express';
import { authRouter } from './auth.routes';
import { usersRouter } from './users.routes';
import { productsRouter } from './products.routes';
import { ordersRouter } from './orders.routes';

export const routes = {
  auth: authRouter,
  users: usersRouter,
  products: productsRouter,
  orders: ordersRouter,
};
