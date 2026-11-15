import { describe, expect, it } from 'vitest';

import type { Product } from '../../src/domain/product.ts';
import {
  buildReport,
  filterByValidityRange,
  formatRangeLabel,
  formatReportText,
  validateReportRange,
} from '../../src/domain/report.ts';

function p(id: string, name: string, expiresAt: string): Product {
  return { id, name, expiresAt, ean: null, brand: null };
}

const TODAY = '2026-11-12';
const NEAR = 15;

describe('validateReportRange', () => {
  it('aceita ambos vazios', () => {
    expect(validateReportRange('', '')).toEqual({ ok: true, range: { start: null, end: null } });
  });

  it('aceita limites isolados e intervalo inclusivo', () => {
    expect(validateReportRange('2026-11-01', '')).toEqual({ ok: true, range: { start: '2026-11-01', end: null } });
    expect(validateReportRange('', '2026-11-30')).toEqual({ ok: true, range: { start: null, end: '2026-11-30' } });
    expect(validateReportRange('2026-11-01', '2026-11-30')).toEqual({ ok: true, range: { start: '2026-11-01', end: '2026-11-30' } });
  });

  it('rejeita data inicial posterior à final', () => {
    const result = validateReportRange('2026-11-30', '2026-11-01');
    expect(result.ok).toBe(false);
  });

  it('rejeita datas inválidas', () => {
    expect(validateReportRange('2026-02-30', '').ok).toBe(false);
    expect(validateReportRange('', '31/11/2026').ok).toBe(false);
  });
});

describe('filterByValidityRange', () => {
  const products = [
    p('1', 'A', '2026-11-01'),
    p('2', 'B', '2026-11-12'),
    p('3', 'C', '2026-11-30'),
  ];

  it('nenhum filtro inclui todos os registros', () => {
    expect(filterByValidityRange(products, { start: null, end: null }).map((x) => x.id)).toEqual(['1', '2', '3']);
  });

  it('limites são inclusivos', () => {
    expect(filterByValidityRange(products, { start: '2026-11-12', end: null }).map((x) => x.id)).toEqual(['2', '3']);
    expect(filterByValidityRange(products, { start: null, end: '2026-11-12' }).map((x) => x.id)).toEqual(['1', '2']);
    expect(filterByValidityRange(products, { start: '2026-11-01', end: '2026-11-30' }).map((x) => x.id)).toEqual(['1', '2', '3']);
  });
});

describe('buildReport', () => {
  it('classifica com base na data atual (intervalo passado pode conter vencidos)', () => {
    const products = [
      p('1', 'Velho', '2026-10-01'),
      p('2', 'Hoje', '2026-11-12'),
    ];
    const report = buildReport(products, { start: '2026-10-01', end: '2026-11-12' }, TODAY, NEAR);
    expect(report.counts.expired).toBe(1);
    expect(report.counts.today).toBe(1);
    expect(report.total).toBe(2);
  });

  it('agrupa por status, omite seções vazias e ordena por data/nome', () => {
    const products = [
      p('1', 'B', '2026-11-11'),
      p('2', 'A', '2026-11-11'),
      p('3', 'C', '2026-12-10'),
    ];
    const report = buildReport(products, { start: null, end: null }, TODAY, NEAR);
    expect(report.sections.map((s) => s.status)).toEqual(['expired', 'valid']);
    expect(report.sections[0]?.items.map((i) => i.name)).toEqual(['A', 'B']);
  });
});

describe('formatRangeLabel/formatReportText', () => {
  it('formata período e texto no modelo WhatsApp', () => {
    expect(formatRangeLabel({ start: null, end: null })).toBe('Todas as datas');
    const report = buildReport(
      [p('1', 'Leite integral', '2026-11-08'), p('2', 'Arroz', '2026-11-28')],
      { start: '2026-11-01', end: '2026-11-30' },
      TODAY,
      NEAR,
    );
    const text = formatReportText(report);
    expect(text).toContain('📋 *RELATÓRIO DE VALIDADE*');
    expect(text).toContain('📅 Período: 01/11/2026 a 30/11/2026');
    expect(text).toContain('🗓️ Gerado em: 12/11/2026');
    expect(text).toContain('🔴 *VENCIDO (1)*');
    expect(text).toContain('- Leite integral — 08/11/2026');
    expect(text).toContain('🟢 *DENTRO DA VALIDADE (1)*');
    expect(text).toContain('*TOTAL: 2 REGISTROS*');
  });

  it('relatório vazio tem total zero', () => {
    const report = buildReport([], { start: null, end: null }, TODAY, NEAR);
    const text = formatReportText(report);
    expect(text).toContain('*TOTAL: 0 REGISTROS*');
  });
});
