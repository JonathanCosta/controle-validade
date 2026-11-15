/**
 * Tela Produtos: busca, filtros, agrupamento por data/nome e exclusão
 * (ESPECIFICACAO §9, DESIGN_SYSTEM §8.2).
 */

import { createPageHeader } from '../../components/page-header.ts';
import { createEmptyState } from '../../components/empty-state.ts';
import { createStatusBadge } from '../../components/status-badge.ts';
import { confirmModal } from '../../components/modal.ts';
import { showToast } from '../../components/toast.ts';
import { createIcon } from '../../components/icons.ts';
import { getAppContext } from '../../app/context.ts';
import { getLocalToday, formatDateBR } from '../../domain/date.ts';
import {
  filterProducts,
  groupByDate,
  groupByName,
  withStatus,
  type NameGroup,
  type ProductGroup,
  type ProductWithStatus,
  type StatusFilter,
} from '../../domain/product-view.ts';
import type { GroupingMode } from '../../domain/settings.ts';
import { navigate } from '../../app/navigation.ts';

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'expired', label: 'Vencidos' },
  { value: 'today', label: 'Vence hoje' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'valid', label: 'Dentro da validade' },
];

function readInitialStatus(): StatusFilter {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) {
    return 'all';
  }
  const params = new URLSearchParams(hash.slice(queryIndex + 1));
  const status = params.get('status');
  if (
    status === 'expired' ||
    status === 'today' ||
    status === 'upcoming' ||
    status === 'valid'
  ) {
    return status;
  }
  return 'all';
}

export async function renderProducts(content: HTMLElement): Promise<void> {
  const header = createPageHeader({
    title: 'Produtos',
    description: 'Todos os registros cadastrados.',
  });
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
    content.replaceChildren(header);
    mountProductsScreen(content, annotated, settings.groupingMode, settings.nearExpiryDays);
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
      void renderProducts(content);
    });
    error.append(message, retry);
    content.appendChild(error);
  }
}

