/**
 * Tela Configurações: validade, URL de consulta, agrupamento e backup
 * (ESPECIFICACAO §11, §12; DESIGN_SYSTEM §8.6).
 */

import { createPageHeader } from '../../components/page-header.ts';
import { confirmModal } from '../../components/modal.ts';
import { showToast } from '../../components/toast.ts';
import { getAppContext } from '../../app/context.ts';
import { getLocalToday } from '../../domain/date.ts';
import {
  isGroupingMode,
  isValidNearExpiryDays,
  validateLookupUrlTemplate,
  type AppSettings,
  type GroupingMode,
} from '../../domain/settings.ts';

export async function renderSettings(content: HTMLElement): Promise<void> {
  const header = createPageHeader({
    title: 'Configurações',
    description: 'Preferências do aplicativo e segurança dos dados.',
  });
  content.appendChild(header);

  const loading = document.createElement('div');
  loading.className = 'screen-stub';
  loading.textContent = 'Carregando…';
  content.appendChild(loading);

  try {
    const settings = await getAppContext().settingsService.getSettings();
    if (!content.isConnected) {
      return;
    }
    content.replaceChildren(header);
    mountSettings(content, settings);
  } catch {
    if (!content.isConnected) {
      return;
    }
    content.replaceChildren(header);
    const error = document.createElement('div');
    error.className = 'screen-stub';
    error.textContent = 'Não foi possível carregar as configurações.';
    content.appendChild(error);
  }
}

function mountSettings(content: HTMLElement, initial: AppSettings): void {
  let settings = { ...initial };

  // Validade
  const validitySection = createSection('Validade');
  const daysField = createLabeledInput('near-expiry-days', 'Considerar próximo do vencimento em (dias)', 'number');
  daysField.input.min = '1';
  daysField.input.max = '365';
  daysField.input.step = '1';
  daysField.input.value = String(settings.nearExpiryDays);
  const daysHint = document.createElement('p');
  daysHint.className = 'field__hint';
  daysHint.textContent = 'Padrão: 15 dias. Produtos que vencem dentro deste período são marcados como próximos.';
  const daysError = document.createElement('p');
  daysError.className = 'field__error';
  const saveDays = createButton('Salvar período', 'secondary');
  saveDays.addEventListener('click', () => {
    void saveNearExpiryDays();
  });
  validitySection.append(daysField.root, daysHint, daysError, saveDays);

  async function saveNearExpiryDays(): Promise<void> {
    daysError.textContent = '';
    const value = Number(daysField.input.value);
    if (!isValidNearExpiryDays(value)) {
      daysError.textContent = 'Informe um número inteiro entre 1 e 365.';
      return;
    }
    try {
      const updated: AppSettings = { ...settings, nearExpiryDays: value };
      await getAppContext().settingsService.saveSettings(updated);
      settings = updated;
      showToast('Período atualizado. Os status serão recalculados.');
    } catch {
      showToast('Não foi possível salvar. Tente novamente.', 'error');
    }
  }

  // URL de consulta
  const lookupSection = createSection('Identificação de produtos');
  const urlField = createLabeledInput('lookup-url', 'URL de consulta', 'text');
  urlField.input.value = settings.lookupUrlTemplate;
  const urlHint = document.createElement('p');
  urlHint.className = 'field__hint';
  urlHint.textContent = 'Use {ean} no lugar do código. O endpoint deve responder JSON com ean e description (padrão: proxy/Worker configurado). O cadastro manual funciona sem esta consulta.';
  const urlError = document.createElement('p');
  urlError.className = 'field__error';
  const saveUrl = createButton('Salvar URL', 'secondary');
  saveUrl.addEventListener('click', () => {
    void saveLookupUrl();
  });
  lookupSection.append(urlField.root, urlHint, urlError, saveUrl);

  async function saveLookupUrl(): Promise<void> {
    urlError.textContent = '';
    const template = urlField.input.value.trim();
    const validation = validateLookupUrlTemplate(template);
    if (!validation.ok) {
      urlError.textContent = validation.reason ?? 'URL de consulta inválida.';
      return;
    }
    try {
      const updated: AppSettings = { ...settings, lookupUrlTemplate: template };
      await getAppContext().settingsService.saveSettings(updated);
      settings = updated;
      urlField.input.value = template;
      showToast('URL de consulta atualizada.');
    } catch {
      showToast('Não foi possível salvar. Tente novamente.', 'error');
    }
  }

  // Agrupamento padrão
  const groupingSection = createSection('Agrupamento padrão');
  const groupingHint = document.createElement('p');
  groupingHint.className = 'field__hint';
  groupingHint.textContent = 'Escolha como os produtos são agrupados na tela Produtos.';
  const groupingRow = document.createElement('div');
  groupingRow.className = 'grouping-toggle';
  const byDate = createButton('Por data', 'secondary');
  const byName = createButton('Por produto', 'secondary');
  groupingRow.append(byDate, byName);

  function updateGroupingButtons(): void {
    const isDate = settings.groupingMode === 'date';
    byDate.classList.toggle('is-active', isDate);
    byName.classList.toggle('is-active', !isDate);
  }
  updateGroupingButtons();

  async function saveGrouping(mode: GroupingMode): Promise<void> {
    if (!isGroupingMode(mode) || mode === settings.groupingMode) {
      return;
    }
    try {
      const updated = { ...settings, groupingMode: mode };
      await getAppContext().settingsService.saveSettings(updated);
      settings = updated;
      updateGroupingButtons();
      showToast('Agrupamento atualizado.');
    } catch {
      showToast('Não foi possível salvar. Tente novamente.', 'error');
    }
  }
  byDate.addEventListener('click', () => void saveGrouping('date'));
  byName.addEventListener('click', () => void saveGrouping('name'));
  groupingSection.append(groupingHint, groupingRow);

  // Backup
  const backupSection = createSection('Backup e recuperação');
  const backupHint = document.createElement('p');
  backupHint.className = 'field__hint';
  backupHint.textContent = 'Exporte seus dados regularmente. A importação permite substituir tudo ou mesclar registros pelo ID.';
  const backupActions = document.createElement('div');
  backupActions.className = 'settings-actions';
  const exportButton = createButton('Exportar backup', 'primary');
  const importButton = createButton('Importar backup', 'secondary');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;

  exportButton.addEventListener('click', () => {
    void handleExport();
  });
  importButton.addEventListener('click', () => {
    fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    void handleImportFile(fileInput.files?.[0] ?? null);
    fileInput.value = '';
  });

  backupActions.append(exportButton, importButton, fileInput);
  backupSection.append(backupHint, backupActions);

  async function handleExport(): Promise<void> {
    try {
      await getAppContext().backupService.exportBackup(getLocalToday());
      showToast('Backup exportado.');
    } catch {
      showToast('Não foi possível exportar o backup.', 'error');
    }
  }

  async function handleImportFile(file: File | null): Promise<void> {
    if (!file) {
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      showToast('Não foi possível ler o arquivo.', 'error');
      return;
    }
    const validation = getAppContext().backupService.validate(text);
    if (!validation.ok) {
      showToast(validation.message, 'error');
      return;
    }
    const choice = await chooseBackupAction(validation.backup.products.length);
    if (choice === 'cancel') {
      showToast('Restauração cancelada.');
      return;
    }
    if (choice === 'replace') {
      const confirmed = await confirmModal({
        title: 'Substituir dados atuais',
        message:
          'Todos os registros atuais serão removidos e as configurações do arquivo serão aplicadas. Esta ação não pode ser desfeita sem outro backup.',
        confirmLabel: 'Substituir',
        cancelLabel: 'Cancelar',
        destructive: true,
      });
      if (!confirmed) {
        showToast('Restauração cancelada.');
        return;
      }
      try {
        await getAppContext().backupService.replace(validation.backup);
        showToast('Backup restaurado com substituição.');
        content.replaceChildren();
        void renderSettings(content);
      } catch {
        showToast('Falha ao restaurar. Os dados atuais foram mantidos.', 'error');
      }
      return;
    }
    // Mesclar: mantém registros e configurações atuais; evita duplicidade por ID.
    try {
      const summary = await getAppContext().backupService.merge(validation.backup);
      showToast(
        `Mesclagem concluída: ${summary.added} adicionado(s), ${summary.ignored} ignorado(s) por ID existente.`,
      );
    } catch {
      showToast('Falha ao mesclar. Os dados atuais foram mantidos.', 'error');
    }
  }

  // Sobre
  const aboutSection = createSection('Sobre');
  const about = document.createElement('p');
  about.className = 'field__hint';
  about.textContent = 'Controle de Validade — versão 1.0.0. Seus dados ficam armazenados apenas neste dispositivo. Faça backups regularmente.';
  aboutSection.appendChild(about);

  content.append(validitySection, lookupSection, groupingSection, backupSection, aboutSection);
}

