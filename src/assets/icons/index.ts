/**
 * Catálogo de ícones SVG do Controle de Validade.
 * Renderização segura via createElementNS; nenhum innerHTML é utilizado.
 */
export type IconName =
  | 'home'
  | 'products'
  | 'plus'
  | 'reports'
  | 'settings'
  | 'scan-barcode'
  | 'search'
  | 'trash'
  | 'copy'
  | 'calendar'
  | 'clock'
  | 'alert-circle'
  | 'check-circle'
  | 'x-circle'
  | 'chevron-left'
  | 'chevron-right'
  | 'filter'
  | 'menu'
  | 'more-horizontal'
  | 'info'
  | 'refresh'
  | 'share'
  | 'download'
  | 'upload'
  | 'eye'
  | 'eye-off'
  | 'link'
  | 'camera'
  | 'flashlight'
  | 'package'
  | 'group'
  | 'list'
  | 'backup'
  | 'restore'
  | 'wifi-off'
  | 'check'
  | 'calendar-clock'
  | 'calendar-check'
  | 'ellipsis';

type IconNode = {
  tag: 'path' | 'circle' | 'rect' | 'line' | 'polyline' | 'polygon';
  attrs: Record<string, string | number>;
};

const definitions: Record<IconName, IconNode[]> = {
  'home': [
    { tag: 'path', attrs: {"d": "M3 10.5 12 3l9 7.5"} },
    { tag: 'path', attrs: {"d": "M5.5 9.5V20h13V9.5"} },
    { tag: 'path', attrs: {"d": "M9.5 20v-6h5v6"} },
  ],
  'products': [
    { tag: 'path', attrs: {"d": "m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z"} },
    { tag: 'path', attrs: {"d": "m3.8 7.7 8.2 4.4 8.2-4.4"} },
    { tag: 'path', attrs: {"d": "M12 12.1V21"} },
    { tag: 'path', attrs: {"d": "m8 5.1 8.5 4.5"} },
  ],
  'plus': [
    { tag: 'path', attrs: {"d": "M12 5v14"} },
    { tag: 'path', attrs: {"d": "M5 12h14"} },
  ],
  'reports': [
    { tag: 'path', attrs: {"d": "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"} },
    { tag: 'path', attrs: {"d": "M14 3v5h5"} },
    { tag: 'path', attrs: {"d": "M9 13h6M9 17h4"} },
  ],
  'settings': [
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "3"} },
    { tag: 'path', attrs: {"d": "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.1 1Z"} },
  ],
  'scan-barcode': [
    { tag: 'path', attrs: {"d": "M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"} },
    { tag: 'path', attrs: {"d": "M8 9v6M10.5 8v8M13 9v6M15.5 8v8M18 9v6"} },
  ],
  'search': [
    { tag: 'circle', attrs: {"cx": "10.8", "cy": "10.8", "r": "6.8"} },
    { tag: 'path', attrs: {"d": "m16 16 5 5"} },
  ],
  'trash': [
    { tag: 'path', attrs: {"d": "M4 7h16M10 11v6M14 11v6"} },
    { tag: 'path', attrs: {"d": "m6 7 1 13h10l1-13M9 7V4h6v3"} },
  ],
  'copy': [
    { tag: 'rect', attrs: {"x": "8", "y": "8", "width": "12", "height": "13", "rx": "2"} },
    { tag: 'path', attrs: {"d": "M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"} },
  ],
  'calendar': [
    { tag: 'rect', attrs: {"x": "3.5", "y": "5", "width": "17", "height": "16", "rx": "2"} },
    { tag: 'path', attrs: {"d": "M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"} },
  ],
  'clock': [
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "9"} },
    { tag: 'path', attrs: {"d": "M12 7v5l3.5 2"} },
  ],
  'alert-circle': [
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "9"} },
    { tag: 'path', attrs: {"d": "M12 7v6M12 17h.01"} },
  ],
  'check-circle': [
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "9"} },
    { tag: 'path', attrs: {"d": "m8 12.2 2.6 2.6 5.5-5.7"} },
  ],
  'x-circle': [
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "9"} },
    { tag: 'path', attrs: {"d": "m9 9 6 6m0-6-6 6"} },
  ],
  'chevron-left': [
    { tag: 'path', attrs: {"d": "m15 18-6-6 6-6"} },
  ],
  'chevron-right': [
    { tag: 'path', attrs: {"d": "m9 18 6-6-6-6"} },
  ],
  'filter': [
    { tag: 'path', attrs: {"d": "M3 5h18l-7 8v5l-4 2v-7L3 5Z"} },
  ],
  'menu': [
    { tag: 'path', attrs: {"d": "M4 6h16M4 12h16M4 18h16"} },
  ],
  'more-horizontal': [
    { tag: 'circle', attrs: {"cx": "5", "cy": "12", "r": "1"} },
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "1"} },
    { tag: 'circle', attrs: {"cx": "19", "cy": "12", "r": "1"} },
  ],
  'info': [
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "9"} },
    { tag: 'path', attrs: {"d": "M12 11v5M12 8h.01"} },
  ],
  'refresh': [
    { tag: 'path', attrs: {"d": "M20 7v5h-5M4 17v-5h5"} },
    { tag: 'path', attrs: {"d": "M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3"} },
  ],
  'share': [
    { tag: 'circle', attrs: {"cx": "18", "cy": "5", "r": "2.5"} },
    { tag: 'circle', attrs: {"cx": "6", "cy": "12", "r": "2.5"} },
    { tag: 'circle', attrs: {"cx": "18", "cy": "19", "r": "2.5"} },
    { tag: 'path', attrs: {"d": "m8.2 10.8 7.5-4.5M8.2 13.2l7.5 4.5"} },
  ],
  'download': [
    { tag: 'path', attrs: {"d": "M12 3v12m-4-4 4 4 4-4"} },
    { tag: 'path', attrs: {"d": "M4 17v3h16v-3"} },
  ],
  'upload': [
    { tag: 'path', attrs: {"d": "M12 15V3m-4 4 4-4 4 4"} },
    { tag: 'path', attrs: {"d": "M4 15v5h16v-5"} },
  ],
  'eye': [
    { tag: 'path', attrs: {"d": "M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"} },
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "2.7"} },
  ],
  'eye-off': [
    { tag: 'path', attrs: {"d": "m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6.2 0 9.5 6 9.5 6a15 15 0 0 1-3 3.7M6.2 6.8C3.8 8.4 2.5 12 2.5 12s3.3 6 9.5 6c1.1 0 2.1-.2 3-.5"} },
    { tag: 'path', attrs: {"d": "M9.9 9.9a3 3 0 0 0 4.2 4.2"} },
  ],
  'link': [
    { tag: 'path', attrs: {"d": "M10 13.5 14 9.5"} },
    { tag: 'path', attrs: {"d": "M8.2 15.8 6.8 17.2a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M15.8 8.2l1.4-1.4a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"} },
  ],
  'camera': [
    { tag: 'path', attrs: {"d": "M4 8h3l1.5-2h7L17 8h3a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 8Z"} },
    { tag: 'circle', attrs: {"cx": "12", "cy": "13.5", "r": "3.5"} },
  ],
  'flashlight': [
    { tag: 'path', attrs: {"d": "M8 3h8l1 5-2.5 3v9a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-9L7 8l1-5Z"} },
    { tag: 'path', attrs: {"d": "M8 8h8"} },
  ],
  'package': [
    { tag: 'path', attrs: {"d": "m12 3 9 4.5v9L12 21l-9-4.5v-9L12 3Z"} },
    { tag: 'path', attrs: {"d": "m3.5 7.7 8.5 4.5 8.5-4.5M12 12.2V21"} },
  ],
  'group': [
    { tag: 'circle', attrs: {"cx": "9", "cy": "8", "r": "3"} },
    { tag: 'path', attrs: {"d": "M3 20v-1a6 6 0 0 1 12 0v1"} },
    { tag: 'path', attrs: {"d": "M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.5V20"} },
  ],
  'list': [
    { tag: 'path', attrs: {"d": "M9 6h11M9 12h11M9 18h11"} },
    { tag: 'path', attrs: {"d": "M4 6h.01M4 12h.01M4 18h.01"} },
  ],
  'backup': [
    { tag: 'path', attrs: {"d": "M12 3v12m-4-4 4 4 4-4"} },
    { tag: 'path', attrs: {"d": "M4 17v3h16v-3M6 5h3"} },
  ],
  'restore': [
    { tag: 'path', attrs: {"d": "M4 10a8 8 0 1 1 1 7"} },
    { tag: 'path', attrs: {"d": "M4 4v6h6M12 8v4l3 2"} },
  ],
  'wifi-off': [
    { tag: 'path', attrs: {"d": "M3 8a14 14 0 0 1 14-2M8 13a7 7 0 0 1 8-.5M12 18h.01M2 2l20 20"} },
  ],
  'check': [
    { tag: 'path', attrs: {"d": "m5 12.5 4.2 4.2L19 7"} },
  ],
  'calendar-clock': [
    { tag: 'rect', attrs: {"x": "3", "y": "4.5", "width": "13", "height": "16", "rx": "2"} },
    { tag: 'path', attrs: {"d": "M7 2.5v4M12 2.5v4M3 9h13"} },
    { tag: 'circle', attrs: {"cx": "17.5", "cy": "16.5", "r": "4"} },
    { tag: 'path', attrs: {"d": "M17.5 14.5v2l1.5 1"} },
  ],
  'calendar-check': [
    { tag: 'rect', attrs: {"x": "3", "y": "4.5", "width": "18", "height": "17", "rx": "2.5"} },
    { tag: 'path', attrs: {"d": "M7 2.5v4M17 2.5v4M3 9h18"} },
    { tag: 'path', attrs: {"d": "m8 14 2.5 2.5L16.5 11"} },
  ],
  'ellipsis': [
    { tag: 'circle', attrs: {"cx": "5", "cy": "12", "r": "1"} },
    { tag: 'circle', attrs: {"cx": "12", "cy": "12", "r": "1"} },
    { tag: 'circle', attrs: {"cx": "19", "cy": "12", "r": "1"} },
  ],
};

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface RenderIconOptions {
  size?: number | string;
  className?: string;
  ariaLabel?: string;
  strokeWidth?: number;
}

/** Cria e retorna um SVG acessível, sem interpolação de HTML. */
export function renderIcon(
  name: IconName,
  options: RenderIconOptions = {},
): SVGSVGElement {
  const {
    size = 24,
    className,
    ariaLabel,
    strokeWidth = 1.8,
  } = options;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', String(strokeWidth));
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('focusable', 'false');

  if (className) svg.setAttribute('class', className);

  if (ariaLabel) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', ariaLabel);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }

  for (const node of definitions[name]) {
    const element = document.createElementNS(SVG_NS, node.tag);
    for (const [attribute, value] of Object.entries(node.attrs)) {
      element.setAttribute(attribute, String(value));
    }
    svg.appendChild(element);
  }

  return svg;
}

export const availableIcons = Object.keys(definitions) as IconName[];
