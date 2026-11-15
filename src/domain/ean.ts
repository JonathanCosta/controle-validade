/**
 * Validação de EAN-8 e EAN-13, com dígito verificador.
 * EAN é tratado como string para preservar zeros à esquerda (ESPECIFICACAO §6.5).
 */

const EAN_PATTERN = /^\d{8}$|^\d{13}$/;

/** Calcula o dígito verificador a partir dos dígitos precedentes. */
function checkDigit(digits: number[]): number {
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits[i];
    if (digit === undefined) {
      throw new RangeError('Dígito ausente no cálculo do EAN.');
    }
    // Da direita para a esquerda, os pesos alternam 3, 1, 3, 1...
    const weight = (digits.length - i) % 2 === 1 ? 3 : 1;
    sum += digit * weight;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Valida comprimento (8 ou 13), caracteres numéricos e dígito verificador.
 */
export function isValidEan(value: unknown): value is string {
  if (typeof value !== 'string' || !EAN_PATTERN.test(value)) {
    return false;
  }
  const digits = value.split('').map(Number);
  const informed = digits.pop();
  if (informed === undefined) {
    return false;
  }
  return checkDigit(digits) === informed;
}
