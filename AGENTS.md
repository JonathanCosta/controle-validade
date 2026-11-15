# Instruções permanentes do projeto — Controle de Validade

Este arquivo é carregado pelo OpenCode v2 como orientação permanente. A fonte de verdade funcional e técnica é `ESPECIFICACAO_COMPLETA.md`; leia-a integralmente antes de implementar. A fonte de verdade visual é `DESIGN_SYSTEM.md`; leia-a antes de criar ou alterar qualquer tela, componente, CSS, navegação ou interação.

## 1. Objetivo e fonte de verdade

- Desenvolva exclusivamente o Controle de Validade conforme `ESPECIFICACAO_COMPLETA.md`.
- Não peça ao usuário para repetir decisões que já estejam documentadas.
- Em caso de conflito, prevalece nesta ordem: requisito explícito mais recente do usuário; `ESPECIFICACAO_COMPLETA.md`; este arquivo; convenções existentes do repositório.
- Se o detalhe não estiver especificado, escolha a solução mais simples, nativa e reversível que respeite o escopo. Registre a decisão no resumo final.

## 2. Limites inegociáveis

- Não transformar o projeto em ERP ou controle de estoque.
- Não criar quantidade, saldo, entrada/saída, consumo, descarte ou movimentação.
- Não criar edição de produto: registros somente são adicionados ou excluídos.
- Não adicionar backend, banco remoto, autenticação, login, sincronização ou multiusuário.
- Não adicionar push, notificações, tarefas em segundo plano, analytics ou rastreadores.
- O cadastro manual e a consulta local devem funcionar sem internet.
- A consulta externa de identificação é opcional; falhas de rede/CORS nunca podem bloquear o cadastro.
- A URL da consulta deve ser configurável nas configurações da aplicação.
- Produtos repetidos são registros independentes, identificados por UUID. EAN não é chave única.
- Produtos vencidos permanecem até exclusão manual.
- Relatórios são completos e filtrados pelo intervalo de data de validade.
- Backup permite substituir ou mesclar; mesclagem usa UUID, nunca nome ou EAN.

## 3. Stack e arquitetura

- Use Vite + TypeScript strict + HTML/CSS sem framework de interface.
- Use IndexedDB com `idb` para persistência.
- Use `BarcodeDetector` somente quando o navegador confirmar suporte a EAN-8 e EAN-13; caso contrário, use `@zxing/browser` como fallback carregado sob demanda.
- Use `vite-plugin-pwa` para manifest e Service Worker.
- Use Vitest para testes unitários.
- Use npm e mantenha `package-lock.json` atualizado.
- Não introduza bibliotecas grandes, UI kits, React, Redux, Tailwind, Bootstrap ou roteador externo.
- Separe domínio, serviços, persistência, integrações e interface. Não manipule IndexedDB diretamente nas telas.
- Não armazene status de validade; calcule-o dinamicamente.
- Armazene datas de validade como `YYYY-MM-DD` sem horário e compare datas de calendário sem deslocamento de fuso.
- Evite abstrações genéricas que não tenham uso real no escopo atual.

## 4. Disciplina de implementação

1. Inspecione `git status --short` antes de começar e preserve alterações do usuário.
2. Leia a especificação e os arquivos próximos da tarefa; não releia todo o repositório indiscriminadamente.
3. Faça uma implementação pequena e completa, não apenas um protótipo visual.
4. Não reescreva arquivos inteiros quando uma alteração localizada for suficiente.
5. Não edite artefatos gerados em `dist/` ou arquivos dentro de `node_modules/`.
6. Não altere workflows, CNAME, domínio, base path ou publicação do GitHub Pages sem necessidade direta e explícita.
7. Não sobrescreva outros projetos existentes no repositório.
8. Não adicione uma dependência antes de verificar se a plataforma ou biblioteca já instalada resolve o caso.
9. Não use CDN em runtime.
10. Não faça commit, push, deploy, reset ou limpeza destrutiva sem solicitação explícita do usuário.
11. Nunca diga que um teste passou se ele não foi executado e observado.
12. Nunca declare uma funcionalidade pronta se estiver simulada ou com botão sem ação.

## 5. Modelos OpenCode Zen/Console — uso gratuito

