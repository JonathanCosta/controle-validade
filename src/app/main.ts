/**
 * Inicialização da aplicação: shell, roteamento por hash e telas.
 */

import './pwa-placeholder.ts';

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';

import { appState } from './state.ts';
import { parseRoute, routeToHash, ROUTES } from './navigation.ts';
import { createAppShell } from '../components/app-shell.ts';
import { renderDashboard } from '../screens/dashboard/index.ts';
import { renderProducts } from '../screens/products/index.ts';
import { renderProductForm } from '../screens/product-form/index.ts';
import { renderReports } from '../screens/reports/index.ts';
import { renderSettings } from '../screens/settings/index.ts';
import type { RouteId } from './navigation.ts';

const SCREENS: Record<RouteId, (content: HTMLElement) => void> = {
  inicio: renderDashboard,
  produtos: renderProducts,
  novo: renderProductForm,
  relatorios: renderReports,
  configuracoes: renderSettings,
};

const ROUTE_HASHES = new Set(ROUTES.map(routeToHash));

const container = document.querySelector<HTMLDivElement>('#app');
if (!container) {
  throw new Error('Elemento raiz #app não encontrado.');
}

const shell = createAppShell((route, content) => {
  appState.currentRoute = route;
  SCREENS[route](content);
});

function applyRoute(): void {
  // Hash desconhecido: volta para #/inicio sem poluir o histórico (§3.5).
  if (window.location.hash && !ROUTE_HASHES.has(window.location.hash)) {
    window.location.replace(routeToHash('inicio'));
    return;
  }
  const route = parseRoute(window.location.hash);
  shell.setRoute(route);
  appState.currentRoute = route;
  window.scrollTo({ top: 0 });
}

window.addEventListener('hashchange', applyRoute);
container.appendChild(shell.root);

// Rota inicial: sem hash, define #/inicio sem poluir o histórico de forma estranha.
if (!window.location.hash) {
  window.location.replace(routeToHash('inicio'));
}
applyRoute();
