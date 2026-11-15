import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { openAppDatabase, type AppDatabase } from '../../src/database/db.ts';
import { createProductsRepository, type ProductsRepository } from '../../src/database/products.repository.ts';
import { ProductsService } from '../../src/services/products.service.ts';
import { ProductValidationError } from '../../src/domain/errors.ts';

let db: AppDatabase;
let repository: ProductsRepository;
let service: ProductsService;

beforeEach(async () => {
  db = await openAppDatabase();
  await db.clear('products');
  repository = createProductsRepository(db);
  service = new ProductsService(repository);
});

describe('ProductsService.saveProduct', () => {
  it('valida, gera UUID e grava o produto', async () => {
    const product = await service.saveProduct({
      name: 'Leite integral',
      expiresAt: '2026-11-15',
      ean: '7890000000000',
      brand: '  Tirol  ',
    });
    expect(product.id).toBeTruthy();
    expect(product.brand).toBe('Tirol');
    const stored = await repository.getById(product.id);
    expect(stored).toEqual(product);
  });

  it('não grava nada quando a validação falha', async () => {
    await expect(
      service.saveProduct({ name: '   ', expiresAt: '2026-11-15' }),
    ).rejects.toThrow(ProductValidationError);
    expect(await repository.getAll()).toEqual([]);
  });

  it('rejeita EAN inválido sem gravar', async () => {
    await expect(
      service.saveProduct({ name: 'X', expiresAt: '2026-11-15', ean: '999' }),
    ).rejects.toThrow(ProductValidationError);
    expect(await repository.getAll()).toEqual([]);
  });

  it('cada chamada válida cria um registro independente (repetidos permitidos)', async () => {
    const first = await service.saveProduct({ name: 'Leite', expiresAt: '2026-11-15', ean: '7890000000000' });
    const second = await service.saveProduct({ name: 'Leite', expiresAt: '2026-11-20', ean: '7890000000000' });
    expect(first.id).not.toBe(second.id);
    expect(await repository.getByEan('7890000000000')).toHaveLength(2);
  });

  it('aceita datas passadas', async () => {
    const product = await service.saveProduct({ name: 'Vencido', expiresAt: '2020-01-01' });
    expect((await repository.getById(product.id))?.expiresAt).toBe('2020-01-01');
  });
});

describe('ProductsService.deleteProduct', () => {
  it('remove somente o registro solicitado', async () => {
    const keep = await service.saveProduct({ name: 'Manter', expiresAt: '2026-11-15' });
    const remove = await service.saveProduct({ name: 'Remover', expiresAt: '2026-11-16' });
    await service.deleteProduct(remove.id);
    expect(await service.getProduct(remove.id)).toBeUndefined();
    expect(await service.getProduct(keep.id)).toEqual(keep);
  });
});
