/**
 * App shell: container de tela e navegação inferior fixa.
 * Fluxos focados (#/novo) escondem a navegação inferior (DESIGN_SYSTEM.md §6.4).
 */

import { renderIcon, type IconName } from '../assets/icons/index.ts';
import { navigate, routeToHash, type RouteId } from '../app/navigation.ts';

export interface NavItem {
  route: RouteId;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: readonly NavItem[] = [
  { route: 'inicio', label: 'Início', icon: 'home' },
  { route: 'produtos', label: 'Produtos', icon: 'products' },
  { route: 'relatorios', label: 'Relatórios', icon: 'reports' },
  { route: 'configuracoes', label: 'Configurações', icon: 'settings' },
];

export interface AppShell {
  root: HTMLElement;
  content: HTMLElement;
  setRoute(route: RouteId): void;
}

export type ScreenRenderer = (route: RouteId, content: HTMLElement) => void | Promise<void>;

/** Constrói o shell uma única vez; `setRoute` atualiza conteúdo e nav. */
export function createAppShell(renderScreen: ScreenRenderer): AppShell {
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
  fab.appendChild(renderIcon('plus'));
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
    link.appendChild(renderIcon(item.icon));
    const label = document.createElement('span');
    label.textContent = item.label;
    link.appendChild(label);
    nav.appendChild(link);
  }

  root.appendChild(content);
  root.appendChild(nav);

  let renderToken = 0;

  function setRoute(route: RouteId): void {
    renderToken += 1;
    const token = renderToken;
    content.replaceChildren();
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

    void Promise.resolve(renderScreen(route, content)).catch((error) => {
      if (token !== renderToken) {
        return;
      }
      console.error('Falha ao renderizar a tela.', error);
      content.replaceChildren();
      const box = document.createElement('div');
      box.className = 'screen-stub';
      const msg = document.createElement('p');
      msg.textContent = 'Não foi possível carregar esta tela. Tente novamente.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'button button--secondary';
      retry.textContent = 'Tentar novamente';
      retry.addEventListener('click', () => {
        setRoute(route);
      });
      box.append(msg, retry);
      content.appendChild(box);
    });
  }

  return { root, content, setRoute };
}
