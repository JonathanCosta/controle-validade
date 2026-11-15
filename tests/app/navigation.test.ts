import { describe, expect, it } from 'vitest';

import { parseRoute, routeToHash } from '../../src/app/navigation.ts';

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
