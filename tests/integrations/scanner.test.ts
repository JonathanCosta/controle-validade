import { describe, expect, it } from 'vitest';

import {
  detectNativeBarcodeSupport,
  SCANNER_ERROR_MESSAGES,
  type BarcodeDetectorConstructor,
} from '../../src/integrations/scanner.ts';

function fakeDetectorCtor(formats: string[]): BarcodeDetectorConstructor {
  class FakeDetector {
    constructor() {
      if (formats.includes('ean_13') && formats.includes('ean_8') && formats.includes('fail-init')) {
        throw new Error('detector quebrado');
      }
    }
    static async getSupportedFormats(): Promise<string[]> {
      return formats;
    }
    async detect(): Promise<Array<{ rawValue: string }>> {
      return [];
    }
  }
  return FakeDetector as unknown as BarcodeDetectorConstructor;
}

describe('detectNativeBarcodeSupport', () => {
  it('aceita quando ean_8 e ean_13 estão suportados', async () => {
    expect(await detectNativeBarcodeSupport(fakeDetectorCtor(['ean_13', 'ean_8', 'qr_code']))).toBe(true);
  });

  it('rejeita quando falta um dos formatos necessários', async () => {
    expect(await detectNativeBarcodeSupport(fakeDetectorCtor(['ean_13', 'qr_code']))).toBe(false);
    expect(await detectNativeBarcodeSupport(fakeDetectorCtor(['ean_8']))).toBe(false);
    expect(await detectNativeBarcodeSupport(fakeDetectorCtor([]))).toBe(false);
  });

  it('rejeita quando a API não existe ou não tem getSupportedFormats', async () => {
    expect(await detectNativeBarcodeSupport(undefined)).toBe(false);
    expect(await detectNativeBarcodeSupport({} as BarcodeDetectorConstructor)).toBe(false);
  });

  it('rejeita quando a criação do detector falha', async () => {
    expect(
      await detectNativeBarcodeSupport(fakeDetectorCtor(['ean_13', 'ean_8', 'fail-init'])),
    ).toBe(false);
  });
});

describe('SCANNER_ERROR_MESSAGES', () => {
  it('todas as mensagens oferecem alternativa manual', () => {
    for (const message of Object.values(SCANNER_ERROR_MESSAGES)) {
      expect(message).toMatch(/digi(t|a)/i);
    }
  });
});