type BackupAction = 'replace' | 'merge' | 'cancel';

function chooseBackupAction(productCount: number): Promise<BackupAction> {
  return new Promise((resolve) => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = document.createElement('dialog');
    dialog.className = 'modal';
    dialog.setAttribute('aria-label', 'Restaurar backup');

    const title = document.createElement('h2');
    title.className = 'modal__title';
    title.textContent = 'Restaurar backup';

    const detail = document.createElement('p');
    detail.className = 'modal__detail';
    detail.textContent = `O arquivo contém ${productCount} registro(s).`;

    const message = document.createElement('p');
    message.className = 'modal__message';
    message.textContent =
      'Substituir: remove todos os registros atuais e usa os do arquivo (inclui as configurações do arquivo). Mesclar: mantém seus registros e configurações atuais e adiciona apenas registros com ID novo; registros de mesmo ID são ignorados.';

    const actions = document.createElement('div');
    actions.className = 'modal__actions modal__actions--stack';

    const replaceButton = document.createElement('button');
    replaceButton.type = 'button';
    replaceButton.className = 'button button--destructive';
    replaceButton.textContent = 'Substituir tudo';

    const mergeButton = document.createElement('button');
    mergeButton.type = 'button';
    mergeButton.className = 'button button--primary';
    mergeButton.textContent = 'Mesclar';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'button button--secondary';
    cancelButton.textContent = 'Cancelar';

    actions.append(replaceButton, mergeButton, cancelButton);
    dialog.append(title, detail, message, actions);

    let settled = false;
    const finish = (value: BackupAction): void => {
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

    replaceButton.addEventListener('click', () => finish('replace'));
    mergeButton.addEventListener('click', () => finish('merge'));
    cancelButton.addEventListener('click', () => finish('cancel'));
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      finish('cancel');
    });

    document.body.appendChild(dialog);
    dialog.showModal();
    cancelButton.focus();
  });
}

function createSection(title: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'page-section settings-section';
  const heading = document.createElement('h2');
  heading.className = 'page-section__title';
  heading.textContent = title;
  section.appendChild(heading);
  return section;
}

function createLabeledInput(
  id: string,
  labelText: string,
  type: 'text' | 'number',
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
  input.type = type;
  input.name = id;
  root.append(label, input);
  return { root, input };
}

function createButton(label: string, variant: 'primary' | 'secondary'): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `button button--${variant}`;
  button.textContent = label;
  return button;
}
