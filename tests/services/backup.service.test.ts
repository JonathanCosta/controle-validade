import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { openAppDatabase, type AppDatabase } from '../../src/database/db.ts';
import { createProductsRepository } from '../../src/database/products.repository.ts';
import { createSettingsRepository } from '../../src/database/settings.repository.ts';
import { BackupService } from '../../src/services/backup.service.ts';
import { createProduct } from '../../src/domain/product.ts';
import { DEFAULT_SETTINGS, type AppSettings } from '../../src/domain/settings.ts';
import type { BackupFileV1 } from '../../src/domain/backup.ts';

let db: AppDatabase;
let service: BackupService;

beforeEach(async () => {
  db = await openAppDatabase();
  await db.clear('products');
  await db.clear('settings');
  service = new BackupService(db, createProductsRepository(db), createSettingsRepository(db));
});

function backup(products: Array<ReturnType<typeof createProduct>>, settings: AppSettings = DEFAULT_SETTINGS): BackupFileV1 {
  return {
    schema: 'controle-validade-backup',
    version: 1,
    exportedAt: '2026-11-12T20:30:00.000Z',
    appVersion: '1.0.0',
    products,
    settings,
  };
}

describe('BackupService.replace', () => {
  it('substitui produtos e restaura configurações do arquivo', async () => {
    const old = createProduct({ name: 'Antigo', expiresAt: '2026-01-01' });
    await db.add('products', old);
    await createSettingsRepository(db).save({ ...DEFAULT_SETTINGS, nearExpiryDays: 7 });

    const imported = createProduct({ name: 'Novo', expiresAt: '2026-12-01' });
    const importedSettings: AppSettings = {
      nearExpiryDays: 30,
      lookupUrlTemplate: 'https://exemplo.com.br/ean/{ean}',
      groupingMode: 'name',
    };
    await service.replace(backup([imported], importedSettings));

    expect(await db.getAll('products')).toEqual([imported]);
    expect((await createSettingsRepository(db).get())).toEqual(importedSettings);
  });

  it('substituição com produtos vazios deixa a lista sem produtos', async () => {
    await db.add('products', createProduct({ name: 'A', expiresAt: '2026-01-01' }));
    await service.replace(backup([], DEFAULT_SETTINGS));
    expect(await db.getAll('products')).toEqual([]);
  });
});

describe('BackupService.merge', () => {
  it('adiciona IDs novos e ignora IDs existentes sem sobrescrever', async () => {
    const existing = createProduct({ name: 'Existente', expiresAt: '2026-11-10' });
    await db.add('products', existing);

    const importedNew = createProduct({ name: 'Novo', expiresAt: '2026-11-20' });
    const importedSameId = { ...existing, name: 'Sobrescrito indevidamente' };

    const summary = await service.merge(backup([importedNew, importedSameId]));
    expect(summary).toEqual({ added: 1, ignored: 1 });

    const all = await db.getAll('products');
    expect(all).toHaveLength(2);
    expect(all.find((p) => p.id === existing.id)?.name).toBe('Existente');
    expect(all.find((p) => p.id === importedNew.id)?.name).toBe('Novo');
  });

  it('não altera as configurações atuais', async () => {
    const current: AppSettings = { ...DEFAULT_SETTINGS, nearExpiryDays: 7, groupingMode: 'name' };
    await createSettingsRepository(db).save(current);

    await service.merge(
      backup([createProduct({ name: 'X', expiresAt: '2026-11-20' })], {
        ...DEFAULT_SETTINGS,
        nearExpiryDays: 30,
        groupingMode: 'date',
      }),
    );

    expect(await createSettingsRepository(db).get()).toEqual(current);
  });

  it('não deduplica por nome/EAN/data: IDs diferentes são registros distintos', async () => {
    const a = createProduct({ name: 'Leite', expiresAt: '2026-11-20', ean: '7890000000000' });
    const b = createProduct({ name: 'Leite', expiresAt: '2026-11-20', ean: '7890000000000' });
    const summary = await service.merge(backup([a, b]));
    expect(summary).toEqual({ added: 2, ignored: 0 });
    expect(await db.getAll('products')).toHaveLength(2);
  });

  it('mesclagem é idempotente por UUID', async () => {
    const imported = createProduct({ name: 'Leite', expiresAt: '2026-11-20' });
    const file = backup([imported]);
    expect(await service.merge(file)).toEqual({ added: 1, ignored: 0 });
    expect(await service.merge(file)).toEqual({ added: 0, ignored: 1 });
    expect(await db.getAll('products')).toHaveLength(1);
  });
});
