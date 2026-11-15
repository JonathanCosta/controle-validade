/**
 * Tela de cadastro (fundação). Fluxo focado, sem navegação inferior.
 * Validações e salvamento chegam na Etapa 3; scanner na Etapa 4.
 */

import { createPageHeader } from '../../components/page-header.ts';

export function renderProductForm(content: HTMLElement): void {
  const header = createPageHeader({
    title: 'Adicionar produto',
    backTarget: '#/inicio',
    backLabel: 'Voltar',
  });
  content.appendChild(header);

  const stub = document.createElement('div');
  stub.className = 'screen-stub';
  stub.textContent = 'O formulário de cadastro será implementado na Etapa 3.';
  content.appendChild(stub);
}
