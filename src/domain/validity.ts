/**
 * Classificação dinâmica de validade. O status nunca é gravado no banco:
 * é calculado no momento da consulta (ESPECIFICACAO §5.3).
 */

import { diffCalendarDays } from './date.ts';

export type ValidityStatus = 'expired' | 'today' | 'upcoming' | 'valid';

/** Rótulos pt-BR normativos (ESPECIFICACAO §5.3). */
export const STATUS_LABELS: Record<ValidityStatus, string> = {
  expired: 'Vencido',
  today: 'Vence hoje',
  upcoming: 'Próximo do vencimento',
  valid: 'Dentro da validade',
};

/**
 * `daysUntil = expiresAt - today`:
 * - `< 0`: vencido;
 * - `=== 0`: vence hoje;
 * - `1..nearExpiryDays` (inclusivo): próximo do vencimento;
 * - `> nearExpiryDays`: dentro da validade.
 */
export function getValidityStatus(
  expiresAt: string,
  today: string,
  nearExpiryDays: number,
): ValidityStatus {
  const daysUntil = diffCalendarDays(today, expiresAt);
  if (daysUntil < 0) {
    return 'expired';
  }
  if (daysUntil === 0) {
    return 'today';
  }
  if (daysUntil <= nearExpiryDays) {
    return 'upcoming';
  }
  return 'valid';
}
