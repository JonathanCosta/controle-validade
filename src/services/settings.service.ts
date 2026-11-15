/**
 * Serviço de configurações: leitura sanitizada e gravação (ESPECIFICACAO §11).
 * Alterar configurações nunca altera registros de produtos.
 */

import type { AppSettings } from '../domain/settings.ts';
import type { SettingsRepository } from '../database/settings.repository.ts';

export class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  async getSettings(): Promise<AppSettings> {
    return this.repository.get();
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.repository.save(settings);
  }
}
