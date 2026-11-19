/**
 * Validação e estrutura do backup JSON v1 (ESPECIFICACAO §12).
 * Todo arquivo é tratado como entrada não confiável.
 */

import { isValidDateOnly } from './date.ts';
import { isValidEan } from './ean.ts';
import { isValidNearExpiryDays, isGroupingMode, validateLookupUrlTemplate, type AppSettings } from './settings.ts';
import type { Product } from './product.ts';

export const BACKUP_SCHEMA = 'controle-validade-backup';
export const BACKUP_VERSION = 1;
export const APP_VERSION = '1.0.0';

/**
 * Limite total do arquivo de backup (25 MB). O limite por produto já existe;
 * este protege a memória do dispositivo contra arquivos arbitrariamente grandes
 * antes do parse (AGENTS.md §9). Um backup com o máximo de 50.000 produtos
 * permanece abaixo deste teto.
 */
export const MAX_BACKUP_FILE_BYTES = 25 * 1024 * 1024;

export interface BackupFileV1 {
  schema: typeof BACKUP_SCHEMA;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  appVersion: string;
  products: Product[];
  settings: AppSettings;
}

export type BackupValidation =
  | { ok: true; backup: BackupFileV1 }
  | { ok: false; message: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  // UUID canônico (v4 ou outro formato RFC4122).
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validateProductRecord(value: unknown, index: number): { ok: true; product: Product } | { ok: false } {
  if (!isPlainObject(value)) {
    return { ok: false };
  }
  const record = value as Record<string, unknown>;
  if (!isUuid(record['id'])) {
    return { ok: false };
  }
  if (typeof record['name'] !== 'string' || record['name'].trim() === '') {
    return { ok: false };
  }
  if (typeof record['expiresAt'] !== 'string' || !isValidDateOnly(record['expiresAt'])) {
    return { ok: false };
  }
  let ean: string | null = null;
  if (record['ean'] === null) {
    ean = null;
  } else if (typeof record['ean'] === 'string') {
    if (!isValidEan(record['ean'])) {
      return { ok: false };
    }
    ean = record['ean'];
  } else {
    return { ok: false };
  }
  let brand: string | null = null;
  if (record['brand'] === null || record['brand'] === undefined) {
    brand = null;
  } else if (typeof record['brand'] === 'string') {
    brand = record['brand'];
  } else {
    return { ok: false };
  }
  // Limites razoáveis para evitar inchaço por backup malicioso.
  if (record['name'].trim().length > 200) {
    return { ok: false };
  }
  if (brand !== null && brand.length > 100) {
    return { ok: false };
  }
  void index;
  return {
    ok: true,
    product: {
      id: record['id'] as string,
      name: record['name'].trim(),
      expiresAt: record['expiresAt'] as string,
      ean,
      brand,
    },
  };
}

function validateSettingsRecord(value: unknown): AppSettings | null {
  if (!isPlainObject(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (!isValidNearExpiryDays(record['nearExpiryDays'])) {
    return null;
  }
  if (!isGroupingMode(record['groupingMode'])) {
    return null;
  }
  const urlValidation = validateLookupUrlTemplate(record['lookupUrlTemplate']);
  if (!urlValidation.ok || typeof record['lookupUrlTemplate'] !== 'string') {
    return null;
  }
  return {
    nearExpiryDays: record['nearExpiryDays'],
    lookupUrlTemplate: record['lookupUrlTemplate'].trim(),
    groupingMode: record['groupingMode'],
  };
}

export function parseBackupJson(text: string): BackupValidation {
  if (text.length > MAX_BACKUP_FILE_BYTES) {
    return { ok: false, message: 'Arquivo de backup inválido: tamanho acima do limite.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, message: 'Arquivo de backup inválido: não é um JSON válido.' };
  }
  return validateBackup(parsed);
}

export function validateBackup(value: unknown): BackupValidation {
  if (!isPlainObject(value)) {
    return { ok: false, message: 'Arquivo de backup inválido.' };
  }
  const obj = value as Record<string, unknown>;
  if (obj['schema'] !== BACKUP_SCHEMA) {
    return { ok: false, message: 'Arquivo não é um backup do Controle de Validade.' };
  }
  if (obj['version'] !== BACKUP_VERSION) {
    return { ok: false, message: 'Versão de backup não suportada.' };
  }
  if (!Array.isArray(obj['products'])) {
    return { ok: false, message: 'Backup inválido: lista de produtos ausente ou incorreta.' };
  }
  if (obj['products'].length > 50000) {
    return { ok: false, message: 'Backup inválido: quantidade de produtos acima do limite.' };
  }

  const ids = new Set<string>();
  const products: Product[] = [];
  for (let i = 0; i < obj['products'].length; i++) {
    const validated = validateProductRecord(obj['products'][i], i);
    if (!validated.ok) {
      return { ok: false, message: 'Backup inválido: há produtos com dados incorretos.' };
    }
    if (ids.has(validated.product.id)) {
      return { ok: false, message: 'Backup inválido: há IDs repetidos no arquivo.' };
    }
    ids.add(validated.product.id);
    products.push(validated.product);
  }

  const settings = validateSettingsRecord(obj['settings']);
  if (!settings) {
    return { ok: false, message: 'Backup inválido: configurações incorretas.' };
  }

  const exportedAt = typeof obj['exportedAt'] === 'string' ? obj['exportedAt'] : '';
  const appVersion = typeof obj['appVersion'] === 'string' ? obj['appVersion'] : APP_VERSION;

  return {
    ok: true,
    backup: {
      schema: BACKUP_SCHEMA,
      version: BACKUP_VERSION,
      exportedAt,
      appVersion,
      products,
      settings,
    },
  };
}

export function sortProductsForExport(products: readonly Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.expiresAt !== b.expiresAt) {
      return a.expiresAt.localeCompare(b.expiresAt);
    }
    if (a.name !== b.name) {
      return a.name.localeCompare(b.name, 'pt-BR');
    }
    return a.id.localeCompare(b.id);
  });
}

export function buildBackupFile(products: readonly Product[], settings: AppSettings, now: Date): BackupFileV1 {
  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    appVersion: APP_VERSION,
    products: sortProductsForExport(products),
    settings,
  };
}

export function backupFileName(todayIso: string): string {
  return `controle-validade-backup-${todayIso}.json`;
}
