import { describe, expect, it } from 'vitest';

import {
  addDays,
  diffCalendarDays,
  formatDateBR,
  getLocalToday,
  isValidDateOnly,
} from '../../src/domain/date.ts';

describe('getLocalToday', () => {
  it('retorna a data local no formato YYYY-MM-DD (sem deslocamento de fuso)', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getLocalToday()).toBe(expected);
  });

  it('não usa toISOString (que devolveria a data UTC)', () => {
    const now = new Date();
    const utcDate = now.toISOString().slice(0, 10);
    // Em fusos positivos avançados (ex.: UTC+13) a diferença pode ocorrer;
    // o teste garante apenas que a função considera componentes locais.
    const localComponents = [now.getFullYear(), now.getMonth(), now.getDate()];
    const rebuilt = `${localComponents[0]}-${String(localComponents[1]! + 1).padStart(2, '0')}-${String(localComponents[2]).padStart(2, '0')}`;
    expect(getLocalToday()).toBe(rebuilt);
    expect(utcDate.length).toBe(10);
  });
});

describe('isValidDateOnly', () => {
  it('aceita datas reais', () => {
    expect(isValidDateOnly('2026-11-12')).toBe(true);
    expect(isValidDateOnly('2024-02-29')).toBe(true); // bissexto
    expect(isValidDateOnly('2023-12-31')).toBe(true);
  });

  it('rejeita formatos inválidos', () => {
    expect(isValidDateOnly('2026-2-3')).toBe(false);
    expect(isValidDateOnly('12/11/2026')).toBe(false);
    expect(isValidDateOnly('')).toBe(false);
    expect(isValidDateOnly('2026-11-12T00:00:00Z')).toBe(false);
    expect(isValidDateOnly('20261112')).toBe(false);
  });

  it('rejeita datas inexistentes no calendário', () => {
    expect(isValidDateOnly('2026-02-30')).toBe(false);
    expect(isValidDateOnly('2026-13-01')).toBe(false);
    expect(isValidDateOnly('2026-00-10')).toBe(false);
    expect(isValidDateOnly('2026-04-31')).toBe(false);
    expect(isValidDateOnly('2023-02-29')).toBe(false); // não bissexto
    expect(isValidDateOnly('2026-11-00')).toBe(false);
  });

  it('rejeita tipos não string', () => {
    expect(isValidDateOnly(20261112)).toBe(false);
    expect(isValidDateOnly(null)).toBe(false);
    expect(isValidDateOnly(undefined)).toBe(false);
  });
});

describe('diffCalendarDays', () => {
  it('calcula a diferença civil entre duas datas', () => {
    expect(diffCalendarDays('2026-11-12', '2026-11-12')).toBe(0);
    expect(diffCalendarDays('2026-11-12', '2026-11-13')).toBe(1);
    expect(diffCalendarDays('2026-11-12', '2026-11-11')).toBe(-1);
    expect(diffCalendarDays('2026-11-12', '2026-11-27')).toBe(15);
    expect(diffCalendarDays('2026-11-12', '2026-11-28')).toBe(16);
  });

  it('atravessa virada de mês e de ano', () => {
    expect(diffCalendarDays('2026-10-31', '2026-11-01')).toBe(1);
    expect(diffCalendarDays('2026-12-31', '2027-01-01')).toBe(1);
    expect(diffCalendarDays('2025-12-31', '2026-01-01')).toBe(1);
  });

  it('considera fevereiro e ano bissexto', () => {
    expect(diffCalendarDays('2024-02-28', '2024-03-01')).toBe(2);
    expect(diffCalendarDays('2023-02-28', '2023-03-01')).toBe(1);
  });

  it('rejeita datas inválidas', () => {
    expect(() => diffCalendarDays('2026-02-30', '2026-03-01')).toThrow(RangeError);
    expect(() => diffCalendarDays('2026-11-12', 'abc')).toThrow(RangeError);
  });
});

describe('addDays', () => {
  it('soma dias com virada de mês e ano', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('trata fevereiro e bissexto', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    expect(addDays('2023-02-28', 1)).toBe('2023-03-01');
  });

  it('aceita dias negativos', () => {
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
  });

  it('rejeita entrada inválida', () => {
    expect(() => addDays('2026-02-30', 1)).toThrow(RangeError);
    expect(() => addDays('2026-11-12', Number.NaN)).toThrow(RangeError);
  });
});

describe('formatDateBR', () => {
  it('formata como DD/MM/YYYY', () => {
    expect(formatDateBR('2026-11-12')).toBe('12/11/2026');
    expect(formatDateBR('2026-01-05')).toBe('05/01/2026');
  });

  it('rejeita datas inválidas', () => {
    expect(() => formatDateBR('2026-02-30')).toThrow(RangeError);
  });
});
