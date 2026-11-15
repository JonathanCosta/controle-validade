/**
 * Repositório de configurações (ESPECIFICACAO §4.4).
 * `get()` retorna os padrões quando a configuração ainda não existe.
 * Configurações são mutáveis; `put()` é permitido nesta Object Store.
 */

import { sanitizeSettings, type AppSettings } from '../domain/settings.ts';
import type { AppDatabase, SettingsRecord } from './db.ts';

export interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}

export function createSettingsRepository(db: AppDatabase): SettingsRepository {
  return {
    async get(): Promise<AppSettings> {
      const record = await db.get('settings', 'app');
      return sanitizeSettings(record?.value);
    },
    async save(settings: AppSettings): Promise<void> {
      const record: SettingsRecord = { key: 'app', value: settings };
      await db.put('settings', record);
    },
  };
}
