/**
 * Tela de cadastro (ESPECIFICACAO §6, DESIGN_SYSTEM §8.3).
 * Fluxo focado, sem navegação inferior. Nome e validade obrigatórios;
 * datas passadas permitidas; sem edição após salvar.
 * O botão de scanner chega na Etapa 4 — aqui o cadastro é 100% manual e offline.
 */

import { createPageHeader } from '../../components/page-header.ts';
import { createFormField, type FormField } from '../../components/form-field.ts';
import { showToast } from '../../components/toast.ts';
import { ProductValidationError } from '../../domain/errors.ts';
import { getAppContext } from '../../app/context.ts';
import { navigate } from '../../app/navigation.ts';

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

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'button button--primary form-actions__save';
  submit.textContent = 'Salvar produto';

  const form = document.createElement('form');
  form.className = 'product-form';
  form.noValidate = true;
  form.append(nameField.root, expiryField.root, brandField.root, submit);

  let saving = false;

  form.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (saving) {
      return; // Impede duplo envio (ESPECIFICACAO §6.7).
    }
    saving = true;
    submit.disabled = true;
    submit.textContent = 'Salvando…';
    for (const field of [nameField, expiryField, brandField]) {
      field.setError(null);
    }

    try {
      await getAppContext().productsService.saveProduct({
        name: nameField.input.value,
        expiresAt: expiryField.input.value,
        brand: brandField.input.value,
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

  content.appendChild(form);
}
