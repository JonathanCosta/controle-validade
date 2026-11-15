/**
 * Toast: feedback breve de sucesso/erro, com região aria-live
 * (ESPECIFICACAO §15; DESIGN_SYSTEM §7.13).
 */

let region: HTMLElement | null = null;

function ensureRegion(): HTMLElement {
  if (region && document.body.contains(region)) {
    return region;
  }
  region = document.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);
  return region;
}

export function showToast(message: string, kind: 'success' | 'error' = 'success'): void {
  const host = ensureRegion();
  const toast = document.createElement('div');
  toast.className = `toast toast--${kind}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  host.appendChild(toast);
  // Animação de entrada no próximo frame.
  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });
  window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => {
      toast.remove();
    }, 200);
  }, 3000);
}
