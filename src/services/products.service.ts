/**
 * Serviço de produtos: valida, gera UUID e grava via repositório `add()`.
 * Sem edição: registros somente são adicionados ou excluídos (AGENTS.md §2).
 */

import { createProduct, type Product, type ProductInput } from '../domain/product.ts';
import type { ProductsRepository } from '../database/products.repository.ts';

export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  /** Valida e grava um novo registro. Cada chamada cria um UUID novo. */
  async saveProduct(input: ProductInput): Promise<Product> {
    const product = createProduct(input);
    await this.repository.add(product);
    return product;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.repository.getById(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.repository.getAll();
  }

  async getProductsByEan(ean: string): Promise<Product[]> {
    return this.repository.getByEan(ean);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
