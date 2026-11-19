/**
 * Tela Início: indicadores, vencimentos mais próximos e acesso rápido ao cadastro
 * (ESPECIFICACAO §8, DESIGN_SYSTEM §8.1).
 */

import { createPageHeader } from '../../components/page-header.ts';
import { createBrandSymbol } from '../../components/brand.ts';
import { createEmptyState } from '../../components/empty-state.ts';
import { createStatusBadge } from '../../components/status-badge.ts';
import { getAppContext } from '../../app/context.ts';
import { getLocalToday, formatDateBR } from '../../domain/date.ts';
import {
  attentionProducts,
  countByStatus,
  withStatus,
  type ProductWithStatus,
  type StatusCounts,
} from '../../domain/product-view.ts';
import { navigate } from '../../app/navigation.ts';

export async function renderDashboard(content: HTMLElement): Promise<void> {
  const header = createPageHeader({
    title: 'Validades',
    description: 'Acompanhe o que venceu e o que está próximo do vencimento.',
  });
  header.prepend(createBrandSymbol({ className: 'page-header__brand' }));
  content.appendChild(header);

  const loading = document.createElement('div');
  loading.className = 'screen-stub';
  loading.textContent = 'Carregando…';
  content.appendChild(loading);

  try {
    const { productsService, settingsService } = getAppContext();
    const [products, settings] = await Promise.all([
      productsService.getAllProducts(),
      settingsService.getSettings(),
    ]);
    if (!content.isConnected) {
      return;
    }
    const today = getLocalToday();
    const annotated = withStatus(products, today, settings.nearExpiryDays);
    const counts = countByStatus(annotated);
    content.replaceChildren(header);
    renderDashboardContent(content, counts, annotated);
  } catch {
    if (!content.isConnected) {
      return;
    }
    content.replaceChildren(header);
    const error = document.createElement('div');
    error.className = 'screen-stub';
    const message = document.createElement('p');
    message.textContent = 'Não foi possível ler os dados. Tente novamente.';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'button button--secondary';
    retry.textContent = 'Tentar novamente';
    retry.addEventListener('click', () => {
      void renderDashboard(content);
    });
    error.append(message, retry);
    content.appendChild(error);
  }
}

function renderDashboardContent(
  content: HTMLElement,
  counts: StatusCounts,
  products: readonly ProductWithStatus[],
): void {
  if (counts.total === 0) {
    content.appendChild(
      createEmptyState({
        title: 'Nenhum produto cadastrado',
        description: 'Adicione um produto para começar a acompanhar as validades.',
        actionLabel: 'Adicionar produto',
        onAction: () => navigate('novo'),
      }),
    );
    return;
  }

  content.appendChild(renderIndicators(counts));

  const section = document.createElement('section');
  section.className = 'page-section';
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'section-header';
  const title = document.createElement('h2');
  title.className = 'page-section__title';
  title.textContent = 'Próximos vencimentos';
  const seeAll = document.createElement('a');
  seeAll.className = 'section-header__link';
  seeAll.href = '#/produtos';
  seeAll.textContent = 'Ver todos';
  sectionHeader.append(title, seeAll);
  section.appendChild(sectionHeader);

  const upcoming = attentionProducts(products);
  if (upcoming.length === 0) {
    const ok = document.createElement('p');
    ok.className = 'empty-note';
    ok.textContent = 'Tudo em dia por enquanto. Nenhum produto exige atenção.';
    section.appendChild(ok);
  } else {
    const list = document.createElement('ul');
    list.className = 'product-list';
    for (const product of upcoming) {
      list.appendChild(renderCompactItem(product));
    }
    section.appendChild(list);
  }
  content.appendChild(section);
}

function renderIndicators(counts: StatusCounts): HTMLElement {
  const root = document.createElement('section');
  root.className = 'indicators';
  root.setAttribute('aria-label', 'Resumo de validade');

  const items: Array<{
    status: 'expired' | 'today' | 'upcoming';
    label: string;
    count: number;
  }> = [
    { status: 'expired', label: 'Vencidos', count: counts.expired },
    { status: 'today', label: 'Vence hoje', count: counts.today },
    { status: 'upcoming', label: 'Próximos', count: counts.upcoming },
  ];

  for (const item of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `indicator indicator--${item.status}`;
    button.addEventListener('click', () => {
      window.location.hash = `#/produtos?status=${item.status}`;
    });

    const value = document.createElement('span');
    value.className = 'indicator__value tabular-nums';
    value.textContent = String(item.count);
    const label = document.createElement('span');
    label.className = 'indicator__label';
    label.textContent = item.label;

    button.append(value, label);
    root.appendChild(button);
  }

  const total = document.createElement('p');
  total.className = 'indicators__total';
  total.textContent = `${counts.total} ${counts.total === 1 ? 'registro' : 'registros'} no total`;
  root.appendChild(total);

  return root;
}

function renderCompactItem(product: ProductWithStatus): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'product-item';

  const main = document.createElement('div');
  main.className = 'product-item__main';

  const name = document.createElement('p');
  name.className = 'product-item__name';
  name.textContent = product.name;

  const meta = document.createElement('p');
  meta.className = 'product-item__meta tabular-nums';
  meta.textContent = formatDateBR(product.expiresAt);

  main.append(name, meta);
  item.append(main, createStatusBadge(product.status));
  return item;
}
