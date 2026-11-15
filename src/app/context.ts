/**
 * Contexto de serviços da aplicação (camada entre telas e persistência).
 * As telas NÃO acessam IndexedDB diretamente (ESPECIFICACAO §3.3).
 */

import { openAppDatabase, type AppDatabase } from '../database/db.ts';
import { createProductsRepository, type ProductsRepository } from '../database/products.repository.ts';
import { createSettingsRepository, type SettingsRepository } from '../database/settings.repository.ts';
import { ProductsService } from '../services/products.service.ts';

export interface AppContext {
  db: AppDatabase;
  productsRepository: ProductsRepository;
  settingsRepository: SettingsRepository;
  productsService: ProductsService;
}

/** Tipo exposto às telas: somente serviços, nunca acesso direto ao banco (§3.3). */
export interface ScreenContext {
  productsService: ProductsService;
}

let context: AppContext | null = null;

export async function initServices(): Promise<AppContext> {
  if (context) {
    return context;
  }
  const db = await openAppDatabase();
  const productsRepository = createProductsRepository(db);
  const settingsRepository = createSettingsRepository(db);
  context = {
    db,
    productsRepository,
    settingsRepository,
    productsService: new ProductsService(productsRepository),
  };
  return context;
}

export function getAppContext(): ScreenContext {
  if (!context) {
    throw new Error('Serviços não inicializados.');
  }
  const { productsService } = context;
  return { productsService };
}
