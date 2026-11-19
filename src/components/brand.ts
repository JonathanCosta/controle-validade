/**
 * Marca do Controle de Validade.
 * Os arquivos SVG oficiais vivem em src/assets/brand e são processados pelo
 * Vite com o `base` real da publicação (inclusive subdiretório no GitHub Pages).
 * A marca é monocromática: as cores de status não são usadas aqui.
 */

import symbolUrl from '../assets/brand/symbol.svg';
import logoHorizontalUrl from '../assets/brand/logo-horizontal.svg';
import logoVerticalUrl from '../assets/brand/logo-vertical.svg';

export interface BrandImageOptions {
  className?: string;
  /** Nome acessível; sem ele a imagem é decorativa. */
  label?: string;
}

export function createBrandSymbol(options: BrandImageOptions = {}): HTMLImageElement {
  const image = createBrandImage(symbolUrl, 24, 24, options);
  if (!options.label) {
    image.setAttribute('aria-hidden', 'true');
  }
  return image;
}

export function createBrandLogo(
  variant: 'horizontal' | 'vertical',
  options: BrandImageOptions = {},
): HTMLImageElement {
  if (variant === 'horizontal') {
    return createBrandImage(logoHorizontalUrl, 340, 64, options);
  }
  return createBrandImage(logoVerticalUrl, 220, 132, options);
}

function createBrandImage(
  src: string,
  width: number,
  height: number,
  options: BrandImageOptions,
): HTMLImageElement {
  const image = document.createElement('img');
  image.src = src;
  image.width = width;
  image.height = height;
  image.alt = options.label ?? '';
  image.decoding = 'async';
  if (options.className) {
    image.className = options.className;
  }
  return image;
}
