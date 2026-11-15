import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AmericanasLookupProvider,
  mapResponse,
} from '../../../src/integrations/lookup/americanas.ts';
import {
  LOOKUP_FAILURE_MESSAGES,
  type LookupFailureKind,
} from '../../../src/integrations/lookup/product-lookup.ts';

const TEMPLATE = 'https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/{ean}';
const EAN = '7898524349322';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function providerWith(
  impl: (url: string, init?: RequestInit) => Promise<Response>,
  timeoutMs = 8000,
): AmericanasLookupProvider {
  const fetchImpl = vi.fn(impl as unknown as typeof fetch);
  return new AmericanasLookupProvider({
    urlTemplate: TEMPLATE,
    fetchImpl: fetchImpl as unknown as typeof fetch,
    timeoutMs,
  });
}

afterEach(() => {
  vi.useRealTimers();
});

function expectFailed(outcome: Awaited<ReturnType<AmericanasLookupProvider['lookupWithStatus']>>): LookupFailureKind {
  if (outcome.status !== 'failed') {
    throw new Error(`Esperava falha, recebeu: ${JSON.stringify(outcome)}`);
  }
  return outcome.kind;
}

describe('AmericanasLookupProvider — resposta esperada (§7.5)', () => {
  it('mapeia a resposta canônica para o resultado interno', async () => {
    const provider = providerWith(async (url, init) => {
      expect(url).toBe(TEMPLATE.replace('{ean}', EAN));
      expect((init?.headers as Record<string, string>)['Accept']).toBe('application/json');
      expect(init?.credentials).toBe('omit');
      return jsonResponse(200, {
        ean: EAN,
        sapId: '4330862',
        description: 'CR TRAT SALON LINE 1KG',
        price: { regular: 'R$ 28,99', promotional: 'R$ 17,99' },
      });
    });
    const result = await provider.lookup(EAN);
    expect(result).toEqual({ ean: EAN, name: 'CR TRAT SALON LINE 1KG', brand: null });
  });

  it('aplica trim na descrição', async () => {
    const provider = providerWith(
      async () => jsonResponse(200, { ean: EAN, description: '  Café torrado 1kg  ' }),
    );
    const result = await provider.lookup(EAN);
    expect(result?.name).toBe('Café torrado 1kg');
  });

  it('preços e sapId são ignorados', async () => {
    const provider = providerWith(
      async () => jsonResponse(200, { ean: EAN, description: 'Café', price: { regular: 'R$ 99' } }),
    );
    const result = await provider.lookup(EAN);
    expect(result).toEqual({ ean: EAN, name: 'Café', brand: null });
  });
});

describe('AmericanasLookupProvider — falhas (§7.6)', () => {
  it('HTTP 404 → not-found', async () => {
    const provider = providerWith(async () => jsonResponse(404, { message: 'não achou' }));
    const outcome = await provider.lookupWithStatus(EAN);
    expect(outcome).toEqual({ status: 'failed', kind: 'not-found', message: LOOKUP_FAILURE_MESSAGES['not-found'] });
    expect(await provider.lookup(EAN)).toBeNull();
  });

  it('HTTP 429 → rate-limited (indisponibilidade temporária)', async () => {
    const provider = providerWith(async () => jsonResponse(429, {}));
    expect(expectFailed(await provider.lookupWithStatus(EAN))).toBe('rate-limited');
  });

  it('HTTP 500 → source-error (falha da fonte)', async () => {
    const provider = providerWith(async () => jsonResponse(500, {}));
    expect(expectFailed(await provider.lookupWithStatus(EAN))).toBe('source-error');
  });

  it('JSON inválido → descartado como source-error', async () => {
    const provider = providerWith(async () =>
      new Response('{não é json', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    expect(expectFailed(await provider.lookupWithStatus(EAN))).toBe('source-error');
  });

  it('EAN retornado diferente do consultado → source-error', async () => {
    const provider = providerWith(
      async () => jsonResponse(200, { ean: '0000000000000', description: 'Café' }),
    );
    expect(expectFailed(await provider.lookupWithStatus(EAN))).toBe('source-error');
  });

  it('descrição vazia ou ausente → not-found sem preencher nome', async () => {
    const missing = providerWith(async () => jsonResponse(200, { ean: EAN }));
    expect(expectFailed(await missing.lookupWithStatus(EAN))).toBe('not-found');
    const empty = providerWith(async () => jsonResponse(200, { ean: EAN, description: '   ' }));
    expect(expectFailed(await empty.lookupWithStatus(EAN))).toBe('not-found');
  });

  it('erro de rede/CORS → network-error sem lançar', async () => {
    const provider = providerWith(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(expectFailed(await provider.lookupWithStatus(EAN))).toBe('network-error');
    expect(await provider.lookup(EAN)).toBeNull();
  });

  it('timeout de 8s → network-error (AbortController)', async () => {
    vi.useFakeTimers();
    const provider = providerWith(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );
    const promise = provider.lookupWithStatus(EAN);
    vi.advanceTimersByTime(8000);
    expect(expectFailed(await promise)).toBe('network-error');
  });
});

describe('mapResponse', () => {
  it('rejeita tipos hostis sem lançar', () => {
    expect(mapResponse(null, EAN).status).toBe('failed');
    expect(mapResponse('texto', EAN).status).toBe('failed');
    expect(mapResponse(42, EAN).status).toBe('failed');
    expect(mapResponse({ ean: EAN, description: 42 }, EAN).status).toBe('failed');
  });
});
