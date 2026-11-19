import { describe, expect, it } from 'vitest';

import { isKnownRouteHash, parseRoute, routeToHash } from '../../src/app/navigation.ts';

describe('parseRoute', () => {
  it('reconhece as cinco rotas da especificação', () => {
    expect(parseRoute('#/inicio')).toBe('inicio');
    expect(parseRoute('#/produtos')).toBe('produtos');
    expect(parseRoute('#/novo')).toBe('novo');
    expect(parseRoute('#/relatorios')).toBe('relatorios');
    expect(parseRoute('#/configuracoes')).toBe('configuracoes');
  });

  it('aceita hash sem barra inicial', () => {
    expect(parseRoute('#produtos')).toBe('produtos');
  });

  it('desconhece rota e volta para inicio', () => {
    expect(parseRoute('#/qualquer-coisa')).toBe('inicio');
    expect(parseRoute('#')).toBe('inicio');
    expect(parseRoute('')).toBe('inicio');
  });

  it('ignora query na rota', () => {
    expect(parseRoute('#/produtos?filtro=vencidos')).toBe('produtos');
  });
});

describe('routeToHash', () => {
  it('produz hash no formato #/rota', () => {
    expect(routeToHash('inicio')).toBe('#/inicio');
    expect(routeToHash('novo')).toBe('#/novo');
  });
});

describe('isKnownRouteHash', () => {
  it('aceita as rotas conhecidas com e sem query string', () => {
    expect(isKnownRouteHash('#/inicio')).toBe(true);
    expect(isKnownRouteHash('#/produtos')).toBe(true);
    // Indicadores da visão geral abrem a lista já filtrada (§8.2).
    expect(isKnownRouteHash('#/produtos?status=expired')).toBe(true);
    expect(isKnownRouteHash('#/produtos?status=upcoming')).toBe(true);
  });

  it('rejeita hash desconhecido ou vazio', () => {
    expect(isKnownRouteHash('#/qualquer-coisa')).toBe(false);
    expect(isKnownRouteHash('#/produtos-invalidos')).toBe(false);
    expect(isKnownRouteHash('')).toBe(false);
  });
});
