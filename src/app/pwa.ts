/**
 * Registro do Service Worker com atualização sob demanda (ESPECIFICACAO §13.2).
 * - registerType: prompt: nunca recarrega automaticamente.
 * - onNeedRefresh: aviso com "Atualizar agora" / "Mais tarde".
 * - onOfflineReady: aviso discreto de pronto para offline.
 * - navigator.storage.persist(): melhor esforço, sem bloquear.
 */

import { registerSW } from 'virtual:pwa-register';

function showUpdatePrompt(updateSW: (reloadPage?: boolean) => Promise<void>): void {
  const bar = document.createElement('div');
  bar.className = 'pwa-prompt';
  bar.setAttribute('role', 'status');

  const message = document.createElement('p');
  message.className = 'pwa-prompt__message';
  message.textContent = 'Nova versão disponível.';

  const actions = document.createElement('div');
  actions.className = 'pwa-prompt__actions';

  const later = document.createElement('button');
  later.type = 'button';
  later.className = 'button button--secondary';
  later.textContent = 'Mais tarde';

  const update = document.createElement('button');
  update.type = 'button';
  update.className = 'button button--primary';
  update.textContent = 'Atualizar agora';

  later.addEventListener('click', () => {
    bar.remove();
  });
  update.addEventListener('click', () => {
    update.disabled = true;
    later.disabled = true;
    void updateSW(true);
  });

  actions.append(later, update);
  bar.append(message, actions);
  document.body.appendChild(bar);
}

function showOfflineReady(): void {
  const bar = document.createElement('div');
  bar.className = 'pwa-prompt pwa-prompt--subtle';
  bar.setAttribute('role', 'status');

  const message = document.createElement('p');
  message.className = 'pwa-prompt__message';
  message.textContent = 'Aplicação pronta para uso offline.';

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'button button--secondary';
  ok.textContent = 'OK';
  ok.addEventListener('click', () => {
    bar.remove();
  });

  bar.append(message, ok);
  document.body.appendChild(bar);
  window.setTimeout(() => {
    if (bar.isConnected) {
      bar.remove();
    }
  }, 5000);
}

async function requestPersistentStorage(): Promise<void> {
  try {
    if (!navigator.storage?.persisted || !navigator.storage?.persist) {
      return;
    }
    const already = await navigator.storage.persisted();
    if (!already) {
      await navigator.storage.persist();
    }
  } catch {
    // Melhor esforço: nunca bloquear a aplicação (§13.4).
  }
}

export function initPwa(): void {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showUpdatePrompt(updateSW);
    },
    onOfflineReady() {
      showOfflineReady();
    },
  });
  if (document.readyState === 'complete') {
    void requestPersistentStorage();
  } else {
    window.addEventListener(
      'load',
      () => {
        void requestPersistentStorage();
      },
      { once: true },
    );
  }
}
