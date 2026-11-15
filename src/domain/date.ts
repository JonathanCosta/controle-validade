/**
 * Datas civis, sem horário e sem fuso.
 * Toda instância de Date da aplicação vive neste módulo; os demais módulos
 * consomem estas funções puras (ESPECIFICACAO §5.2, AGENTS.md §3).
 */

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Data atual do relógio local do dispositivo, em YYYY-MM-DD. */
export function getLocalToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/**
 * Valida se a string é uma data real no formato YYYY-MM-DD (calendário verdadeiro).
 * Não basta formato: `2026-02-30` é rejeitado.
 */
export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const asUtc = new Date(Date.UTC(year, month - 1, day));
  return (
    asUtc.getUTCFullYear() === year &&
    asUtc.getUTCMonth() === month - 1 &&
    asUTCDay(asUtc) === day
  );
}

function asUTCDay(date: Date): number {
  return date.getUTCDate();
}

/** Converte `YYYY-MM-DD` validado para o número de dias UTC correspondente. */
function toUtcDay(value: string): number {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new RangeError(`Data inválida: ${String(value)}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

/**
 * Diferença em dias civis: `to - from`.
 * Negativo quando `to` é anterior a `from`. Sem deslocamento por fuso/DST.
 */
export function diffCalendarDays(from: string, to: string): number {
  if (!isValidDateOnly(from) || !isValidDateOnly(to)) {
    throw new RangeError(`Datas inválidas: from=${String(from)} to=${String(to)}`);
  }
  return toUtcDay(to) - toUtcDay(from);
}

/** Soma `days` dias civis a uma data, com virada correta de mês/ano/bissexto. */
export function addDays(isoDate: string, days: number): string {
  if (!isValidDateOnly(isoDate)) {
    throw new RangeError(`Data inválida: ${String(isoDate)}`);
  }
  if (!Number.isFinite(days)) {
    throw new RangeError(`Número de dias inválido: ${String(days)}`);
  }
  const asUtc = new Date((toUtcDay(isoDate) + days) * 86_400_000);
  return `${asUtc.getUTCFullYear()}-${pad2(asUtc.getUTCMonth() + 1)}-${pad2(asUtc.getUTCDate())}`;
}

/** Formata `YYYY-MM-DD` como `DD/MM/YYYY` para exibição. */
export function formatDateBR(value: string): string {
  if (!isValidDateOnly(value)) {
    throw new RangeError(`Data inválida: ${String(value)}`);
  }
  const match = DATE_PATTERN.exec(value) as RegExpExecArray;
  return `${match[3]}/${match[2]}/${match[1]}`;
}
