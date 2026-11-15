import { defineConfig } from 'vite';

// Caminho-base configurável para o GitHub Pages.
// Raiz: VITE_BASE_PATH=/ | Projeto: VITE_BASE_PATH=/<repo>/
// Validado para evitar base malformada ou hostil (ex.: //host/) no build de CI.
const rawBase = process.env.VITE_BASE_PATH ?? '/';
const basePattern = /^\/[A-Za-z0-9._-]+\/$/;
if (rawBase !== '/' && !basePattern.test(rawBase)) {
  throw new Error(
    `VITE_BASE_PATH inválido: "${rawBase}". Use "/" ou "/<subcaminho>/".`,
  );
}
const base = rawBase;

export default defineConfig({
  base,
});
