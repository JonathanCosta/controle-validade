---
name: ui-immutability
description: Use ao criar ou alterar telas, componentes, navegação, CSS, formulários, renderização de dados ou operações sobre registros de produtos.
---

# Interface Vanilla TypeScript e imutabilidade dos produtos

## Stack de interface

- Usar HTML, CSS e TypeScript puro com Vite.
- Não introduzir React, Vue, Angular, Svelte, Solid, Redux, Zustand, Tailwind, Bootstrap, bibliotecas de componentes ou roteador externo.
- Usar CSS modular/organizado por tela ou componente, com tokens CSS compartilhados quando necessário.
- Não carregar CSS, JavaScript, fontes ou ícones essenciais por CDN.
- Preferir funções pequenas de renderização que recebem estado e retornam/atualizam elementos DOM. Usar delegação de eventos quando simplificar a manutenção.
- Não criar uma arquitetura de componentes genérica maior que a necessidade do aplicativo.

## Segurança na renderização

- Tratar nome, marca, EAN, conteúdo de backup e respostas da API como dados não confiáveis.
- Nunca interpolar dados dinâmicos do usuário/API em `innerHTML`.
- Preferir `document.createElement()`, `textContent`, `value` e atributos DOM seguros.
- Não inserir URL externa em `src`, `href` ou HTML sem validação específica.
- Não interpretar descrições da API como HTML.
- Event listeners devem ser removidos quando a tela for descartada ou usar delegação em contêiner de vida longa.

## UX e responsividade

- Mobile-first: celular é o dispositivo principal.
- Alvos de toque de pelo menos 44x44 CSS px.
- Formulários devem ser curtos, com rótulos associados e teclado apropriado.
- Cor nunca deve ser o único identificador de status; usar rótulo textual e/ou ícone.
- Garantir foco visível, navegação por teclado, contraste adequado e mensagens de validação acessíveis.
- A tela inicial deve manter o botão `+` fácil de alcançar.
- Cadastro é feito em uma única tela: nome digitado ou escaneado e data de validade.
- Não adicionar telas intermediárias ou confirmação separada antes de salvar. O próprio formulário é a revisão dos dados antes do envio.
- A câmera somente abre após ação explícita do usuário.

## Imutabilidade de produto

Depois de cadastrado, um produto não pode ter nome, EAN, marca ou validade editados.

A correção de erro é: excluir o registro e cadastrar novamente.

Aplicar a regra em todas as camadas, não apenas esconder botões na interface:

- O repositório de produtos expõe somente `add`, `getById`, `getAll`, `getByEan`, `delete` e `deleteAll`, conforme a especificação.
- Não criar `update`, `edit`, `save` ou métodos de escrita que sobrescrevam produtos.
- Inclusão usa `add()` do IndexedDB, nunca `put()` em `products`.
- `put()` pode ser usado apenas na Object Store de configurações, que é editável.
- Não criar tela, modal ou ação para editar produto.

## Produtos repetidos

- Mesmo nome, EAN ou data podem ser cadastrados novamente.
- Cada ação válida de cadastro gera novo UUID.
- Mesmo EAN com validade diferente é sempre outro registro.
- Nunca converter repetição de cadastro em quantidade ou incrementar registro existente.
- Agrupamento por nome/data é apenas visual; mantém cada ocorrência e sua validade individual.

## Exclusão

- Exclusão individual exige confirmação clara antes de remover.
- A confirmação deve identificar o produto e a validade que serão removidos.
- A exclusão deve atuar pelo UUID, nunca por nome ou EAN.
- Não excluir automaticamente produtos vencidos.
- A exclusão em massa só é permitida no fluxo de substituição de backup, com confirmação e transação atômica.

## Formulário de cadastro

- Nome e validade são obrigatórios.
- EAN e marca são opcionais.
- Datas passadas são permitidas.
- O nome preenchido por scanner é editável antes de salvar, mas após o cadastro é imutável.
- Não limpar silenciosamente nome digitado quando uma consulta EAN terminar.
- Se a consulta falhar, manter os valores do formulário e permitir cadastro manual.
- Evitar segundo modal de confirmação de salvamento; impedir duplo clique enquanto grava.

## Critérios de aceite

- Nenhum framework de interface ou Tailwind foi adicionado.
- Nenhum dado dinâmico é interpolado em `innerHTML`.
- Não há ação de editar produto nem método `update` no repositório.
- Busca por `.put(` na implementação de `products` retorna zero; `settings` pode usar `put`.
- Exclusão exige confirmação e usa UUID.
- Produtos repetidos continuam como registros independentes.
- Campos obrigatórios, teclado, foco, acessibilidade e alvos de toque são verificados.
