/**
 * Estado global mínimo da aplicação.
 * Nenhuma regra de validade é armazenada aqui: status é sempre calculado.
 */

import type { RouteId } from './navigation.ts';

export interface AppState {
  currentRoute: RouteId;
}

export const appState: AppState = {
  currentRoute: 'inicio',
};
