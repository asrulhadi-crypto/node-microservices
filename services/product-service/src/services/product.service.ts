import { productRepository, Product, CreateProductDTO, UpdateProductDTO, ListProductsParams } from '../repositories/product.repository';
import { NotFoundError, BadRequestError } from '@shared/utils';

export const productService = {
  async getAllProducts(params: ListProductsParams): Promise<{ products: Product[]; total: number }> {
    const { page = 1, limit = 10 } = params;
    
    if (page < 1) {
      throw new BadRequestError('Page must be >= 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    return await productRepository.findAll(params);
  },

  async getProductById(id: string): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  },

  async createProduct(data: CreateProductDTO): Promise<Product> {
    // Validate price
    if (data.price <= 0) {
      throw new BadRequestError('Price must be positive');
    }

    // Validate stock
    if (data.stock !== undefined && data.stock < 0) {
      throw new BadRequestError('Stock cannot be negative');
    }

    return await productRepository.create(data);
  },

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    // Check if product exists
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    // Validate price if provided
    if (data.price !== undefined && data.price <= 0) {
      throw new BadRequestError('Price must be positive');
    }

    // Validate stock if provided
    if (data.stock !== undefined && data.stock < 0) {
      throw new BadRequestError('Stock cannot be negative');
    }

    const updatedProduct = await productRepository.update(id, data);
    if (!updatedProduct) {
      throw new NotFoundError('Product not found');
    }

    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    const deleted = await productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Product not found');
    }
  },

  async updateStock(id: string, quantity: number): Promise<Product> {
    if (quantity < 1) {
      throw new BadRequestError('Quantity must be positive');
    }

    const product = await productRepository.updateStock(id, quantity);
    if (!product) {
      throw new BadRequestError('Insufficient stock');
    }

    return product;
  },

  async checkProductsAvailability(items: { productId: string; quantity: number }[]): Promise<boolean> {
    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return false;
      }
    }
    return true;
  },
};