- Use somente modelos gratuitos do provedor OpenCode configurado pelo usuário.
- O modelo padrão está em `opencode.json`. Não mude para modelo pago.
- Modelos gratuitos podem ter cotas, limites de requisição e disponibilidade temporária. Se o modelo falhar por limite, informe e peça ao usuário para selecionar outro modelo gratuito em `/models`; não tente contornar limites.
- Não inclua API keys, tokens ou credenciais no repositório.
- Não configure provedores pagos alternativos nem serviços de inferência externos.
- Use subagentes apenas quando houver benefício claro. Para tarefas pequenas, trabalhe em uma única sessão para economizar a cota gratuita.

## 6. Diretrizes visuais obrigatórias

- Antes de qualquer trabalho de UI/UX, ler `DESIGN_SYSTEM.md` integralmente.
- Seguir a linguagem visual *Invisible Design / Content-First* inspirada no projeto `https://github.com/JonathanCosta/veste`, adaptada ao acompanhamento de validades.
- Adotar os tokens, cores semânticas, tipografia, raios, sombras, espaçamentos e movimentos definidos em `DESIGN_SYSTEM.md`.
- Não copiar componentes específicos do Veste que não tenham relação com o produto.
- Não copiar a stack do Veste: este projeto continua com TypeScript, HTML e CSS, sem Tailwind ou framework de interface.
- A qualidade visual deve ser validada em celular de 360px, telas maiores, teclado virtual, safe areas e estados vazios/erro/loading.

## 7. Skills especializadas

As skills do projeto ficam em `.opencode/skills/` e são carregadas sob demanda. Não carregue todas em toda tarefa: use apenas as relacionadas ao trabalho atual.

- `db-architecture`: IndexedDB, `idb`, modelos, configurações, datas e validade.
- `scanner`: câmera, EAN, BarcodeDetector e ZXing.
- `pwa-offline`: Vite PWA, manifest, Service Worker, cache, GitHub Pages e atualização offline.
- `ui-immutability`: interface Vanilla TypeScript, renderização segura, UX e imutabilidade de produtos.
- `design-system`: linguagem visual, tokens, layout, tipografia, animações, acessibilidade e padrões de componentes.

Ao alterar interface, carregar `design-system` e `ui-immutability`. Ler `DESIGN_SYSTEM.md` como fonte normativa visual.

As skills detalham procedimentos, mas não substituem `ESPECIFICACAO_COMPLETA.md`. Em caso de divergência, siga a ordem de precedência definida na seção 1. A configuração OpenCode autoriza o carregamento dessas skills.

## 8. Validações mínimas

Antes de concluir uma implementação, execute os scripts que existirem no `package.json`:

1. `npm run typecheck`
2. `npm run test` (ou `npm test`, conforme os scripts)
3. `npm run build`

A especificação define os scripts mínimos do projeto. Se ainda não existirem, crie-os ao estruturar a aplicação. Não instale dependências para satisfazer uma validação sem antes confirmar a necessidade.

Priorize testes para:

- limites de classificação de validade (vencido, hoje, 1 dia, 15 dias, 16 dias);
- virada de mês/ano, fevereiro e ano bissexto;
- data local e fuso horário;
- validação EAN-8/EAN-13;
- produtos repetidos com UUID diferentes;
- exclusão individual;
- filtro inclusivo de intervalo de relatório;
- exportação, validação, substituição e mesclagem de backup;
- mesclagem idempotente por UUID;
- falha de consulta externa sem bloquear cadastro;
- funcionamento sem rede das funcionalidades locais.

## 9. Segurança e privacidade

- Trate nomes, EAN, configurações, API e arquivos JSON como entradas não confiáveis.
- Renderize texto do usuário como texto; não use `innerHTML` com dados externos.
- Faça parsing e validação explícita do backup antes de gravar.
- Limite tamanho/quantidade razoáveis de dados importados e lide com arquivo malformado sem alterar o banco.
- Para importação em lote, use transação IndexedDB; em falha, não deixe uma restauração parcial.
- A consulta externa envia somente o EAN, nunca a lista de produtos ou datas.
- Use `credentials: 'omit'` nas requisições externas.
- Valide URL HTTPS, marcador `{ean}` e origem/resultado da consulta.
- Não leia, imprima, copie ou modifique segredos de `.env`, chaves privadas ou tokens.
- Não confie em dados da API como HTML ou código executável.

## 10. Comunicação e conclusão

Ao concluir uma tarefa, informe:

- o que foi implementado;
- arquivos criados/modificados;
- validações realmente executadas e seus resultados;
- limitações ou pendências restantes;
- qualquer decisão técnica não explícita na especificação.

Se uma tarefa estiver bloqueada por CORS ou por serviço externo, conclua o fluxo alternativo manual e documente a limitação. Não introduza backend para contornar a restrição.
