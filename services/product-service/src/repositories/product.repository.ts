import { query } from '../database';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productRepository = {
  async findById(id: string): Promise<Product | null> {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findAll(params: ListProductsParams): Promise<{ products: Product[]; total: number }> {
    const { page = 1, limit = 10, category, minPrice, maxPrice } = params;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (category) {
      whereClause += ` AND category = $${paramCount++}`;
      values.push(category);
    }
    if (minPrice !== undefined) {
      whereClause += ` AND price >= $${paramCount++}`;
      values.push(minPrice);
    }
    if (maxPrice !== undefined) {
      whereClause += ` AND price <= $${paramCount++}`;
      values.push(maxPrice);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    values.push(limit, offset);
    const selectQuery = `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    const result = await query(selectQuery, values);

    return { products: result.rows, total };
  },

  async create(data: CreateProductDTO): Promise<Product> {
    const result = await query(
      `INSERT INTO products (id, name, description, price, stock, category, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [data.name, data.description || null, data.price, data.stock || 0, data.category || null]
    );
    return result.rows[0];
  },

  async update(id: string, data: UpdateProductDTO): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(data.price);
    }
    if (data.stock !== undefined) {
      fields.push(`stock = $${paramCount++}`);
      values.push(data.stock);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(data.category);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  },

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const result = await query(
      `UPDATE products SET stock = stock - $1, updated_at = NOW() 
       WHERE id = $2 AND stock >= $1 RETURNING *`,
      [quantity, id]
    );
    return result.rows[0] || null;
  },
};
