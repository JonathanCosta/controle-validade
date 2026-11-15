---
name: pwa-offline
description: Use ao alterar vite.config, vite-plugin-pwa, manifest, Service Worker, cache, GitHub Pages, atualização da aplicação ou comportamento offline.
---

# PWA e funcionamento offline

## Objetivo

- A aplicação é uma PWA estática hospedada no GitHub Pages.
- O núcleo do produto deve funcionar localmente após o primeiro carregamento bem-sucedido e cache dos arquivos da aplicação.
- O banco de dados é IndexedDB; o Service Worker armazena os arquivos da aplicação, não substitui nem limpa os dados.
- Não introduzir backend, banco remoto, sincronização ou serviço de push.

## vite-plugin-pwa

Usar `vite-plugin-pwa` com estratégia `generateSW`, salvo motivo técnico documentado para outra estratégia.

Configuração-base:

- `registerType: 'prompt'`.
- `workbox.globPatterns` deve incluir os arquivos realmente necessários ao shell: HTML, JS, CSS, SVG, PNG, ICO e WOFF2, ajustados ao output real do Vite.
- `navigateFallback` deve atender a rota de entrada da PWA e respeitar o `base` de publicação.
- Não criar runtime caching para a API da Americanas; a consulta é externa e opcional.
- Não fazer cache de respostas de consulta, preços, cookies ou dados do usuário.
- Garantir que o manifest seja gerado e incluído no build.

## GitHub Pages e base path

- O projeto pode ser publicado em domínio raiz ou em subcaminho `/<nome-do-repositorio>/`.
- Não assumir que a aplicação está na raiz do domínio.
- Configurar `base`, `start_url`, `scope`, caminhos de manifest, ícones e fallback de navegação de forma coerente com o destino real do GitHub Pages.
- Preferir caminhos relativos quando apropriado e verificar o `dist` gerado.
- Não alterar `CNAME`, domínio, workflow ou configuração de Pages de outro projeto sem solicitação explícita.
- Validar navegação direta e refresh em todas as rotas hash da aplicação.

## Manifest

- `display: 'standalone'`.
- Orientação preferencial `portrait`, sem bloquear a rotação do dispositivo.
- Ícones locais de 192x192 e 512x512, incluindo versão `maskable` adequada.
- `start_url` e `scope` devem respeitar a base de publicação.
- Nome, nome curto, cores e ícones devem refletir o Controle de Validade.
- Não carregar ícones, fontes ou imagens essenciais de CDN.

## Estratégia offline

Depois do primeiro carregamento completo e instalação/cache do app shell, sem rede devem continuar disponíveis:

- abrir e navegar pela aplicação;
- cadastrar produto manualmente;
- abrir a câmera e ler EAN-8/EAN-13, desde que navegador/câmera permitam;
- consultar, buscar, filtrar e agrupar registros locais;
- calcular situações de validade;
- excluir registros;
- gerar e copiar relatórios;
- exportar e importar backups;
- alterar configurações locais.

Limitação explícita: a consulta à Americanas ou outra fonte externa exige internet. Offline, o EAN pode ser lido e guardado no formulário, mas o nome deve ser digitado ou sugerido a partir de um registro local já conhecido. A falha da consulta nunca pode bloquear o cadastro.

## Recursos externos em runtime

- Proibidos CDN de JavaScript/CSS, Google Fonts remotas, analytics, trackers e recursos externos necessários para renderização ou operação local.
- Empacotar fontes, estilos, ícones e scripts no build.
- Exceção permitida: requisição online explícita e opcional para a fonte de identificação configurada pelo usuário (inicialmente Americanas). Essa requisição não é necessária para utilizar o restante do app.
- Não adicionar outros endpoints externos sem requisito aprovado.

## Atualização da aplicação

Com `registerType: 'prompt'`:

- Implementar `registerSW` usando `virtual:pwa-register`.
- Tratar `onNeedRefresh` e exibir aviso não intrusivo de nova versão.
- A nova versão não deve recarregar automaticamente durante cadastro, scanner aberto ou operação de importação/exportação.
- Permitir adiar a atualização.
- Ao confirmar, encerrar recursos temporários e chamar `updateSW()`.
- Tratar `onOfflineReady` com aviso discreto de que o app está pronto para uso offline.
- Atualização de frontend não pode apagar IndexedDB.
- Alterações de schema exigem migração versionada conforme a skill `db-architecture`.

## Persistência de armazenamento

- Verificar `navigator.storage?.persisted` e `navigator.storage?.persist` quando disponíveis.
- Solicitar persistência no momento adequado, preferencialmente após a primeira interação/instalação, sem bloquear o início da aplicação.
- Tratar indisponibilidade, rejeição ou concessão negada sem erro fatal.
- Exibir o estado de persistência de forma informativa nas configurações; não mostrar alerta bloqueante a cada inicialização.
- A concessão não substitui backup manual: dados locais ainda podem ser removidos pelo usuário ou pelo navegador.

## Critérios de aceite

- Build funciona na raiz e no subcaminho configurado.
- Manifest, ícones e Service Worker apontam para caminhos corretos.
- App pode ser instalado em navegador móvel compatível.
- Após primeiro carregamento concluído, teste em modo avião confirma operações locais.
- Consulta externa indisponível não impede cadastro manual.
- Atualização fica pendente até ação do usuário e não interrompe operação em andamento.
- Atualização da aplicação preserva todos os registros do IndexedDB.
