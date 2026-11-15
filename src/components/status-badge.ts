import type { ValidityStatus } from '../domain/validity.ts';
import { STATUS_LABELS } from '../domain/validity.ts';

export function createStatusBadge(status: ValidityStatus): HTMLElement {
  const badge = document.createElement('span');
  badge.className = `status-badge status-badge--${status}`;
  badge.textContent = STATUS_LABELS[status];
  return badge;
}
