/**
 * Tela de cadastro (ESPECIFICACAO §6, DESIGN_SYSTEM §8.3/§8.4).
 * Fluxo focado, sem navegação inferior. Nome e validade obrigatórios;
 * datas passadas permitidas; sem edição após salvar.
 *
 * Scanner: abre por ação explícita; a leitura preenche o EAN e consulta a
 * fonte configurada. Falha de rede/CORS nunca bloqueia o cadastro manual.
 */

import { createPageHeader } from '../../components/page-header.ts';
import { createFormField, type FormField } from '../../components/form-field.ts';
import { showToast } from '../../components/toast.ts';
import { createIcon } from '../../components/icons.ts';
import { ProductValidationError } from '../../domain/errors.ts';
import { isValidEan } from '../../domain/ean.ts';
import { getAppContext } from '../../app/context.ts';
import { navigate } from '../../app/navigation.ts';
import { openScanner, SCANNER_ERROR_MESSAGES } from '../../integrations/scanner.ts';
import { AmericanasLookupProvider } from '../../integrations/lookup/americanas.ts';
import { LOOKUP_FAILURE_MESSAGES, type LookupOutcome } from '../../integrations/lookup/product-lookup.ts';

const NETWORK_FAILURE: LookupOutcome = {
  status: 'failed',
  kind: 'network-error',
  message: LOOKUP_FAILURE_MESSAGES['network-error'],
};

export function renderProductForm(content: HTMLElement): void {
  const header = createPageHeader({
    title: 'Adicionar produto',
    backTarget: '#/inicio',
    backLabel: 'Voltar para o início',
  });
  content.appendChild(header);

  const nameField = createFormField({
    id: 'product-name',
    label: 'Nome do produto',
    type: 'text',
  });
  const expiryField = createFormField({
    id: 'product-expires-at',
    label: 'Validade',
    type: 'date',
  });
  const brandField = createFormField({
    id: 'product-brand',
    label: 'Marca',
    type: 'text',
    optional: true,
  });
  const eanField = createFormField({
    id: 'product-ean',
    label: 'Código de barras',
    type: 'text',
    optional: true,
    hint: 'Identificado pela câmera ou digitado.',
  });
  eanField.input.inputMode = 'numeric';
  eanField.input.pattern = '[0-9]*';

  const scanButton = document.createElement('button');
  scanButton.type = 'button';
  scanButton.className = 'button button--secondary product-form__scan';
  scanButton.appendChild(createIcon('camera'));
  const scanLabel = document.createElement('span');
  scanLabel.textContent = 'Escanear código de barras';
  scanButton.appendChild(scanLabel);

  const lookupStatus = document.createElement('p');
  lookupStatus.className = 'product-form__lookup-status';
  lookupStatus.setAttribute('aria-live', 'polite');

  const submit = document.createElement('button');
  submit.type = 'button';
  submit.className = 'button button--primary form-actions__save';
  submit.textContent = 'Salvar produto';

  const form = document.createElement('form');
  form.className = 'product-form';
  form.noValidate = true;
  form.append(
    nameField.root,
    scanButton,
    eanField.root,
    lookupStatus,
    expiryField.root,
    brandField.root,
    submit,
  );

  let saving = false;
  let scanning = false;

  submit.addEventListener('click', () => {
    void handleSubmit();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleSubmit();
  });

  async function handleSubmit(): Promise<void> {
    if (saving) {
      return; // Impede duplo envio (ESPECIFICACAO §6.7).
    }
    saving = true;
    submit.disabled = true;
    submit.textContent = 'Salvando…';
    for (const field of [nameField, expiryField, brandField, eanField]) {
      field.setError(null);
    }

    const ean = eanField.input.value.trim();
    try {
      await getAppContext().productsService.saveProduct({
        name: nameField.input.value,
        expiresAt: expiryField.input.value,
        brand: brandField.input.value,
        ean: ean === '' ? null : ean,
      });
      showToast('Produto salvo com sucesso.');
      navigate('inicio');
    } catch (error) {
      saving = false;
      submit.disabled = false;
      submit.textContent = 'Salvar produto';
      if (error instanceof ProductValidationError) {
        const field: FormField | undefined =
          error.field === 'name'
            ? nameField
            : error.field === 'expiresAt'
              ? expiryField
              : error.field === 'ean'
                ? eanField
                : error.field === 'brand'
                  ? brandField
                  : undefined;
        field?.setError(error.message);
        (field ?? nameField).input.focus();
      } else {
        // Falha do IndexedDB: preserva os campos para nova tentativa (§6.7).
        showToast('Não foi possível salvar. Tente novamente.', 'error');
      }
    }
  }

  scanButton.addEventListener('click', () => {
    void startScan();
  });

  async function startScan(): Promise<void> {
    if (scanning) {
      return;
    }
    scanning = true;
    scanButton.disabled = true;

    try {
      await openScanner({
        onDetected: (ean) => {
          scanning = false;
          scanButton.disabled = false;
          void handleDetectedEan(ean);
        },
        onError: (message) => {
          scanning = false;
          scanButton.disabled = false;
          showToast(message, 'error');
        },
      });
    } catch {
      scanning = false;
      scanButton.disabled = false;
      showToast(SCANNER_ERROR_MESSAGES.failure, 'error');
    }
  }

  async function handleDetectedEan(ean: string): Promise<void> {
    // Validação de formato e dígito verificador antes de qualquer uso (§6.5).
    if (!isValidEan(ean)) {
      eanField.setError('EAN inválido. Digite o nome do produto manualmente.');
      return;
    }
    eanField.setError(null);
    eanField.input.value = ean;

    const context = getAppContext();

    // Registros locais com o mesmo EAN sugerem o nome já cadastrado —
    // funciona offline e evita consulta desnecessária.
    if (nameField.input.value.trim() === '') {
      if (nameField.input.value.trim() === '') {
        const localMatches = await context.productsService.getProductsByEan(ean);
        const known = localMatches[0];
        if (known) {
          nameField.input.value = known.name;
          lookupStatus.textContent =
            'Produto já cadastrado antes: nome preenchido a partir dos seus registros.';
          return;
        }
      }
    }

    const settings = await context.settingsService.getSettings();
    if (!settings.lookupUrlTemplate.includes('{ean}')) {
      lookupStatus.textContent = LOOKUP_FAILURE_MESSAGES['network-error'];
      return;
    }
    lookupStatus.textContent = 'Consultando a fonte de produtos…';

    let outcome: LookupOutcome;
    try {
      const provider = new AmericanasLookupProvider({
        urlTemplate: settings.lookupUrlTemplate,
      });
      outcome = await provider.lookupWithStatus(ean);
    } catch {
      outcome = NETWORK_FAILURE;
    }

    if (outcome.status === 'found') {
      // Não sobrescrever silenciosamente um nome digitado (§6.4).
      if (nameField.input.value.trim() === '') {
        nameField.input.value = outcome.result.name;
        lookupStatus.textContent = `Produto identificado: ${outcome.result.name}`;
        if (outcome.result.brand) {
          brandField.input.value = outcome.result.brand;
        }
      } else {
        lookupStatus.textContent =
          'Nome mantido: você já havia digitado um nome. Ajuste se quiser.';
      }
    } else if (outcome.status === 'failed') {
      lookupStatus.textContent = outcome.message;
      showToast('Consulta indisponível. Você pode preencher o nome manualmente.', 'error');
    }
  }

  content.appendChild(form);
}
