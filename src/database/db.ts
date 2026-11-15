/**
 * Abertura do banco IndexedDB `controle-validade`, versão 1 (ESPECIFICACAO §4.3).
 * Toda mudança futura de esquema incrementa DB_VERSION com migração no upgrade;
 * nunca apagar o banco inteiro (dados dos usuários são preservados).
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Product } from '../domain/product.ts';
import type { AppSettings } from '../domain/settings.ts';

export const DB_NAME = 'controle-validade';
export const DB_VERSION = 1;

export interface SettingsRecord {
  key: 'app';
  value: AppSettings;
}

interface DatabaseSchema extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: {
      expiresAt: string;
      ean: string;
    };
  };
  settings: {
    key: string;
    value: SettingsRecord;
  };
}

export type AppDatabase = IDBPDatabase<DatabaseSchema>;

export async function openAppDatabase(): Promise<AppDatabase> {
  return openDB<DatabaseSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('products')) {
        const products = db.createObjectStore('products', { keyPath: 'id' });
        // Índices não únicos: EAN repetido e datas repetidas são permitidos.
        products.createIndex('expiresAt', 'expiresAt', { unique: false });
        products.createIndex('ean', 'ean', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}