function mountProductsScreen(
  content: HTMLElement,
  initialProducts: readonly ProductWithStatus[],
  initialGrouping: GroupingMode,
  nearExpiryDays: number,
): void {
  const pageHeader = content.querySelector<HTMLElement>('.page-header');
  let products = [...initialProducts];
  let query = '';
  let statusFilter: StatusFilter = readInitialStatus();
  let groupingMode: GroupingMode = initialGrouping;

  if (products.length === 0) {
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

  // Busca
  const searchWrap = document.createElement('div');
  searchWrap.className = 'search-field';
  const searchIcon = createIcon('search');
  searchIcon.classList.add('search-field__icon');
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'search-field__input';
  searchInput.placeholder = 'Buscar produto...';
  searchInput.setAttribute('aria-label', 'Buscar produto por nome');
  searchWrap.append(searchIcon, searchInput);
  content.appendChild(searchWrap);

  // Filtros de status
  const chips = document.createElement('div');
  chips.className = 'chip-row';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Filtrar por situação');
  const chipButtons = new Map<StatusFilter, HTMLButtonElement>();
  for (const option of STATUS_OPTIONS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = option.label;
    button.setAttribute('aria-pressed', String(option.value === statusFilter));
    button.addEventListener('click', () => {
      statusFilter = option.value;
      updateChips();
      renderList();
    });
    chipButtons.set(option.value, button);
    chips.appendChild(button);
  }
  content.appendChild(chips);

  function updateChips(): void {
    for (const [value, button] of chipButtons.entries()) {
      const active = value === statusFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  updateChips();

  // Agrupamento
  const groupingWrap = document.createElement('div');
  groupingWrap.className = 'grouping-toggle';
  groupingWrap.setAttribute('role', 'group');
  groupingWrap.setAttribute('aria-label', 'Agrupar produtos');
  const byDateButton = document.createElement('button');
  byDateButton.type = 'button';
  byDateButton.className = 'grouping-toggle__option';
  byDateButton.textContent = 'Por data';
  const byNameButton = document.createElement('button');
  byNameButton.type = 'button';
  byNameButton.className = 'grouping-toggle__option';
  byNameButton.textContent = 'Por produto';
  groupingWrap.append(byDateButton, byNameButton);
  content.appendChild(groupingWrap);

  function updateGroupingButtons(): void {
    const byDateActive = groupingMode === 'date';
    byDateButton.classList.toggle('is-active', byDateActive);
    byNameButton.classList.toggle('is-active', !byDateActive);
    byDateButton.setAttribute('aria-pressed', String(byDateActive));
    byNameButton.setAttribute('aria-pressed', String(!byDateActive));
  }
  updateGroupingButtons();

  const listHost = document.createElement('div');
  listHost.className = 'products-list-host';
  content.appendChild(listHost);

  async function setGrouping(mode: GroupingMode): Promise<void> {
    if (groupingMode === mode) {
      return;
    }
    groupingMode = mode;
    updateGroupingButtons();
    renderList();
    try {
      const { settingsService } = getAppContext();
      const current = await settingsService.getSettings();
      await settingsService.saveSettings({ ...current, groupingMode: mode });
    } catch {
      // Preferência não salva: a visualização atual permanece.
    }
  }

  byDateButton.addEventListener('click', () => {
    void setGrouping('date');
  });
  byNameButton.addEventListener('click', () => {
    void setGrouping('name');
  });

  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    renderList();
  });

  function renderList(): void {
    listHost.replaceChildren();
    const filtered = filterProducts(products, { query, status: statusFilter });
    if (filtered.length === 0) {
      if (query.trim() !== '' || statusFilter !== 'all') {
        listHost.appendChild(
          createEmptyState({
            title: 'Nenhum resultado',
            description: 'Tente ajustar a busca ou os filtros.',
          }),
        );
      } else {
        listHost.appendChild(
          createEmptyState({
            title: 'Nenhum produto cadastrado',
            description: 'Adicione um produto para começar a acompanhar as validades.',
            actionLabel: 'Adicionar produto',
            onAction: () => navigate('novo'),
          }),
        );
      }
      return;
    }

    const groups: ProductGroup[] =
      groupingMode === 'date' ? groupByDate(filtered) : groupByName(filtered);
    for (const group of groups) {
      listHost.appendChild(renderGroup(group, onDelete));
    }
  }

  async function onDelete(product: ProductWithStatus): Promise<void> {
    const confirmed = await confirmModal({
      title: 'Excluir produto',
      message: 'Esta ação remove o registro definitivamente do dispositivo. A recuperação só será possível por backup.',
      detail: `${product.name} — validade ${formatDateBR(product.expiresAt)}`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await getAppContext().productsService.deleteProduct(product.id);
      products = products.filter((item) => item.id !== product.id);
      showToast('Produto excluído.');
      if (products.length === 0) {
        content.replaceChildren();
        if (pageHeader) {
          content.appendChild(pageHeader);
        }
        content.appendChild(
          createEmptyState({
            title: 'Nenhum produto cadastrado',
            description: 'Adicione um produto para começar a acompanhar as validades.',
            actionLabel: 'Adicionar produto',
            onAction: () => navigate('novo'),
          }),
        );
      } else {
        renderList();
      }
    } catch {
      showToast('Não foi possível excluir. Tente novamente.', 'error');
    }
  }

  renderList();

  // Mantém referência a nearExpiryDays para futuras reclassificações se necessário.
  void nearExpiryDays;
}

function renderGroup(
  group: ProductGroup,
  onDelete: (product: ProductWithStatus) => Promise<void>,
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'product-group';

  const title = document.createElement('h3');
  title.className = 'product-group__title';
  if (group.kind === 'date') {
    title.textContent = formatDateBR(group.key);
    title.classList.add('tabular-nums');
  } else {
    title.textContent = (group as NameGroup).displayName;
  }
  section.appendChild(title);

  const list = document.createElement('ul');
  list.className = 'product-list';
  for (const product of group.items) {
    list.appendChild(renderProductItem(product, group.kind, onDelete));
  }
  section.appendChild(list);
  return section;
}

function renderProductItem(
  product: ProductWithStatus,
  groupingKind: 'date' | 'name',
  onDelete: (product: ProductWithStatus) => Promise<void>,
): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'product-item';

  const main = document.createElement('div');
  main.className = 'product-item__main';

  const name = document.createElement('p');
  name.className = 'product-item__name';
  name.textContent = product.name;
  main.appendChild(name);

  // A data de validade deve estar sempre visível no item (§9.1, DESIGN_SYSTEM §12.5).
  const date = document.createElement('p');
  date.className = 'product-item__meta tabular-nums';
  date.textContent = formatDateBR(product.expiresAt);
  main.appendChild(date);

  const extraParts: string[] = [];
  if (product.brand) {
    extraParts.push(product.brand);
  }
  if (product.ean) {
    extraParts.push(`EAN ${product.ean}`);
  }
  if (extraParts.length > 0) {
    const extra = document.createElement('p');
    extra.className = 'product-item__meta';
    extra.textContent = extraParts.join(' · ');
    main.appendChild(extra);
  }

  // Em agrupamento por nome, as ocorrências já são distintas pela data exibida.
  void groupingKind;

  const side = document.createElement('div');
  side.className = 'product-item__side';
  side.appendChild(createStatusBadge(product.status));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'icon-button icon-button--danger';
  deleteButton.setAttribute('aria-label', `Excluir ${product.name}, validade ${formatDateBR(product.expiresAt)}`);
  deleteButton.appendChild(createIcon('delete'));
  deleteButton.addEventListener('click', () => {
    void onDelete(product);
  });
  side.appendChild(deleteButton);

  item.append(main, side);
  return item;
}
