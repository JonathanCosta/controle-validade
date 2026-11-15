import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { openAppDatabase, type AppDatabase } from '../../src/database/db.ts';
import { createProductsRepository, type ProductsRepository } from '../../src/database/products.repository.ts';
import { createProduct } from '../../src/domain/product.ts';

let db: AppDatabase;
let repository: ProductsRepository;

beforeEach(async () => {
  db = await openAppDatabase();
  await db.clear('products');
  repository = createProductsRepository(db);
});

describe('ProductsRepository — persistência', () => {
  it('grava e recupera um produto', async () => {
    const product = createProduct({ name: 'Leite integral', expiresAt: '2026-11-15' });
    await repository.add(product);
    const stored = await repository.getById(product.id);
    expect(stored).toEqual(product);
  });

  it('permite vários registros com o mesmo EAN (não é chave única)', async () => {
    const first = createProduct({ name: 'Leite', expiresAt: '2026-11-15', ean: '7890000000000' });
    const second = createProduct({ name: 'Leite', expiresAt: '2026-11-20', ean: '7890000000000' });
    await repository.add(first);
    await repository.add(second);
    const byEan = await repository.getByEan('7890000000000');
    expect(byEan).toHaveLength(2);
    expect(new Set(byEan.map((p) => p.id))).toEqual(new Set([first.id, second.id]));
  });

  it('getByEan retorna vazio para produtos sem EAN', async () => {
    await repository.add(createProduct({ name: 'Sem código', expiresAt: '2026-11-15' }));
    expect(await repository.getByEan('7890000000000')).toEqual([]);
  });

  it('getAll retorna todos os registros', async () => {
    await repository.add(createProduct({ name: 'A', expiresAt: '2026-11-15' }));
    await repository.add(createProduct({ name: 'B', expiresAt: '2026-12-01' }));
    expect(await repository.getAll()).toHaveLength(2);
  });

  it('delete remove somente o ID solicitado', async () => {
    const keep = createProduct({ name: 'Manter', expiresAt: '2026-11-15' });
    const remove = createProduct({ name: 'Remover', expiresAt: '2026-11-16' });
    await repository.add(keep);
    await repository.add(remove);
    await repository.delete(remove.id);
    expect(await repository.getById(remove.id)).toBeUndefined();
    const all = await repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe(keep.id);
  });

  it('deleteAll limpa todos os registros', async () => {
    await repository.add(createProduct({ name: 'A', expiresAt: '2026-11-15' }));
    await repository.add(createProduct({ name: 'B', expiresAt: '2026-11-16' }));
    await repository.deleteAll();
    expect(await repository.getAll()).toEqual([]);
  });

  it('add() rejeita ID duplicado — nunca sobrescreve registro existente', async () => {
    const product = createProduct({ name: 'Original', expiresAt: '2026-11-15' });
    await repository.add(product);
    await expect(
      repository.add({ ...product, name: 'Sobrescrito' }),
    ).rejects.toThrow();
    const stored = await repository.getById(product.id);
    expect(stored?.name).toBe('Original');
  });

  it('não persiste campo status calculado', async () => {
    const product = createProduct({ name: 'Leite', expiresAt: '2026-11-15' });
    await repository.add(product);
    const raw = await repository.getById(product.id);
    expect(Object.keys(raw as object).sort()).toEqual([
      'brand',
      'ean',
      'expiresAt',
      'id',
      'name',
    ]);
  });
});
