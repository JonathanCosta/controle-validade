/**
 * Serviço de backup: exportação e importação atômica (ESPECIFICACAO §12).
 */

import type { AppDatabase } from '../database/db.ts';
import type { ProductsRepository } from '../database/products.repository.ts';
import type { SettingsRepository } from '../database/settings.repository.ts';
import type { Product } from '../domain/product.ts';
import type { AppSettings } from '../domain/settings.ts';
import {
  backupFileName,
  buildBackupFile,
  parseBackupJson,
  type BackupFileV1,
  type BackupValidation,
} from '../domain/backup.ts';

export interface MergeSummary {
  added: number;
  ignored: number;
}

export class BackupService {
  constructor(
    private readonly db: AppDatabase,
    private readonly productsRepository: ProductsRepository,
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async exportBackup(todayIso: string): Promise<void> {
    const [products, settings] = await Promise.all([
      this.productsRepository.getAll(),
      this.settingsRepository.get(),
    ]);
    const backup = buildBackupFile(products, settings, new Date());
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = backupFileName(todayIso);
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  validate(text: string): BackupValidation {
    return parseBackupJson(text);
  }

  /**
   * Substituição atômica: limpa produtos, insere os importados e restaura
   * configurações do arquivo na mesma transação (§12.4, §12.5).
   */
  async replace(backup: BackupFileV1): Promise<void> {
    const tx = this.db.transaction(['products', 'settings'], 'readwrite');
    const productsStore = tx.objectStore('products');
    const settingsStore = tx.objectStore('settings');
    await productsStore.clear();
    for (const product of backup.products) {
      await productsStore.add(product);
    }
    await settingsStore.put({ key: 'app', value: backup.settings });
    await tx.done;
  }

  /**
   * Mesclagem atômica: insere apenas IDs inexistentes; configurações atuais
   * permanecem inalteradas (§12.4, §12.5).
   */
  async merge(backup: BackupFileV1): Promise<MergeSummary> {
    let added = 0;
    let ignored = 0;
    const tx = this.db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    for (const product of backup.products) {
      const existing = await store.get(product.id);
      if (existing) {
        ignored += 1;
      } else {
        await store.add(product);
        added += 1;
      }
    }
    await tx.done;
    return { added, ignored };
  }
}

export type { BackupFileV1 } from '../domain/backup.ts';
export type { Product, AppSettings };
