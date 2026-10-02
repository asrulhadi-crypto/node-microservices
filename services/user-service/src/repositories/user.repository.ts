import { query } from '../database';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  passwordHash: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  passwordHash?: string;
}

export const userRepository = {
  // pg returns snake_case columns; map to the camelCase User interface.
  mapRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  },

  async create(data: CreateUserDTO): Promise<User> {
    const result = await query(
      `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [data.email, data.name, data.passwordHash, data.role || 'user']
    );
    return this.mapRow(result.rows[0]);
  },

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.passwordHash) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(data.passwordHash);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  },
};
