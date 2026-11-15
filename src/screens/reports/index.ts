/**
 * Tela Relatórios: filtro por intervalo de validade, texto para WhatsApp e cópia
 * (ESPECIFICACAO §10, DESIGN_SYSTEM §8.5).
 */

import { createPageHeader } from '../../components/page-header.ts';
import { createStatusBadge } from '../../components/status-badge.ts';
import { showToast } from '../../components/toast.ts';
import { getAppContext } from '../../app/context.ts';
import { getLocalToday, formatDateBR } from '../../domain/date.ts';
import {
  buildReport,
  formatRangeLabel,
  formatReportText,
  validateReportRange,
  type ReportData,
  type ReportRange,
} from '../../domain/report.ts';
import type { Product } from '../../domain/product.ts';

export async function renderReports(content: HTMLElement): Promise<void> {
  const header = createPageHeader({
    title: 'Relatórios',
    description: 'Gere e copie o relatório de validades.',
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
    content.replaceChildren(header);
    mountReportsScreen(content, products, settings.nearExpiryDays);
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
      void renderReports(content);
    });
    error.append(message, retry);
    content.appendChild(error);
  }
}

function mountReportsScreen(
  content: HTMLElement,
  products: readonly Product[],
  nearExpiryDays: number,
): void {
  let currentRange: ReportRange = { start: null, end: null };

  const filters = document.createElement('section');
  filters.className = 'report-filters';

  const startField = createDateFilter('report-start', 'Data inicial');
  const endField = createDateFilter('report-end', 'Data final');

  const filterActions = document.createElement('div');
  filterActions.className = 'report-filters__actions';
  const applyButton = document.createElement('button');
  applyButton.type = 'button';
  applyButton.className = 'button button--primary';
  applyButton.textContent = 'Aplicar filtro';
  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'button button--secondary';
  clearButton.textContent = 'Limpar';
  filterActions.append(applyButton, clearButton);

  const rangeError = document.createElement('p');
  rangeError.className = 'field__error';
  rangeError.setAttribute('role', 'alert');

  filters.append(startField.root, endField.root, filterActions, rangeError);
  content.appendChild(filters);

  const reportHost = document.createElement('div');
  reportHost.className = 'report-host';
  content.appendChild(reportHost);

  const copySection = document.createElement('div');
  copySection.className = 'report-copy';
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'button button--primary form-actions__save';
  copyButton.textContent = 'Copiar relatório';
  const fallbackWrap = document.createElement('div');
  fallbackWrap.className = 'report-copy__fallback';
  fallbackWrap.hidden = true;
  copySection.append(copyButton, fallbackWrap);
  content.appendChild(copySection);

  function renderReport(): void {
    const today = getLocalToday();
    const report = buildReport(products, currentRange, today, nearExpiryDays);
    reportHost.replaceChildren();
    fallbackWrap.replaceChildren();
    fallbackWrap.hidden = true;
    reportHost.appendChild(renderReportView(report));

    copyButton.disabled = report.total === 0;
    copyButton.onclick = () => {
      void copyReport(formatReportText(report), fallbackWrap);
    };
  }

  applyButton.addEventListener('click', () => {
    const validation = validateReportRange(startField.input.value, endField.input.value);
    if (!validation.ok) {
      rangeError.textContent = validation.message;
      return;
    }
    rangeError.textContent = '';
    currentRange = validation.range;
    renderReport();
  });

  clearButton.addEventListener('click', () => {
    startField.input.value = '';
    endField.input.value = '';
    rangeError.textContent = '';
    currentRange = { start: null, end: null };
    renderReport();
  });

  renderReport();
}

function createDateFilter(
  id: string,
  labelText: string,
): { root: HTMLElement; input: HTMLInputElement } {
  const root = document.createElement('div');
  root.className = 'field';
  const label = document.createElement('label');
  label.className = 'field__label';
  label.htmlFor = id;
  label.textContent = labelText;
  const input = document.createElement('input');
  input.className = 'field__input';
  input.id = id;
  input.type = 'date';
  root.append(label, input);
  return { root, input };
}

function renderReportView(report: ReportData): HTMLElement {
  const root = document.createElement('section');
  root.className = 'report-view';

  const meta = document.createElement('div');
  meta.className = 'report-meta';
  const period = document.createElement('p');
  period.textContent = `Período: ${formatRangeLabel(report.range)}`;
  const generated = document.createElement('p');
  generated.textContent = `Gerado em: ${formatDateBR(report.generatedAt)}`;
  meta.append(period, generated);
  root.appendChild(meta);

  if (report.total === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = 'Não há produtos no período selecionado.';
    root.appendChild(empty);
    const total = document.createElement('p');
    total.className = 'report-total';
    total.textContent = 'Total: 0 registros';
    root.appendChild(total);
    return root;
  }

  for (const section of report.sections) {
    const block = document.createElement('section');
    block.className = 'report-section';
    const heading = document.createElement('h3');
    heading.className = 'report-section__title';
    heading.appendChild(createStatusBadge(section.status));
    const count = document.createElement('span');
    count.className = 'report-section__count';
    count.textContent = ` (${section.items.length})`;
    heading.appendChild(count);
    block.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'report-list';
    for (const item of section.items) {
      const li = document.createElement('li');
      li.className = 'report-list__item';
      li.textContent = `${item.name} — ${formatDateBR(item.expiresAt)}`;
      list.appendChild(li);
    }
    block.appendChild(list);
    root.appendChild(block);
  }

  const total = document.createElement('p');
  total.className = 'report-total';
  const unit = report.total === 1 ? 'registro' : 'registros';
  total.textContent = `Total: ${report.total} ${unit}`;
  root.appendChild(total);

  return root;
}

async function copyReport(text: string, fallbackWrap: HTMLElement): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast('Relatório copiado.');
      return;
    }
    throw new Error('Clipboard indisponível');
  } catch {
    fallbackWrap.replaceChildren();
    fallbackWrap.hidden = false;
    const hint = document.createElement('p');
    hint.className = 'field__hint';
    hint.textContent = 'Selecione o texto abaixo e copie manualmente.';
    const area = document.createElement('textarea');
    area.className = 'report-copy__textarea';
    area.readOnly = true;
    area.value = text;
    fallbackWrap.append(hint, area);
    area.focus();
    area.select();
  }
}
