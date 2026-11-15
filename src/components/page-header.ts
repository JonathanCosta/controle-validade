/**
 * Fábrica de cabeçalho de tela (DESIGN_SYSTEM.md §7.1).
 */

import { createIcon, type IconName } from '../components/icons.ts';

export interface PageHeaderOptions {
  title: string;
  description?: string;
  backTarget?: string;
  backLabel?: string;
}

export function createPageHeader(options: PageHeaderOptions): HTMLElement {
  const header = document.createElement('header');
  header.className = 'page-header';

  if (options.backTarget) {
    const back = document.createElement('a');
    back.className = 'page-header__back';
    back.href = options.backTarget;
    back.setAttribute('aria-label', options.backLabel ?? 'Voltar');
    back.appendChild(createIcon('back' satisfies IconName));
    header.appendChild(back);
  }

  const title = document.createElement('h1');
  title.className = 'page-header__title';
  title.textContent = options.title;
  header.appendChild(title);

  if (options.description) {
    const description = document.createElement('p');
    description.className = 'page-header__description';
    description.textContent = options.description;
    header.appendChild(description);
  }

  return header;
}
