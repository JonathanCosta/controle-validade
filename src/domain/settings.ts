/**
 * Configurações locais da aplicação (ESPECIFICACAO §4.2, §11).
 * Alterar configurações nunca altera registros de produtos.
 */

export type GroupingMode = 'date' | 'name';

export interface AppSettings {
  /** Inteiro de 1 a 365; padrão 15. */
  nearExpiryDays: number;
  /** URL HTTPS com exatamente um marcador {ean}. */
  lookupUrlTemplate: string;
  /** Modo de agrupamento inicial e última preferência escolhida. */
  groupingMode: GroupingMode;
}

export const DEFAULT_SETTINGS: AppSettings = {
  nearExpiryDays: 15,
  lookupUrlTemplate:
    'https://controle-validade-americanas-worker.jonathan-martins.workers.dev/api/americanas/{ean}',
  groupingMode: 'date',
};

/**
 * Normaliza uma configuração vinda de fonte não confiável (registro corrompido
 * no banco ou backup futuro), aplicando fallback por campo para os padrões.
 * Reutiliza os validadores do domínio; nunca lança.
 */
export function sanitizeSettings(candidate: unknown): AppSettings {
  const fallback = { ...DEFAULT_SETTINGS };
  if (typeof candidate !== 'object' || candidate === null) {
    return fallback;
  }
  const record = candidate as Record<string, unknown>;
  return {
    nearExpiryDays: isValidNearExpiryDays(record['nearExpiryDays'])
      ? record['nearExpiryDays']
      : fallback['nearExpiryDays'],
    lookupUrlTemplate: validateLookupUrlTemplate(record['lookupUrlTemplate']).ok
      ? (record['lookupUrlTemplate'] as string).trim()
      : fallback['lookupUrlTemplate'],
    groupingMode: isGroupingMode(record['groupingMode'])
      ? record['groupingMode']
      : fallback['groupingMode'],
  };
}

export function isValidNearExpiryDays(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 365
  );
}

export function isGroupingMode(value: unknown): value is GroupingMode {
  return value === 'date' || value === 'name';
}

export interface LookupUrlValidation {
  ok: boolean;
  reason?: string;
}

/**
 * Valida a URL de consulta configurada (ESPECIFICACAO §7.3):
 * - https com origem válida;
 * - exatamente um marcador literal `{ean}`;
 * - sem usuário/senha embutidos;
 * - URL testada com um EAN de exemplo no lugar do marcador.
 */
export function validateLookupUrlTemplate(
  template: unknown,
): LookupUrlValidation {
  if (typeof template !== 'string') {
    return { ok: false, reason: 'A URL de consulta precisa ser um texto.' };
  }
  const trimmed = template.trim();
  if (trimmed === '') {
    return { ok: false, reason: 'Informe a URL de consulta.' };
  }
  const occurrences = trimmed.split('{ean}').length - 1;
  if (occurrences !== 1) {
    return {
      ok: false,
      reason: 'A URL precisa conter exatamente um marcador {ean}.',
    };
  }
  let url: URL;
  try {
    url = new URL(trimmed.replace('{ean}', '7898524349322'));
  } catch {
    return { ok: false, reason: 'A URL de consulta é inválida.' };
  }
  if (url.protocol !== 'https:') {
    return { ok: false, reason: 'A URL precisa usar HTTPS.' };
  }
  if (url.username !== '' || url.password !== '') {
    return {
      ok: false,
      reason: 'A URL não pode conter usuário ou senha embutidos.',
    };
  }
  return { ok: true };
}
