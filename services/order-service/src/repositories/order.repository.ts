import { query } from '../database';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  userId: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
}

export interface UpdateOrderStatusDTO {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface ListOrdersParams {
  userId?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export const orderRepository = {
  async findById(id: string): Promise<Order | null> {
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    const order = result.rows[0];
    if (!order) return null;
    
    // Parse JSON fields
    order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    order.shippingAddress = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : order.shipping_address;
    
    return order;
  },

  async findAll(params: ListOrdersParams): Promise<{ orders: Order[]; total: number }> {
    const { userId, page = 1, limit = 10, status } = params;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (userId) {
      whereClause += ` AND user_id = $${paramCount++}`;
      values.push(userId);
    }
    if (status) {
      whereClause += ` AND status = $${paramCount++}`;
      values.push(status);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    values.push(limit, offset);
    const selectQuery = `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    const result = await query(selectQuery, values);

    const orders = result.rows.map((order) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingAddress: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address,
    }));

    return { orders, total };
  },

  async findByUserId(userId: string): Promise<Order[]> {
    const result = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows.map((order) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingAddress: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address,
    }));
  },

  async create(data: CreateOrderDTO): Promise<Order> {
    const result = await query(
      `INSERT INTO orders (id, user_id, items, total_amount, status, shipping_address, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2::jsonb, $3, $4, $5::jsonb, NOW(), NOW())
       RETURNING *`,
      [
        data.userId,
        JSON.stringify(data.items),
        data.totalAmount,
        'pending',
        JSON.stringify(data.shippingAddress),
      ]
    );
    
    const order = result.rows[0];
    order.items = JSON.parse(order.items);
    order.shippingAddress = JSON.parse(order.shipping_address);
    
    return order;
  },

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    const order = result.rows[0];
    if (!order) return null;
    
    order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    order.shippingAddress = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : order.shipping_address;
    
    return order;
  },

  async cancel(id: string): Promise<Order | null> {
    const result = await query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() 
       WHERE id = $1 AND status IN ('pending', 'confirmed') RETURNING *`,
      [id]
    );
    
    const order = result.rows[0];
    if (!order) return null;
    
    order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    order.shippingAddress = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : order.shipping_address;
    
    return order;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  },
};
