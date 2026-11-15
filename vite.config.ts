import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

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
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'],
      manifest: {
        name: 'Controle de Validade',
        short_name: 'Validades',
        lang: 'pt-BR',
        description: 'Acompanhe as datas de vencimento dos seus produtos.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#F7F7F6',
        background_color: '#F7F7F6',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
