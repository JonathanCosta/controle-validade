/**
 * Campo de formulário com label visível, mensagem de erro acessível
 * e dimensões do design system (DESIGN_SYSTEM §7.9, §12).
 */

export interface FormField {
  root: HTMLElement;
  input: HTMLInputElement;
  setError(message: string | null): void;
}

export interface FormFieldOptions {
  id: string;
  label: string;
  type: 'text' | 'date';
  optional?: boolean;
  hint?: string;
}

export function createFormField(options: FormFieldOptions): FormField {
  const root = document.createElement('div');
  root.className = 'field';

  const label = document.createElement('label');
  label.className = 'field__label';
  label.htmlFor = options.id;
  label.textContent = options.optional ? `${options.label} (opcional)` : options.label;
  root.appendChild(label);

  const input = document.createElement('input');
  input.className = 'field__input';
  input.id = options.id;
  input.type = options.type;
  input.name = options.id;
  input.autocomplete = 'off';

  const describedByIds: string[] = [];
  if (options.hint) {
    const hint = document.createElement('p');
    hint.className = 'field__hint';
    hint.id = `${options.id}-hint`;
    hint.textContent = options.hint;
    root.appendChild(hint);
    describedByIds.push(hint.id);
  }

  const error = document.createElement('p');
  error.className = 'field__error';
  error.id = `${options.id}-error`;
  root.appendChild(error);

  function setError(message: string | null): void {
    error.textContent = message ?? '';
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (!describedByIds.includes(error.id)) {
        describedByIds.push(error.id);
      }
      input.setAttribute('aria-describedby', describedByIds.join(' '));
    } else {
      input.removeAttribute('aria-invalid');
      const hintOnly = describedByIds.filter((id) => id !== error.id);
      if (hintOnly.length > 0) {
        input.setAttribute('aria-describedby', hintOnly.join(' '));
      } else {
        input.removeAttribute('aria-describedby');
      }
    }
  }

  root.appendChild(input);
  // O erro precisa vir depois do input na ordem de leitura.
  root.insertBefore(error, input.nextSibling);

  return { root, input, setError };
}
