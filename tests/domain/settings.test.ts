import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SETTINGS,
  validateLookupUrlTemplate,
} from '../../src/domain/settings.ts';

describe('DEFAULT_SETTINGS', () => {
  it('segue os padrões da especificação §4.2', () => {
    expect(DEFAULT_SETTINGS['nearExpiryDays']).toBe(15);
    expect(DEFAULT_SETTINGS['groupingMode']).toBe('date');
    expect(DEFAULT_SETTINGS['lookupUrlTemplate']).toContain('{ean}');
    expect(DEFAULT_SETTINGS['lookupUrlTemplate'].startsWith('https://')).toBe(true);
  });
});

describe('validateLookupUrlTemplate', () => {
  const VALID = 'https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/{ean}';

  it('aceita URL padrão e URLs https com um marcador', () => {
    expect(validateLookupUrlTemplate(VALID).ok).toBe(true);
    expect(validateLookupUrlTemplate(`https://exemplo.com.br/api/ean/{ean}?x=1`).ok).toBe(true);
  });

  it('aceita com espaços nas extremidades', () => {
    expect(validateLookupUrlTemplate(`  ${VALID}  `).ok).toBe(true);
  });

  it('rejeita http (exige HTTPS)', () => {
    const result = validateLookupUrlTemplate('http://exemplo.com.br/ean/{ean}');
    expect(result.ok).toBe(false);
  });

  it('rejeita zero ou dois marcadores {ean}', () => {
    expect(validateLookupUrlTemplate('https://exemplo.com.br/ean/').ok).toBe(false);
    expect(
      validateLookupUrlTemplate('https://exemplo.com.br/{ean}/x/{ean}').ok,
    ).toBe(false);
  });

  it('rejeita usuário/senha embutidos', () => {
    expect(
      validateLookupUrlTemplate('https://user:senha@exemplo.com.br/ean/{ean}').ok,
    ).toBe(false);
  });

  it('rejeita URL malformada e tipos incorretos', () => {
    expect(validateLookupUrlTemplate('https://').ok).toBe(false);
    expect(validateLookupUrlTemplate('não é url {ean}').ok).toBe(false);
    expect(validateLookupUrlTemplate(null).ok).toBe(false);
    expect(validateLookupUrlTemplate(123).ok).toBe(false);
  });
});
