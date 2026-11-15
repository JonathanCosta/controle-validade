import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';

import { openAppDatabase, type AppDatabase } from '../../src/database/db.ts';
import { createSettingsRepository, type SettingsRepository } from '../../src/database/settings.repository.ts';
import { DEFAULT_SETTINGS, type AppSettings } from '../../src/domain/settings.ts';

let db: AppDatabase;
let repository: SettingsRepository;

beforeEach(async () => {
  db = await openAppDatabase();
  await db.clear('settings');
  repository = createSettingsRepository(db);
});

describe('SettingsRepository', () => {
  it('get() retorna os padrões quando não há configuração salva', async () => {
    expect(await repository.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('save() persiste e get() recupera a configuração', async () => {
    const settings: AppSettings = {
      nearExpiryDays: 30,
      lookupUrlTemplate: 'https://exemplo.com.br/ean/{ean}',
      groupingMode: 'name',
    };
    await repository.save(settings);
    expect(await repository.get()).toEqual(settings);
  });

  it('save() sobrescreve a configuração anterior', async () => {
    await repository.save({ ...DEFAULT_SETTINGS, nearExpiryDays: 7 });
    expect((await repository.get())['nearExpiryDays']).toBe(7);
    await repository.save({ ...DEFAULT_SETTINGS, nearExpiryDays: 15 });
    expect((await repository.get())['nearExpiryDays']).toBe(15);
  });

  it('get() aplica fallback por campo quando o registro está corrompido', async () => {
    // Registro hostil/corrompido gravado diretamente na Object Store.
    await db.put('settings', {
      key: 'app',
      value: {
        nearExpiryDays: -1,
        lookupUrlTemplate: 'http://mal-formada',
        groupingMode: 'estoque',
      } as unknown as AppSettings,
    });
    const result = await repository.get();
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('get() preserva campos válidos e corrige apenas os inválidos', async () => {
    await db.put('settings', {
      key: 'app',
      value: {
        nearExpiryDays: 30,
        lookupUrlTemplate: 'http://mal-formada',
        groupingMode: 'name',
      } as unknown as AppSettings,
    });
    const result = await repository.get();
    expect(result['nearExpiryDays']).toBe(30);
    expect(result['groupingMode']).toBe('name');
    expect(result['lookupUrlTemplate']).toBe(DEFAULT_SETTINGS['lookupUrlTemplate']);
  });
});
