/**
 * Erros de validação de domínio, para a interface apresentar mensagens
 * próximas ao campo correspondente (DESIGN_SYSTEM §7.9).
 */

export type ProductField = 'id' | 'name' | 'expiresAt' | 'ean' | 'brand';

export class ProductValidationError extends Error {
  readonly field: ProductField;

  constructor(field: ProductField, message: string) {
    super(message);
    this.name = 'ProductValidationError';
    this.field = field;
  }
}
