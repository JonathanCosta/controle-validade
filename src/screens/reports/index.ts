/**
 * Tela Relatórios (fundação). Filtro de intervalo e cópia chegam na Etapa 6.
 */

import { createPageHeader } from '../../components/page-header.ts';

export function renderReports(content: HTMLElement): void {
  const header = createPageHeader({
    title: 'Relatórios',
    description: 'Gere e copie o relatório de validades.',
  });
  content.appendChild(header);

  const stub = document.createElement('div');
  stub.className = 'screen-stub';
  stub.textContent = 'O relatório será implementado na Etapa 6.';
  content.appendChild(stub);
}
