import { describe, expect, it } from 'vitest';

import {
  attentionProducts,
  countByStatus,
  filterProducts,
  groupByDate,
  groupByName,
  sortProducts,
  withStatus,
} from '../../src/domain/product-view.ts';
import type { Product } from '../../src/domain/product.ts';

function p(overrides: Partial<Product> & Pick<Product, 'id' | 'name' | 'expiresAt'>): Product {
  return {
    ean: null,
    brand: null,
    ...overrides,
  };
}

const TODAY = '2026-11-12';
const NEAR = 15;

describe('withStatus/countByStatus', () => {
  it('classifica e conta registros pelos quatro status', () => {
    const products = withStatus(
      [
        p({ id: '1', name: 'A', expiresAt: '2026-11-11' }),
        p({ id: '2', name: 'B', expiresAt: '2026-11-12' }),
        p({ id: '3', name: 'C', expiresAt: '2026-11-20' }),
        p({ id: '4', name: 'D', expiresAt: '2026-12-10' }),
      ],
      TODAY,
      NEAR,
    );
    expect(countByStatus(products)).toEqual({
      expired: 1,
      today: 1,
      upcoming: 1,
      valid: 1,
      total: 4,
    });
  });
});

describe('sortProducts', () => {
  it('ordena por validade, nome normalizado e ID', () => {
    const products = withStatus(
      [
        p({ id: 'b', name: 'Água', expiresAt: '2026-11-12' }),
        p({ id: 'a', name: 'agua', expiresAt: '2026-11-12' }),
        p({ id: 'c', name: 'Z', expiresAt: '2026-11-11' }),
      ],
      TODAY,
      NEAR,
    );
    const sorted = sortProducts(products);
    expect(sorted.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('filterProducts', () => {
  const products = withStatus(
    [
      p({ id: '1', name: 'Leite Integral', expiresAt: '2026-11-11' }),
      p({ id: '2', name: 'Café Torrado', expiresAt: '2026-11-12' }),
      p({ id: '3', name: 'Pão de Queijo', expiresAt: '2026-12-10' }),
    ],
    TODAY,
    NEAR,
  );

  it('busca ignora caixa e acentos e procura trecho', () => {
    expect(filterProducts(products, { query: '  cafe  ', status: 'all' }).map((x) => x.id)).toEqual(['2']);
    expect(filterProducts(products, { query: 'pao', status: 'all' }).map((x) => x.id)).toEqual(['3']);
    expect(filterProducts(products, { query: 'LEITE', status: 'all' }).map((x) => x.id)).toEqual(['1']);
  });

  it('filtra por status e combina com busca (AND)', () => {
    expect(filterProducts(products, { query: '', status: 'expired' }).map((x) => x.id)).toEqual(['1']);
    expect(filterProducts(products, { query: 'café', status: 'expired' })).toEqual([]);
    expect(filterProducts(products, { query: 'café', status: 'today' }).map((x) => x.id)).toEqual(['2']);
  });
});

describe('attentionProducts', () => {
  it('retorna até 10 registros vencidos/hoje/próximos ordenados', () => {
    const base = Array.from({ length: 12 }, (_, i) =>
      p({ id: String(i), name: `P${i}`, expiresAt: `2026-11-${String(13 + i).padStart(2, '0')}` }),
    );
    const products = withStatus(
      [p({ id: 'x', name: 'Vencido', expiresAt: '2026-11-10' }), ...base],
      TODAY,
      30,
    );
    const attention = attentionProducts(products);
    expect(attention.length).toBe(10);
    expect(attention[0]?.id).toBe('x');
  });

  it('não inclui produtos dentro da validade', () => {
    const products = withStatus(
      [p({ id: '1', name: 'Ok', expiresAt: '2026-12-10' })],
      TODAY,
      NEAR,
    );
    expect(attentionProducts(products)).toEqual([]);
  });
});

describe('groupByDate', () => {
  it('agrupa por expiresAt, ordena grupos por data e itens por nome', () => {
    const products = withStatus(
      [
        p({ id: '1', name: 'Biscoito', expiresAt: '2026-11-12' }),
        p({ id: '2', name: 'Arroz', expiresAt: '2026-11-12' }),
        p({ id: '3', name: 'Feijão', expiresAt: '2026-11-10' }),
      ],
      TODAY,
      NEAR,
    );
    const groups = groupByDate(products);
    expect(groups.map((g) => g.key)).toEqual(['2026-11-10', '2026-11-12']);
    expect(groups[1]?.items.map((i) => i.name)).toEqual(['Arroz', 'Biscoito']);
  });
});

describe('groupByName', () => {
  it('agrupa por nome normalizado (acentos/espaços externos/caixa) sem fuzzy', () => {
    const products = withStatus(
      [
        p({ id: '1', name: 'Leite Integral', expiresAt: '2026-11-20' }),
        p({ id: '2', name: '  léite integral ', expiresAt: '2026-11-15' }),
        p({ id: '3', name: 'Leite Desnatado', expiresAt: '2026-11-14' }),
      ],
      TODAY,
      NEAR,
    );
    const groups = groupByName(products);
    expect(groups).toHaveLength(2);
    const leite = groups.find((g) => g.key === 'leite integral');
    expect(leite?.items.map((i) => i.expiresAt)).toEqual(['2026-11-15', '2026-11-20']);
  });

  it('nome de exibição é o primeiro original em ordem alfabética', () => {
    const products = withStatus(
      [
        p({ id: '1', name: 'Água', expiresAt: '2026-11-20' }),
        p({ id: '2', name: 'agua', expiresAt: '2026-11-15' }),
      ],
      TODAY,
      NEAR,
    );
    const groups = groupByName(products);
    expect(groups[0]?.displayName).toBe('agua');
  });

  it('ordena grupos pela menor validade e depois por nome normalizado', () => {
    const products = withStatus(
      [
        p({ id: '1', name: 'Banana', expiresAt: '2026-11-20' }),
        p({ id: '2', name: 'Arroz', expiresAt: '2026-11-20' }),
        p({ id: '3', name: 'Café', expiresAt: '2026-11-10' }),
      ],
      TODAY,
      NEAR,
    );
    const groups = groupByName(products);
    expect(groups.map((g) => g.displayName)).toEqual(['Café', 'Arroz', 'Banana']);
  });

  it('não agrupa nomes diferentes por EAN/marca', () => {
    const products = withStatus(
      [
        p({ id: '1', name: 'Leite A', expiresAt: '2026-11-20', ean: '7890000000000' }),
        p({ id: '2', name: 'Leite B', expiresAt: '2026-11-20', ean: '7890000000000' }),
      ],
      TODAY,
      NEAR,
    );
    expect(groupByName(products)).toHaveLength(2);
  });
});
