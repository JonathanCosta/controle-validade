/**
 * Modal de confirmação acessível (DESIGN_SYSTEM §7.11, §12.3).
 * Usa <dialog> com showModal; foco inicial no botão de cancelar para evitar
 * confirmação acidental; retorna foco ao elemento que abriu ao fechar.
 */

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Detalhes adicionais (ex.: nome e validade do produto a excluir). */
  detail?: string;
}

/** Abre um modal e resolve true se confirmado, false se cancelado/fechado. */
export function confirmModal(options: ConfirmModalOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const opener = document.activeElement as HTMLElement | null;

    const dialog = document.createElement('dialog');
    dialog.className = 'modal';
    dialog.setAttribute('aria-label', options.title);

    const title = document.createElement('h2');
    title.className = 'modal__title';
    title.textContent = options.title;

    const message = document.createElement('p');
    message.className = 'modal__message';
    message.textContent = options.message;

    const actions = document.createElement('div');
    actions.className = 'modal__actions';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'button button--secondary';
    cancelButton.textContent = options.cancelLabel ?? 'Cancelar';

    const confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = options.destructive
      ? 'button button--destructive'
      : 'button button--primary';
    confirmButton.textContent = options.confirmLabel;

    actions.append(cancelButton, confirmButton);
    dialog.append(title);
    if (options.detail) {
      const detail = document.createElement('p');
      detail.className = 'modal__detail';
      detail.textContent = options.detail;
      dialog.appendChild(detail);
    }
    dialog.append(message, actions);

    let settled = false;
    const finish = (value: boolean): void => {
      if (settled) {
        return;
      }
      settled = true;
      if (dialog.open) {
        dialog.close();
      }
      dialog.remove();
      opener?.focus();
      resolve(value);
    };

    cancelButton.addEventListener('click', () => finish(false));
    confirmButton.addEventListener('click', () => finish(true));
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      finish(false);
    });

    document.body.appendChild(dialog);
    dialog.showModal();
    cancelButton.focus();
  });
}
