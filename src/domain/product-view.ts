/**
 * Modelo de apresentação: produto com status calculado dinamicamente.
 * O status nunca é persistido (ESPECIFICACAO §4.1, §5.3).
 */

import type { Product } from './product.ts';
import { getValidityStatus, type ValidityStatus } from './validity.ts';
import { compareNormalizedName, normalizeSearch } from './search.ts';

export interface ProductWithStatus extends Product {
  status: ValidityStatus;
}

export type StatusFilter = ValidityStatus | 'all';

export function withStatus(
  products: readonly Product[],
  today: string,
  nearExpiryDays: number,
): ProductWithStatus[] {
  return products.map((product) => ({
    ...product,
    status: getValidityStatus(product.expiresAt, today, nearExpiryDays),
  }));
}

/** Ordenação padrão: validade crescente, nome normalizado, depois ID (§9.5). */
export function compareProducts(a: ProductWithStatus, b: ProductWithStatus): number {
  if (a.expiresAt !== b.expiresAt) {
    return a.expiresAt.localeCompare(b.expiresAt);
  }
  const byName = compareNormalizedName(a.name, b.name);
  if (byName !== 0) {
    return byName;
  }
  return a.id.localeCompare(b.id);
}

export function sortProducts(products: readonly ProductWithStatus[]): ProductWithStatus[] {
  return [...products].sort(compareProducts);
}

export interface ListFilters {
  query: string;
  status: StatusFilter;
}

/** Busca por trecho do nome (caixa/acentos ignorados) combinada com filtro de status (§9.2-§9.3). */
export function filterProducts(
  products: readonly ProductWithStatus[],
  filters: ListFilters,
): ProductWithStatus[] {
  const needle = normalizeSearch(filters.query);
  return products.filter((product) => {
    if (filters.status !== 'all' && product.status !== filters.status) {
      return false;
    }
    if (needle !== '' && !normalizeSearch(product.name).includes(needle)) {
      return false;
    }
    return true;
  });
}

export interface StatusCounts {
  expired: number;
  today: number;
  upcoming: number;
  valid: number;
  total: number;
}

export function countByStatus(products: readonly ProductWithStatus[]): StatusCounts {
  const counts: StatusCounts = { expired: 0, today: 0, upcoming: 0, valid: 0, total: 0 };
  for (const product of products) {
    counts[product.status] += 1;
    counts.total += 1;
  }
  return counts;
}

/** Até 10 registros que exigem atenção (vencido, hoje ou próximo), §8.3. */
export function attentionProducts(products: readonly ProductWithStatus[]): ProductWithStatus[] {
  return sortProducts(
    products.filter(
      (product) =>
        product.status === 'expired' ||
        product.status === 'today' ||
        product.status === 'upcoming',
    ),
  ).slice(0, 10);
}

/** Grupos por data de validade, §9.4. */
export interface DateGroup {
  kind: 'date';
  key: string; // YYYY-MM-DD
  items: ProductWithStatus[];
}

export function groupByDate(products: readonly ProductWithStatus[]): DateGroup[] {
  const map = new Map<string, ProductWithStatus[]>();
  for (const product of sortProducts(products)) {
    const existing = map.get(product.expiresAt);
    if (existing) {
      existing.push(product);
    } else {
      map.set(product.expiresAt, [product]);
    }
  }
  const groups: DateGroup[] = [];
  for (const [key, items] of map.entries()) {
    // Dentro do grupo, ordenar por nome (§9.4).
    items.sort((a, b) => {
      const byName = compareNormalizedName(a.name, b.name);
      return byName !== 0 ? byName : a.id.localeCompare(b.id);
    });
    groups.push({ kind: 'date', key, items });
  }
  groups.sort((a, b) => a.key.localeCompare(b.key));
  return groups;
}

/** Grupos por nome normalizado, §9.4. */
export interface NameGroup {
  kind: 'name';
  key: string; // nome normalizado
  displayName: string;
  items: ProductWithStatus[];
}

export function groupByName(products: readonly ProductWithStatus[]): NameGroup[] {
  const map = new Map<string, ProductWithStatus[]>();
  for (const product of products) {
    const key = normalizeSearch(product.name);
    const existing = map.get(key);
    if (existing) {
      existing.push(product);
    } else {
      map.set(key, [product]);
    }
  }
  const groups: NameGroup[] = [];
  for (const [key, items] of map.entries()) {
    // Ocorrências ordenadas por validade crescente (§9.4).
    items.sort((a, b) => {
      if (a.expiresAt !== b.expiresAt) {
        return a.expiresAt.localeCompare(b.expiresAt);
      }
      const byName = compareNormalizedName(a.name, b.name);
      return byName !== 0 ? byName : a.id.localeCompare(b.id);
    });
    // Nome de exibição: primeiro nome original em ordem alfabética dentro do grupo.
    const displayName = [...items]
      .map((item) => item.name)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))[0] ?? items[0]?.name ?? key;
    groups.push({ kind: 'name', key, displayName, items });
  }
  groups.sort((a, b) => {
    const minA = a.items[0]?.expiresAt ?? '';
    const minB = b.items[0]?.expiresAt ?? '';
    if (minA !== minB) {
      return minA.localeCompare(minB);
    }
    return compareNormalizedName(a.displayName, b.displayName);
  });
  return groups;
}

export type ProductGroup = DateGroup | NameGroup;
