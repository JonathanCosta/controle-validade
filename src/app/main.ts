/**
 * Inicialização da aplicação: serviços, shell, roteamento por hash e telas.
 */

import './pwa-placeholder.ts';

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';

import { appState } from './state.ts';
import { initServices } from './context.ts';
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

/** Estado de erro ao abrir o banco: mensagem clara e tentar novamente (§8.5). */
function renderDatabaseError(root: HTMLElement): void {
  root.replaceChildren();
  const box = document.createElement('div');
  box.className = 'db-error';

  const title = document.createElement('h1');
  title.className = 'page-header__title';
  title.textContent = 'Não foi possível abrir os dados';

  const message = document.createElement('p');
  message.className = 'page-header__description';
  message.textContent =
    'Ocorreu um problema ao acessar o armazenamento local. Nenhum dado foi perdido. Você pode tentar novamente.';

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'button button--primary';
  retry.textContent = 'Tentar novamente';
  retry.addEventListener('click', () => {
    window.location.reload();
  });

  box.append(title, message, retry);
  root.appendChild(box);
}

async function bootstrap(root: HTMLElement): Promise<void> {
  try {
    await initServices();
  } catch (error) {
    console.error('Falha ao inicializar o armazenamento local.', error);
    renderDatabaseError(root);
    return;
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
  root.appendChild(shell.root);

  // Rota inicial: sem hash, substitui por #/inicio; o hashchange dispara
  // applyRoute. Com hash, aplica diretamente (evita dupla renderização).
  if (!window.location.hash) {
    window.location.replace(routeToHash('inicio'));
  } else {
    applyRoute();
  }
}

void bootstrap(container);
