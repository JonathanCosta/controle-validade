/**
 * Tela Produtos (fundação). Busca, filtro, agrupamento e exclusão chegam na Etapa 5.
 */

import { createPageHeader } from '../../components/page-header.ts';

export function renderProducts(content: HTMLElement): void {
  const header = createPageHeader({
    title: 'Produtos',
    description: 'Todos os registros cadastrados.',
  });
  content.appendChild(header);

  const stub = document.createElement('div');
  stub.className = 'screen-stub';
  stub.textContent = 'A listagem completa será implementada na Etapa 5.';
  content.appendChild(stub);
}
