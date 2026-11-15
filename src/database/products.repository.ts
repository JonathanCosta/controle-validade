/**
 * Repositório de produtos (ESPECIFICACAO §4.4).
 * Inclusão apenas com `add()` — nunca `put()`, que sobrescreveria registro.
 * Não existe update()/save(): registros somente são adicionados ou excluídos.
 */

import type { Product } from '../domain/product.ts';
import type { AppDatabase } from './db.ts';

export interface ProductsRepository {
  add(product: Product): Promise<void>;
  getById(id: string): Promise<Product | undefined>;
  getAll(): Promise<Product[]>;
  getByEan(ean: string): Promise<Product[]>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}

export function createProductsRepository(db: AppDatabase): ProductsRepository {
  return {
    async add(product: Product): Promise<void> {
      await db.add('products', product);
    },
    getById(id: string): Promise<Product | undefined> {
      return db.get('products', id);
    },
    getAll(): Promise<Product[]> {
      return db.getAll('products');
    },
    async getByEan(ean: string): Promise<Product[]> {
      return db.getAllFromIndex('products', 'ean', ean);
    },
    async delete(id: string): Promise<void> {
      await db.delete('products', id);
    },
    async deleteAll(): Promise<void> {
      await db.clear('products');
    },
  };
}
