import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { availableIcons } from '../../src/assets/icons/index.ts';

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), '../../src/assets/icons');

describe('catálogo de ícones', () => {
  it('não repete nomes', () => {
    expect(new Set(availableIcons).size).toBe(availableIcons.length);
  });

  it('mantém um SVG fonte para cada ícone do catálogo', () => {
    const files = readdirSync(iconsDir)
      .filter((file) => file.endsWith('.svg'))
      .map((file) => file.slice(0, -'.svg'.length))
      .sort();

    expect(files).toEqual([...availableIcons].sort());
  });
});
