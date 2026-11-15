/**
 * Ícones SVG outline inline, viewBox 24, stroke 2, cor herdada do texto.
 * Nenhum ícone vem de CDN ou biblioteca externa.
 */

export type IconName =
  | 'home'
  | 'list'
  | 'plus'
  | 'report'
  | 'settings'
  | 'search'
  | 'calendar'
  | 'camera'
  | 'back'
  | 'close'
  | 'delete'
  | 'copy'
  | 'alert'
  | 'check';

const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  plus: 'M12 5v14M5 12h14',
  report: 'M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v5h5M9 13h6M9 17h6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.1l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-1.9-1.1L14.7 3h-4l-.4 2.4a7.5 7.5 0 0 0-1.9 1.1l-2.3-.9-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2.2l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 1.9 1.1l.4 2.4h4l.4-2.4a7.5 7.5 0 0 0 1.9-1.1l2.3.9 2-3.4-2-1.5c.1-.4.1-.7.1-1.1Z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.3-4.3',
  calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 3v4M16 3v4M3 10h18',
  camera: 'M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2ZM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  back: 'M19 12H5M11 18l-6-6 6-6',
  close: 'M18 6 6 18M6 6l12 12',
  delete: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5',
  copy: 'M9 9h10v12H9zM5 15V3h10',
  alert: 'M12 8v5M12 16.5h.01M10.3 3.8 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z',
  check: 'M20 6 9 17l-5-5',
};

/** Cria o elemento SVG do ícone. `label` define nome acessível quando não há texto. */
export function createIcon(
  name: IconName,
  options?: { label?: string; decorative?: boolean },
): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', options?.decorative === false ? 'false' : 'true');
  if (options?.label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', options.label);
    svg.removeAttribute('aria-hidden');
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', PATHS[name]);
  svg.appendChild(path);
  return svg;
}
