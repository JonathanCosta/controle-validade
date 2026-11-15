/**
 * Modelo de produto: uma ocorrência individual com uma validade.
 * Não existem quantidade, status, preço, criação/edição ou histórico
 * (ESPECIFICACAO §4.1, §6; AGENTS.md §2).
 */

import { isValidDateOnly } from './date.ts';
import { isValidEan } from './ean.ts';
import { ProductValidationError } from './errors.ts';

export interface Product {
  /** UUID gerado com crypto.randomUUID() em cada novo cadastro. */
  id: string;
  /** Obrigatório, com trim aplicado. */
  name: string;
  /** Data civil real em YYYY-MM-DD. */
  expiresAt: string;
  /** EAN-8/EAN-13 válido ou null. */
  ean: string | null;
  /** Marca opcional, null quando vazia. */
  brand: string | null;
}

export interface ProductInput {
  name: string;
  expiresAt: string;
  ean?: string | null;
  brand?: string | null;
}

/** Cria e valida um produto; `id` é gerado automaticamente quando ausente. */
export function createProduct(input: ProductInput, id?: string): Product {
  if (typeof input.name !== 'string') {
    throw new ProductValidationError('name', 'Informe o nome do produto.');
  }
  const name = input.name.trim();
  if (name === '') {
    throw new ProductValidationError('name', 'Informe o nome do produto.');
  }

  if (typeof input.expiresAt !== 'string' || !isValidDateOnly(input.expiresAt)) {
    throw new ProductValidationError('expiresAt', 'Informe uma data de validade real.');
  }

  let ean: string | null = null;
  if (input.ean !== null && input.ean !== undefined && input.ean !== '') {
    if (typeof input.ean !== 'string' || !isValidEan(input.ean)) {
      throw new ProductValidationError('ean', 'EAN inválido: informe um código EAN-8 ou EAN-13 válido.');
    }
    ean = input.ean;
  }

  let brand: string | null = null;
  if (input.brand !== null && input.brand !== undefined && input.brand !== '') {
    if (typeof input.brand !== 'string') {
      throw new ProductValidationError('brand', 'Marca inválida.');
    }
    brand = input.brand.trim() || null;
  }

  const productId = id ?? crypto.randomUUID();
  if (typeof productId !== 'string' || productId === '') {
    throw new ProductValidationError('id', 'Identificador do produto inválido.');
  }

  return {
    id: productId,
    name,
    expiresAt: input.expiresAt,
    ean,
    brand,
  };
}

/**
 * Normaliza um produto vindo de fonte não confiável (backup) para o formato
 * interno, mantendo o `id` informado. Validação completa é responsabilidade
 * do validador de backup (Etapa 7); aqui se valida tipos e conteúdo.
 */
export function normalizeProductRecord(candidate: unknown): Product | null {
  if (typeof candidate !== 'object' || candidate === null) {
    return null;
  }
  const record = candidate as Record<string, unknown>;
  if (
    typeof record['id'] !== 'string' ||
    typeof record['name'] !== 'string' ||
    typeof record['expiresAt'] !== 'string'
  ) {
    return null;
  }
  try {
    return createProduct(
      {
        name: record['name'],
        expiresAt: record['expiresAt'],
        ean: record['ean'] === undefined ? null : (record['ean'] as string | null),
        brand: record['brand'] === undefined ? null : (record['brand'] as string | null),
      },
      record['id'],
    );
  } catch {
    return null;
  }
}
