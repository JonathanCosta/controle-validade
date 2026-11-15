/**
 * Tela Início (fundação). Indicadores e lista serão implementados na Etapa 5.
 */

import { createPageHeader } from '../../components/page-header.ts';

export function renderDashboard(content: HTMLElement): void {
  const header = createPageHeader({
    title: 'Validades',
    description: 'Acompanhe o que venceu e o que está próximo do vencimento.',
  });
  content.appendChild(header);

  const stub = document.createElement('div');
  stub.className = 'screen-stub';
  stub.textContent = 'A visão geral será preenchida quando o cadastro estiver pronto (Etapa 5).';
  content.appendChild(stub);
}
