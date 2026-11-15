/**
 * App shell: container de tela e navegação inferior fixa.
 * Fluxos focados (#/novo) escondem a navegação inferior (DESIGN_SYSTEM.md §6.4).
 */

import { createIcon } from './icons.ts';
import { navigate, routeToHash, type RouteId } from '../app/navigation.ts';

export interface NavItem {
  route: RouteId;
  label: string;
  icon: Parameters<typeof createIcon>[0];
}

const NAV_ITEMS: readonly NavItem[] = [
  { route: 'inicio', label: 'Início', icon: 'home' },
  { route: 'produtos', label: 'Produtos', icon: 'list' },
  { route: 'relatorios', label: 'Relatórios', icon: 'report' },
  { route: 'configuracoes', label: 'Configurações', icon: 'settings' },
];

export interface AppShell {
  root: HTMLElement;
  content: HTMLElement;
  setRoute(route: RouteId): void;
}

/** Constrói o shell uma única vez; `setRoute` atualiza conteúdo e nav. */
export function createAppShell(renderScreen: (route: RouteId, content: HTMLElement) => void): AppShell {
  const root = document.createElement('div');
  root.className = 'app-shell';

  const content = document.createElement('main');
  content.className = 'app-content';
  content.id = 'screen';

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Navegação principal');

  const items = [...NAV_ITEMS.slice(0, 2), null, ...NAV_ITEMS.slice(2)] as (NavItem | null)[];

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'bottom-nav__fab';
  fab.setAttribute('aria-label', 'Adicionar produto');
  fab.appendChild(createIcon('plus'));
  fab.addEventListener('click', () => navigate('novo'));

  for (const item of items) {
    if (item === null) {
      nav.appendChild(fab);
      continue;
    }
    const link = document.createElement('a');
    link.className = 'bottom-nav__link';
    link.href = routeToHash(item.route);
    link.dataset.route = item.route;
    link.appendChild(createIcon(item.icon));
    const label = document.createElement('span');
    label.textContent = item.label;
    link.appendChild(label);
    nav.appendChild(link);
  }

  root.appendChild(content);
  root.appendChild(nav);

  function setRoute(route: RouteId): void {
    content.replaceChildren();
    renderScreen(route, content);
    const focused = route === 'novo';
    root.classList.toggle('no-nav', focused);
    for (const link of nav.querySelectorAll<HTMLAnchorElement>('.bottom-nav__link')) {
      const isActive = link.dataset.route === route;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  return { root, content, setRoute };
}
