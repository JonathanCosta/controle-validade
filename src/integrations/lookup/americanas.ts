/**
 * Provider Americanas (ESPECIFICACAO §7.2-§7.7).
 * GET na URL configurada com {ean}; credentials: 'omit'; Accept: application/json;
 * timeout de 8s com AbortController; sem retries; sem cache.
 *
 * Apenas EAN é enviado; a lista de produtos nunca sai do dispositivo (§16).
 * A resposta é sempre tratada como não confiável: ean deve corresponder ao
 * consultado e description deve ser string não vazia.
 */

import { LOOKUP_FAILURE_MESSAGES, type LookupFailureKind, type LookupOutcome, type ProductLookupProvider, type ProductLookupResult } from './product-lookup.ts';

const DEFAULT_TIMEOUT_MS = 8000;

export interface AmericanasLookupProviderOptions {
  urlTemplate: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

interface LookupResponse {
  ean?: unknown;
  description?: unknown;
}

export class AmericanasLookupProvider implements ProductLookupProvider {
  constructor(private readonly options: AmericanasLookupProviderOptions) {}

  /** Contrato canônico: resultado ou null em qualquer falha. */
  async lookup(ean: string): Promise<ProductLookupResult | null> {
    const outcome = await this.lookupWithStatus(ean);
    return outcome.status === 'found' ? outcome.result : null;
  }

  /**
   * Versão detalhada usada pela interface para exibir a mensagem certa (§7.6)
   * sem conhecer detalhes HTTP da fonte.
   */
  async lookupWithStatus(ean: string): Promise<LookupOutcome> {
    const fetchImpl = this.options.fetchImpl ?? fetch;
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    let url: URL;
    try {
      url = new URL(this.options.urlTemplate.replace('{ean}', ean));
    } catch {
      clearTimeout(timer);
      return failed('source-error');
    }

    try {
      const response = await fetchImpl(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        signal: controller.signal,
        referrerPolicy: 'no-referrer',
      });
      clearTimeout(timer);

      if (response.status === 404) {
        return failed('not-found');
      }
      if (response.status === 429) {
        return failed('rate-limited');
      }
      if (!response.ok) {
        return failed('source-error');
      }

      let data: LookupResponse;
      try {
        data = (await response.json()) as LookupResponse;
      } catch {
        // JSON inválido: descartar resposta e permitir digitação (§7.6).
        return failed('source-error');
      }
      return mapResponse(data, ean);
    } catch {
      clearTimeout(timer);
      // AbortError do timeout e falhas de rede/CORS compartilham o mesmo
      // tratamento: cadastro manual permanece disponível.
      return failed('network-error');
    }

    function failed(kind: LookupFailureKind): { status: 'failed'; kind: LookupFailureKind; message: string } {
      return { status: 'failed', kind, message: LOOKUP_FAILURE_MESSAGES[kind] };
    }
  }
}

/** Valida e converte a resposta da fonte para o tipo interno. */
export function mapResponse(
  data: unknown,
  consultedEan: string,
): LookupOutcome {
  if (typeof data !== 'object' || data === null) {
    return { status: 'failed', kind: 'source-error', message: LOOKUP_FAILURE_MESSAGES['source-error'] };
  }
  const record = data as LookupResponse;
  if (typeof record['ean'] !== 'string' || record['ean'] !== consultedEan) {
    return { status: 'failed', kind: 'source-error', message: LOOKUP_FAILURE_MESSAGES['source-error'] };
  }
  if (typeof record['description'] !== 'string' || record['description'].trim() === '') {
    return { status: 'failed', kind: 'not-found', message: LOOKUP_FAILURE_MESSAGES['not-found'] };
  }
  return {
    status: 'found',
    result: {
      ean: consultedEan,
      name: record['description'].trim(),
      brand: null,
    },
  };
}
