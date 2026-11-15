import { describe, expect, it } from 'vitest';

import {
  backupFileName,
  buildBackupFile,
  parseBackupJson,
  sortProductsForExport,
  validateBackup,
} from '../../src/domain/backup.ts';
import { DEFAULT_SETTINGS } from '../../src/domain/settings.ts';
import type { Product } from '../../src/domain/product.ts';

function p(id: string, name: string, expiresAt: string): Product {
  return { id, name, expiresAt, ean: null, brand: null };
}

const VALID_PRODUCT = {
  id: 'a91f28a0-0c81-4a91-9ac3-44b1fb2c7c20',
  name: 'Leite integral',
  expiresAt: '2026-11-15',
  ean: '7890000000000',
  brand: null,
};

const VALID_BACKUP = {
  schema: 'controle-validade-backup',
  version: 1,
  exportedAt: '2026-11-12T20:30:00.000Z',
  appVersion: '1.0.0',
  products: [VALID_PRODUCT],
  settings: { ...DEFAULT_SETTINGS },
};

describe('parseBackupJson/validateBackup', () => {
  it('aceita backup válido', () => {
    const result = parseBackupJson(JSON.stringify(VALID_BACKUP));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.backup.products).toHaveLength(1);
    }
  });

  it('rejeita JSON inválido', () => {
    expect(parseBackupJson('{não é json').ok).toBe(false);
  });

  it('rejeita schema ou versão não suportada', () => {
    expect(validateBackup({ ...VALID_BACKUP, schema: 'outro' }).ok).toBe(false);
    expect(validateBackup({ ...VALID_BACKUP, version: 2 }).ok).toBe(false);
  });

  it('rejeita produtos inválidos e IDs repetidos no arquivo', () => {
    expect(validateBackup({ ...VALID_BACKUP, products: 'x' }).ok).toBe(false);
    expect(
      validateBackup({ ...VALID_BACKUP, products: [{ ...VALID_PRODUCT, name: '' }] }).ok,
    ).toBe(false);
    expect(
      validateBackup({ ...VALID_BACKUP, products: [{ ...VALID_PRODUCT, expiresAt: '2026-02-30' }] }).ok,
    ).toBe(false);
    expect(
      validateBackup({ ...VALID_BACKUP, products: [{ ...VALID_PRODUCT, ean: '123' }] }).ok,
    ).toBe(false);
    expect(
      validateBackup({
        ...VALID_BACKUP,
        products: [VALID_PRODUCT, { ...VALID_PRODUCT, name: 'Outro' }],
      }).ok,
    ).toBe(false);
  });

  it('rejeita configurações inválidas', () => {
    expect(
      validateBackup({ ...VALID_BACKUP, settings: { ...DEFAULT_SETTINGS, nearExpiryDays: 0 } }).ok,
    ).toBe(false);
    expect(
      validateBackup({
        ...VALID_BACKUP,
        settings: { ...DEFAULT_SETTINGS, lookupUrlTemplate: 'http://x/{ean}' },
      }).ok,
    ).toBe(false);
    expect(
      validateBackup({
        ...VALID_BACKUP,
        settings: { ...DEFAULT_SETTINGS, groupingMode: 'invalido' },
      }).ok,
    ).toBe(false);
  });

  it('aceita campos extras desconhecidos', () => {
    const result = validateBackup({ ...VALID_BACKUP, extra: 'ok' });
    expect(result.ok).toBe(true);
  });
});

describe('buildBackupFile/sort/export', () => {
  it('ordena produtos por expiresAt, nome e ID', () => {
    const sorted = sortProductsForExport([
      p('2', 'B', '2026-11-12'),
      p('1', 'A', '2026-11-12'),
      p('3', 'C', '2026-11-10'),
    ]);
    expect(sorted.map((x) => x.id)).toEqual(['3', '1', '2']);
  });

  it('gera arquivo com schema, versão, produtos e configurações', () => {
    const file = buildBackupFile([p(VALID_PRODUCT.id, 'Leite', '2026-11-15')], DEFAULT_SETTINGS, new Date('2026-11-12T20:30:00.000Z'));
    expect(file.schema).toBe('controle-validade-backup');
    expect(file.version).toBe(1);
    expect(file.exportedAt).toBe('2026-11-12T20:30:00.000Z');
    expect(file.appVersion).toBe('1.0.0');
    expect(file.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('nome do arquivo inclui a data', () => {
    expect(backupFileName('2026-11-12')).toBe('controle-validade-backup-2026-11-12.json');
  });
});
