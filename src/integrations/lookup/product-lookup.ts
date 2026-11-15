/**
 * Contrato de consulta de produto por EAN (ESPECIFICACAO §7.1).
 * A tela de cadastro não conhece detalhes da Americanas: usa apenas
 * ProductLookupProvider e os tipos definidos aqui.
 */

export interface ProductLookupResult {
  ean: string;
  name: string;
  brand: string | null;
}

/**
 * Falhas mapeadas da especificação §7.6 para mensagens distintas na interface.
 * Nenhuma falha bloqueia o cadastro manual.
 */
export type LookupFailureKind =
  | 'not-found'
  | 'rate-limited'
  | 'source-error'
  | 'network-error';

export type LookupOutcome =
  | { status: 'found'; result: ProductLookupResult }
  | { status: 'failed'; kind: LookupFailureKind; message: string };

/** Provider canônico: null para qualquer falha. */
export interface ProductLookupProvider {
  lookup(ean: string): Promise<ProductLookupResult | null>;
}

/** Mensagens pt-BR das falhas (ESPECIFICACAO §7.6/§15). */
export const LOOKUP_FAILURE_MESSAGES: Record<LookupFailureKind, string> = {
  'not-found': 'Produto não encontrado na fonte de consulta. Preencha o nome manualmente.',
  'rate-limited': 'A fonte de consulta está temporariamente indisponível. Tente novamente em instantes ou preencha o nome manualmente.',
  'source-error': 'A fonte de consulta falhou. Preencha o nome manualmente.',
  'network-error': 'Consulta indisponível agora. Você pode continuar digitando o nome.',
};
