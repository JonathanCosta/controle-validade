/**
 * Navegação baseada em hash, sem roteador externo.
 * Rotas: #/inicio, #/produtos, #/novo, #/relatorios, #/configuracoes.
 */

export type RouteId = 'inicio' | 'produtos' | 'novo' | 'relatorios' | 'configuracoes';

export const ROUTES: readonly RouteId[] = ['inicio', 'produtos', 'novo', 'relatorios', 'configuracoes'];

/** Converte o hash atual em id de rota; rota desconhecida volta para `inicio`. */
export function parseRoute(hash: string): RouteId {
  const path = hash.replace(/^#\/?/, '').split('?')[0] ?? '';
  switch (path) {
    case 'produtos':
      return 'produtos';
    case 'novo':
      return 'novo';
    case 'relatorios':
      return 'relatorios';
    case 'configuracoes':
      return 'configuracoes';
    case 'inicio':
      return 'inicio';
    default:
      return 'inicio';
  }
}

/** Hash correspondente a uma rota. */
export function routeToHash(route: RouteId): string {
  return `#/${route}`;
}

/** Substitui o hash do navegador (dispara hashchange se diferente). */
export function navigate(route: RouteId): void {
  const target = routeToHash(route);
  if (window.location.hash !== target) {
    window.location.hash = target;
  }
}
