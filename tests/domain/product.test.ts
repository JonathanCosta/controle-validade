import { describe, expect, it } from 'vitest';

import { createProduct, normalizeProductRecord } from '../../src/domain/product.ts';
import { ProductValidationError } from '../../src/domain/errors.ts';

describe('createProduct', () => {
  it('cria produto com UUID novo a cada cadastro', () => {
    const first = createProduct({ name: 'Leite integral', expiresAt: '2026-11-15' });
    const second = createProduct({ name: 'Leite integral', expiresAt: '2026-11-20' });
    expect(first.id).not.toBe(second.id);
    expect(first.name).toBe('Leite integral');
    expect(first.ean).toBeNull();
    expect(first.brand).toBeNull();
  });

  it('aplica trim no nome e preserva acentuação e caixa', () => {
    const product = createProduct({ name: '  CaFé Torrado  ', expiresAt: '2026-11-15' });
    expect(product.name).toBe('CaFé Torrado');
  });

  it('aceita datas passadas', () => {
    const product = createProduct({ name: 'Vencido', expiresAt: '2020-01-01' });
    expect(product.expiresAt).toBe('2020-01-01');
  });

  it('normaliza EAN e marca vazios para null', () => {
    const product = createProduct({
      name: 'Arroz',
      expiresAt: '2026-11-15',
      ean: '',
      brand: '  ',
    });
    expect(product.ean).toBeNull();
    expect(product.brand).toBeNull();
  });

  it('aplica trim na marca com conteúdo (§6.6)', () => {
    const product = createProduct({
      name: 'Arroz',
      expiresAt: '2026-11-15',
      brand: '  Nestlé  ',
    });
    expect(product.brand).toBe('Nestlé');
  });

  it('rejeita nome vazio ou somente espaços', () => {
    expect(() => createProduct({ name: '', expiresAt: '2026-11-15' })).toThrow(ProductValidationError);
    expect(() => createProduct({ name: '   ', expiresAt: '2026-11-15' })).toThrow(ProductValidationError);
    try {
      createProduct({ name: ' ', expiresAt: '2026-11-15' });
    } catch (error) {
      expect((error as ProductValidationError).field).toBe('name');
    }
  });

  it('rejeita data inválida', () => {
    expect(() => createProduct({ name: 'Arroz', expiresAt: '2026-02-30' })).toThrow(ProductValidationError);
    expect(() => createProduct({ name: 'Arroz', expiresAt: '31/12/2026' })).toThrow(ProductValidationError);
  });

  it('rejeita EAN inválido', () => {
    expect(() => createProduct({ name: 'Arroz', expiresAt: '2026-11-15', ean: '123' })).toThrow(ProductValidationError);
    expect(() => createProduct({ name: 'Arroz', expiresAt: '2026-11-15', ean: '7890000000001' })).toThrow(ProductValidationError);
  });
});

describe('produtos repetidos', () => {
  it('mesmo nome, EAN e data produzem registros independentes', () => {
    const a = createProduct({
      name: 'Leite integral',
      expiresAt: '2026-11-15',
      ean: '7890000000000',
    });
    const b = createProduct({
      name: 'Leite integral',
      expiresAt: '2026-11-15',
      ean: '7890000000000',
    });
    expect(a.id).not.toBe(b.id);
    expect(a).toEqual({ ...b, id: a.id });
  });
});

describe('normalizeProductRecord', () => {
  it('normaliza registro completo do backup', () => {
    const product = normalizeProductRecord({
      id: 'a91f28a0-0c81-4a91-9ac3-44b1fb2c7c20',
      name: 'Leite integral',
      expiresAt: '2026-11-15',
      ean: '7890000000000',
      brand: null,
    });
    expect(product).not.toBeNull();
    expect(product?.id).toBe('a91f28a0-0c81-4a91-9ac3-44b1fb2c7c20');
  });

  it('rejeita registros inválidos retornando null', () => {
    expect(normalizeProductRecord(null)).toBeNull();
    expect(normalizeProductRecord('texto')).toBeNull();
    expect(normalizeProductRecord({ id: 'x', name: '', expiresAt: '2026-11-15' })).toBeNull();
    expect(normalizeProductRecord({ id: 'x', name: 'Leite', expiresAt: 'invalida' })).toBeNull();
    expect(
      normalizeProductRecord({
        id: 'x',
        name: 'Leite',
        expiresAt: '2026-11-15',
        ean: '999',
      }),
    ).toBeNull();
  });
});
