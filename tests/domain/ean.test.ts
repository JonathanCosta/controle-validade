import { describe, expect, it } from 'vitest';

import { isValidEan } from '../../src/domain/ean.ts';

describe('isValidEan — EAN-13', () => {
  it('aceita EAN-13 válido com dígito verificador correto', () => {
    // Exemplo validado pelo usuário na especificação
    expect(isValidEan('7898524349322')).toBe(true);
    expect(isValidEan('7890000000000')).toBe(true);
  });

  it('rejeita dígito verificador incorreto', () => {
    expect(isValidEan('7898524349323')).toBe(false);
    expect(isValidEan('7890000000001')).toBe(false);
  });

  it('rejeita comprimento incorreto', () => {
    expect(isValidEan('789852434932')).toBe(false); // 12 dígitos
    expect(isValidEan('78985243493221')).toBe(false); // 14 dígitos
    expect(isValidEan('')).toBe(false);
  });

  it('rejeita caracteres não numéricos', () => {
    expect(isValidEan('789852434932a')).toBe(false);
    expect(isValidEan('78985-24349322')).toBe(false);
  });

  it('preserva zeros à esquerda', () => {
    // 0000000000017: dígito verificador válido para EAN-13
    expect(isValidEan('0000000000017')).toBe(true);
    expect(isValidEan('0000000000008')).toBe(false);
  });
});

describe('isValidEan — EAN-8', () => {
  it('aceita EAN-8 válido', () => {
    expect(isValidEan('73513537')).toBe(true);
    expect(isValidEan('00000000')).toBe(true);
  });

  it('rejeita dígito verificador incorreto', () => {
    expect(isValidEan('73513538')).toBe(false);
  });

  it('rejeita comprimentos que não são 8 nem 13', () => {
    expect(isValidEan('735135')).toBe(false);
    expect(isValidEan('735135373')).toBe(false);
    expect(isValidEan('12345678901234567890')).toBe(false);
  });
});

describe('isValidEan — entradas hostis', () => {
  it('rejeita tipos não string', () => {
    expect(isValidEan(null)).toBe(false);
    expect(isValidEan(undefined)).toBe(false);
    expect(isValidEan(7898524349322)).toBe(false);
  });
});
