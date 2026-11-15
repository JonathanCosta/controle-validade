/**
 * Geração de relatório por intervalo de validade (ESPECIFICACAO §10).
 * Filtro usa a data de validade (expiresAt), com limites inclusivos.
 * Classificação é sempre relativa à data atual e nearExpiryDays.
 */

import type { Product } from './product.ts';
import { formatDateBR, isValidDateOnly } from './date.ts';
import { withStatus, sortProducts, type ProductWithStatus } from './product-view.ts';
import { STATUS_LABELS, type ValidityStatus } from './validity.ts';

export interface ReportRange {
  start: string | null; // YYYY-MM-DD ou null
  end: string | null;
}

export interface ReportSection {
  status: ValidityStatus;
  items: ProductWithStatus[];
}

export interface ReportData {
  range: ReportRange;
  generatedAt: string; // YYYY-MM-DD (hoje)
  sections: ReportSection[];
  counts: Record<ValidityStatus, number>;
  total: number;
}

export type ReportRangeValidation =
  | { ok: true; range: ReportRange }
  | { ok: false; message: string };

function normalizeBoundary(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return value;
}

export function validateReportRange(
  start: string | null | undefined,
  end: string | null | undefined,
): ReportRangeValidation {
  const s = normalizeBoundary(start);
  const e = normalizeBoundary(end);
  if (s !== null && !isValidDateOnly(s)) {
    return { ok: false, message: 'Informe uma data inicial válida.' };
  }
  if (e !== null && !isValidDateOnly(e)) {
    return { ok: false, message: 'Informe uma data final válida.' };
  }
  if (s !== null && e !== null && s > e) {
    return { ok: false, message: 'A data inicial não pode ser posterior à data final.' };
  }
  return { ok: true, range: { start: s, end: e } };
}

export function filterByValidityRange(
  products: readonly Product[],
  range: ReportRange,
): Product[] {
  return products.filter((product) => {
    if (range.start !== null && product.expiresAt < range.start) {
      return false;
    }
    if (range.end !== null && product.expiresAt > range.end) {
      return false;
    }
    return true;
  });
}

const SECTION_ORDER: ValidityStatus[] = ['expired', 'today', 'upcoming', 'valid'];

export function buildReport(
  products: readonly Product[],
  range: ReportRange,
  today: string,
  nearExpiryDays: number,
): ReportData {
  const filtered = filterByValidityRange(products, range);
  const annotated = sortProducts(withStatus(filtered, today, nearExpiryDays));
  const byStatus: Record<ValidityStatus, ProductWithStatus[]> = {
    expired: [],
    today: [],
    upcoming: [],
    valid: [],
  };
  for (const product of annotated) {
    byStatus[product.status].push(product);
  }
  const sections: ReportSection[] = SECTION_ORDER.filter((status) => byStatus[status].length > 0).map(
    (status) => ({ status, items: byStatus[status] }),
  );
  const counts: Record<ValidityStatus, number> = {
    expired: byStatus.expired.length,
    today: byStatus.today.length,
    upcoming: byStatus.upcoming.length,
    valid: byStatus.valid.length,
  };
  return {
    range,
    generatedAt: today,
    sections,
    counts,
    total: annotated.length,
  };
}

export function formatRangeLabel(range: ReportRange): string {
  if (range.start === null && range.end === null) {
    return 'Todas as datas';
  }
  if (range.start !== null && range.end !== null) {
    return `${formatDateBR(range.start)} a ${formatDateBR(range.end)}`;
  }
  if (range.start !== null) {
    return `A partir de ${formatDateBR(range.start)}`;
  }
  return `Até ${formatDateBR(range.end as string)}`;
}

const STATUS_EMOJI: Record<ValidityStatus, string> = {
  expired: '🔴',
  today: '🟠',
  upcoming: '🟡',
  valid: '🟢',
};

export function formatReportText(report: ReportData): string {
  const lines: string[] = [];
  lines.push('📋 *RELATÓRIO DE VALIDADE*');
  lines.push('');
  lines.push(`📅 Período: ${formatRangeLabel(report.range)}`);
  lines.push(`🗓️ Gerado em: ${formatDateBR(report.generatedAt)}`);

  for (const section of report.sections) {
    lines.push('');
    const emoji = STATUS_EMOJI[section.status];
    const label = STATUS_LABELS[section.status].toUpperCase();
    lines.push(`${emoji} *${label} (${section.items.length})*`);
    for (const item of section.items) {
      lines.push(`- ${item.name} — ${formatDateBR(item.expiresAt)}`);
    }
  }

  lines.push('');
  const unit = report.total === 1 ? 'REGISTRO' : 'REGISTROS';
  lines.push(`*TOTAL: ${report.total} ${unit}*`);
  return lines.join('\n');
}
