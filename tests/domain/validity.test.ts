import { describe, expect, it } from 'vitest';

import { getValidityStatus, STATUS_LABELS } from '../../src/domain/validity.ts';

const TODAY = '2026-11-12';
const NEAR = 15;

describe('getValidityStatus — limites da especificação §5.4', () => {
  it('com today=2026-11-12 e nearExpiryDays=15', () => {
    expect(getValidityStatus('2026-11-11', TODAY, NEAR)).toBe('expired');
    expect(getValidityStatus('2026-11-12', TODAY, NEAR)).toBe('today');
    expect(getValidityStatus('2026-11-13', TODAY, NEAR)).toBe('upcoming');
    expect(getValidityStatus('2026-11-27', TODAY, NEAR)).toBe('upcoming');
    expect(getValidityStatus('2026-11-28', TODAY, NEAR)).toBe('valid');
  });

  it('limite de 15 dias é inclusivo; 16 dias já é valid', () => {
    expect(getValidityStatus('2026-11-27', TODAY, 15)).toBe('upcoming');
    expect(getValidityStatus('2026-11-28', TODAY, 15)).toBe('valid');
  });

  it('funciona com outros limites configurados', () => {
    expect(getValidityStatus('2026-11-14', TODAY, 2)).toBe('upcoming');
    expect(getValidityStatus('2026-11-15', TODAY, 2)).toBe('valid');
    expect(getValidityStatus('2026-11-12', TODAY, 1)).toBe('today');
    expect(getValidityStatus('2026-11-12', TODAY, 365)).toBe('today');
  });

  it('datas muito antigas e muito distantes', () => {
    expect(getValidityStatus('2020-01-01', TODAY, NEAR)).toBe('expired');
    expect(getValidityStatus('2099-12-31', TODAY, NEAR)).toBe('valid');
  });

  it('virada de mês e de ano', () => {
    // 2026-11-30 fica 18 dias à frente: dentro do limite estendido de 20
    expect(getValidityStatus('2026-11-30', TODAY, 20)).toBe('upcoming');
    expect(getValidityStatus('2026-11-30', TODAY, NEAR)).toBe('valid');
    expect(getValidityStatus('2026-12-31', TODAY, 50)).toBe('upcoming');
    expect(getValidityStatus('2027-01-01', TODAY, 50)).toBe('upcoming');
    expect(getValidityStatus('2027-01-01', TODAY, 49)).toBe('valid');
  });
});

describe('STATUS_LABELS', () => {
  it('contém rótulos pt-BR para os quatro status', () => {
    expect(STATUS_LABELS['expired']).toBe('Vencido');
    expect(STATUS_LABELS['today']).toBe('Vence hoje');
    expect(STATUS_LABELS['upcoming']).toBe('Próximo do vencimento');
    expect(STATUS_LABELS['valid']).toBe('Dentro da validade');
  });
});
