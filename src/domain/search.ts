/**
 * Normalização para busca e agrupamento por nome (ESPECIFICACAO §9.2, §9.4).
 * O texto armazenado nunca é alterado.
 */

/** Remove acentos, caixa e espaços externos para comparação/busca. */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

/** Normalização usada para agrupar nomes iguais (acentos, espaços externos e caixa). */
export function normalizeNameKey(value: string): string {
  return normalizeSearch(value);
}

/** Compara nomes normalizados para ordenação determinística. */
export function compareNormalizedName(a: string, b: string): number {
  return normalizeSearch(a).localeCompare(normalizeSearch(b), 'pt-BR');
}
