---
name: design-system
description: Use ao criar ou alterar qualquer tela, componente visual, CSS, navegação, formulário, estado visual, animação ou interação do Controle de Validade. Leia DESIGN_SYSTEM.md e siga seus tokens e padrões.
---

# Design System — Controle de Validade

Antes de qualquer trabalho visual, leia integralmente `DESIGN_SYSTEM.md` e a seção correspondente de `ESPECIFICACAO_COMPLETA.md`.

## Regras obrigatórias

- Seguir a direção Invisible Design / Content-First inspirada no repositório https://github.com/JonathanCosta/veste.
- Usar os tokens CSS definidos em `DESIGN_SYSTEM.md`; não inventar cores, sombras, raios, espaçamentos ou durações locais.
- Tema claro com fundo `#F7F7F6`, superfícies brancas, texto escuro, Inter auto-hospedada quando disponível e fallback system-ui.
- Não carregar Google Fonts, ícones, CSS ou JavaScript de CDN em runtime.
- Cores semânticas de validade são exclusivas de seus estados e sempre acompanhadas de texto.
- Manter visual mobile-first, alvo de toque >=44px, safe areas, foco visível e contraste WCAG AA.
- Usar CSS puro organizado por tokens e componentes. Não adicionar Tailwind, React, Vue, UI kits ou frameworks.
- Manter bottom navigation com Início, Produtos, ação central `+`, Relatórios e Configurações.
- O `+` é a ação primária; não criar outro FAB concorrente.
- Formulários curtos, labels visíveis, sem placeholder como label.
- Listas de produtos devem priorizar nome e validade, sem aparência de cards de ERP.
- Não criar interface de edição: registros só podem ser adicionados ou excluídos.
- Animações curtas e discretas; respeitar `prefers-reduced-motion`.
- Criar estados de loading, vazio, erro, offline e sucesso conforme o design system.

## Adaptação da referência Veste

Adotar: paleta neutra, superfícies sutis, sombras difusas, Inter, cantos arredondados, navegação inferior com ação central, feedback tátil e transições curtas.

Não copiar: drawer 3D, polaroids, imagens de roupas, puxadores decorativos, filtros de roupas ou componentes sem relação com datas de validade.

Não copiar a stack Vue/Tailwind do Veste. O Controle de Validade usa Vite + TypeScript + HTML + CSS.

## Checklist antes de concluir

- [ ] Leu `DESIGN_SYSTEM.md`.
- [ ] Utilizou os tokens compartilhados.
- [ ] Conferiu a tela em largura de 360px e em desktop.
- [ ] Nenhuma rolagem horizontal involuntária.
- [ ] Todos os alvos de toque têm >=44px.
- [ ] Estado visual não depende somente de cor.
- [ ] Foco de teclado está visível.
- [ ] `prefers-reduced-motion` está respeitado.
- [ ] Sem CDN ou dependência visual não aprovada.
- [ ] A tela mantém simplicidade e hierarquia Content-First.
