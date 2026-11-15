/**
 * Tela Configurações (fundação). Preferências e backup chegam na Etapa 7.
 */

import { createPageHeader } from '../../components/page-header.ts';

export function renderSettings(content: HTMLElement): void {
  const header = createPageHeader({
    title: 'Configurações',
    description: 'Preferências do aplicativo e segurança dos dados.',
  });
  content.appendChild(header);

  const stub = document.createElement('div');
  stub.className = 'screen-stub';
  stub.textContent = 'As configurações serão implementadas na Etapa 7.';
  content.appendChild(stub);
}
