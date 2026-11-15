# Design System — Controle de Validade

> **Documento normativo de UI/UX.** Este arquivo define a linguagem visual, os padrões de layout, os componentes, a tipografia, as cores, os estados, as animações e as regras de usabilidade do Controle de Validade. O agente deve seguir estas definições ao implementar qualquer tela ou componente visual.

**Status:** especificação inicial aprovada para implementação  
**Referência visual:** [JonathanCosta/veste](https://github.com/JonathanCosta/veste)  
**Conceito adotado:** *Invisible Design / Content-First*, adaptado para um aplicativo de acompanhamento de validade.

---

## 1. Objetivo visual

O Controle de Validade deve transmitir simplicidade, organização, tranquilidade e confiança. A interface não deve parecer um ERP, painel administrativo ou sistema de gestão de estoque.

O usuário precisa abrir o aplicativo, entender rapidamente o que está vencido ou próximo do vencimento e conseguir cadastrar um produto com poucos toques.

### 1.1 Princípios obrigatórios

1. **Conteúdo em primeiro plano:** os produtos, nomes e datas são os protagonistas; a interface deve ser discreta.
2. **Pouco ruído visual:** evitar bordas fortes, excesso de caixas, divisórias, ícones decorativos e textos auxiliares desnecessários.
3. **Hierarquia clara:** nome do produto e data de validade devem ser mais importantes que EAN, marca ou metadados.
4. **Ação principal evidente:** o botão `+` deve estar sempre fácil de encontrar na navegação principal.
5. **Mobile-first real:** a experiência deve ser projetada primeiro para celular, especialmente telas de 360–430 px.
6. **Feedback sem exagero:** ações devem responder visualmente, mas sem animações longas ou efeitos chamativos.
7. **Consistência:** um mesmo tipo de ação deve ter sempre o mesmo estilo, dimensão e comportamento.
8. **Acessibilidade:** estados nunca podem ser comunicados apenas por cor; textos e ícones também devem identificar a situação.

### 1.2 Referência Veste: o que adotar

O projeto [Veste](https://github.com/JonathanCosta/veste) é a referência de linguagem visual, principalmente por:

- fundo neutro quente `#F7F7F6`;
- superfícies brancas e discretas;
- texto principal escuro e texto secundário cinza;
- Inter como família tipográfica;
- sombras difusas e de baixa opacidade;
- cantos arredondados generosos;
- navegação inferior com ação central `+`;
- feedback tátil com pequena redução de escala;
- transições curtas de opacidade e deslocamento;
- skeletons e estados vazios discretos;
- filosofia *Invisible Design*: a interface não compete com o conteúdo.

Referências úteis do repositório:

- [README — Design System / Invisible Design](https://github.com/JonathanCosta/veste#design-system-invisible-design)
- [Tailwind theme](https://github.com/JonathanCosta/veste/blob/main/tailwind.config.js)
- [Bottom navigation](https://github.com/JonathanCosta/veste/blob/main/src/components/BottomNav.vue)
- [Cards e grid](https://github.com/JonathanCosta/veste/blob/main/src/views/WardrobeView.vue)
- [Dialog e microinteração](https://github.com/JonathanCosta/veste/blob/main/src/components/CustomDialog.vue)

### 1.3 O que NÃO copiar do Veste

A referência deve orientar a estética e a qualidade da experiência, não a reprodução literal de componentes específicos.

Não copiar:

- gaveta 3D de guarda-roupa;
- cartões de roupas com fotos em proporção 3:4;
- polaroids ou pilhas de imagens;
- puxador decorativo de couro/metal;
- filtros de cores de roupas;
- calendário de looks;
- qualquer conceito visual que não tenha relação com datas de validade.

Também não copiar a stack Vue/Tailwind do Veste. O Controle de Validade permanece em **Vite + TypeScript + HTML + CSS**, sem framework de interface e sem Tailwind, conforme a especificação técnica principal.

---

## 2. Direção visual

### 2.1 Personalidade

A interface deve ser:

- leve, limpa e acolhedora;
- contemporânea, sem aparência corporativa;
- minimalista, mas não vazia ou sem personalidade;
- funcional, com datas e estados muito legíveis;
- tátil, com botões confortáveis e feedback delicado.

Evitar aparência de dashboard genérico composto por muitos cards coloridos. Indicadores devem ser compactos e integrados à página.

### 2.2 Tema

A primeira versão terá **tema claro**. Não implementar alternância claro/escuro nesta versão.

A paleta neutra será a base. Cores mais fortes serão reservadas às situações de validade, foco e ações importantes.

### 2.3 Uso de superfícies

- Fundo global: neutro claro.
- Superfícies de conteúdo: branco.
- Elementos secundários: cinzas muito claros.
- Campos: fundo branco ou branco levemente translúcido, com contorno sutil.
- Modais e bottom sheets: branco, com sombra difusa e cantos arredondados.
- Não usar bordas escuras para separar seções.
- Preferir espaçamento, contraste tipográfico e pequenas divisórias claras.

---

## 3. Tokens de design

Todos os estilos devem partir destes tokens CSS. Não espalhar valores arbitrários de cor, sombra, raio ou duração pelos componentes.

Criar os tokens em um único arquivo global, por exemplo `src/styles/tokens.css`, importado pelo CSS principal.

### 3.1 Cores neutras

| Token | Valor | Uso |
|---|---|---|
| `--color-app-bg` | `#F7F7F6` | Fundo geral da aplicação |
| `--color-surface` | `#FFFFFF` | Cards, formulários, navegação, modais |
| `--color-surface-soft` | `#FCFCFA` | Áreas de conteúdo secundárias |
| `--color-surface-muted` | `#F1F2F1` | Campos inativos, placeholders, fundos discretos |
| `--color-accent` | `#2D2D2D` | Botões primários, ícones ativos, FAB |
| `--color-accent-hover` | `#202020` | Hover/pressed em dispositivos com ponteiro |
| `--color-text-main` | `#1F2937` | Títulos, nomes e conteúdo principal |
| `--color-text-secondary` | `#4B5563` | Textos auxiliares com boa legibilidade |
| `--color-text-muted` | `#6B7280` | Metadados, datas auxiliares e placeholders |
| `--color-border` | `#E7E8E6` | Divisórias e contornos discretos |
| `--color-border-strong` | `#D5D7D4` | Contorno de foco secundário, quando necessário |
| `--color-focus` | `#454545` | Indicador de foco acessível |
| `--color-overlay` | `rgba(18, 18, 17, 0.36)` | Fundo de modal/bottom sheet |

### 3.2 Cores semânticas de validade

As cores semânticas são a principal exceção à paleta neutra. Devem ser suaves no fundo e suficientemente escuras no texto.

| Situação | Token de fundo | Valor | Token de texto | Valor |
|---|---|---|---|---|
| Vencido | `--status-expired-bg` | `#FCE8E6` | `--status-expired-text` | `#9B1C1C` |
| Vence hoje | `--status-today-bg` | `#FFF1E6` | `--status-today-text` | `#9A3412` |
| Próximo do vencimento | `--status-upcoming-bg` | `#FFF7D6` | `--status-upcoming-text` | `#7A4B00` |
| Dentro da validade | `--status-valid-bg` | `#E7F4EC` | `--status-valid-text` | `#17603A` |

Contornos semânticos opcionais:

| Token | Valor |
|---|---|
| `--status-expired-border` | `#F3C7C2` |
| `--status-today-border` | `#F7D2BC` |
| `--status-upcoming-border` | `#EEDFA8` |
| `--status-valid-border` | `#C9E6D4` |

Regras:

- Não preencher cards inteiros com cores semânticas fortes.
- Usar as cores principalmente em badges, pontos, ícones pequenos e realces discretos.
- Todo badge deve conter também o texto da situação.
- Não usar vermelho para botões comuns; reservar vermelho para exclusões e estado vencido.
- Não usar cores diferentes para a mesma situação em telas distintas.
- Não usar gradientes coloridos decorativos.

### 3.3 Sombras

Inspiradas nas sombras suaves do Veste:

| Token | Valor | Uso |
|---|---|---|
| `--shadow-soft` | `0 8px 30px rgba(0, 0, 0, 0.04)` | Cards e superfícies elevadas |
| `--shadow-soft-lg` | `0 10px 40px rgba(0, 0, 0, 0.06)` | Modais e bottom sheets |
| `--shadow-nav` | `0 -2px 16px rgba(0, 0, 0, 0.06)` | Navegação inferior |
| `--shadow-fab` | `0 5px 16px rgba(0, 0, 0, 0.16)` | Botão central `+` |

Não utilizar sombras pretas duras, bordas escuras ou múltiplas camadas pesadas.

### 3.4 Raios de borda

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | `8px` | Chips pequenos, indicadores compactos |
| `--radius-md` | `12px` | Inputs, botões menores |
| `--radius-lg` | `16px` | Cards, botões principais |
| `--radius-xl` | `20px` | Painéis e blocos agrupados |
| `--radius-2xl` | `24px` | Modais, sheets e painéis principais |
| `--radius-pill` | `999px` | Badges, filtros e FAB |

Não arredondar tudo indiscriminadamente. O raio deve indicar a função e a hierarquia do elemento.

### 3.5 Espaçamento

Usar escala baseada em múltiplos de 4 px:

| Token | Valor |
|---|---:|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |

Gutters horizontais:

- telas até 390 px: `16px`;
- telas acima de 390 px: `20px`;
- tablets/desktop: `24px`.

---

## 4. Tipografia

### 4.1 Família tipográfica

**Inter** é a fonte principal, seguindo a referência Veste.

Ordem de carregamento:

1. Inter auto-hospedada no projeto, em arquivos WOFF2 locais, caso os arquivos licenciados estejam disponíveis;
2. fallback: `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, sans-serif.

É proibido depender do Google Fonts ou de qualquer CDN em runtime, pois a aplicação precisa funcionar offline após a instalação/carregamento inicial.

Pesos utilizados:

- 400: texto comum;
- 500: labels e metadados importantes;
- 600: títulos de seção e botões;
- 700: títulos principais e números de indicadores.

Não carregar pesos que não sejam utilizados.

### 4.2 Escala tipográfica

| Token | Tamanho | Peso | Uso |
|---|---:|---:|---|
| `--font-xs` | `11px` | 400/500 | Metadados e textos auxiliares curtos |
| `--font-sm` | `13px` | 400/500 | Texto secundário, badges e navegação |
| `--font-base` | `15px` | 400 | Texto principal de interface |
| `--font-md` | `16px` | 500 | Nome de produto e labels relevantes |
| `--font-lg` | `18px` | 600 | Títulos de seção |
| `--font-xl` | `22px` | 700 | Títulos de tela |
| `--font-2xl` | `28px` | 700 | Números de destaque e contagens principais |
| `--font-3xl` | `32px` | 700 | Uso raro, apenas quando houver valor visual claro |

### 4.3 Regras tipográficas

- Títulos devem usar `letter-spacing: -0.02em` ou próximo disso.
- Texto corrido deve usar line-height entre `1.4` e `1.55`.
- Labels devem ter contraste suficiente e nunca depender apenas do placeholder.
- Datas devem usar números tabulares (`font-variant-numeric: tabular-nums`) para evitar mudança de largura.
- Evitar textos inteiros em caixa alta. Caixa alta é permitida apenas em micro-labels curtos e discretos.
- Não usar fonte condensada, display ou serifada nesta versão.
- Não usar fonte ou estilo diferente para cada categoria.

---

## 5. Layout responsivo

### 5.1 Estratégia

Mobile-first. A aplicação deve parecer natural em um celular usado em pé, com uma mão.

Breakpoints de referência:

| Nome | Largura | Comportamento |
|---|---:|---|
| `mobile` | até `599px` | Layout de uma coluna e navegação inferior |
| `tablet` | `600px` a `899px` | Conteúdo centralizado, mais respiro lateral |
| `desktop` | a partir de `900px` | Conteúdo centralizado com largura limitada |

Não criar layouts diferentes sem necessidade. O mesmo fluxo deve funcionar em todas as larguras.

### 5.2 Container principal

- largura: `100%`;
- largura máxima do conteúdo: `760px`;
- centralizado em telas largas;
- padding inferior suficiente para não ficar escondido pela navegação fixa;
- usar `min-height: 100dvh` quando apropriado;
- respeitar `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.

A aplicação não deve esticar listas e formulários por toda a largura de monitores grandes.

### 5.3 Ritmo vertical

- cabeçalho de página: margem inferior de `20–24px`;
- entre grupos principais: `24–32px`;
- entre campos de formulário: `16px`;
- entre título e conteúdo do grupo: `10–12px`;
- entre itens de lista: `0–8px`, usando divisórias sutis quando necessário.

### 5.4 Área segura e rolagem

- não permitir rolagem horizontal da aplicação;
- filtros horizontais podem ter rolagem própria;
- ocultar scrollbar apenas em trilhos horizontais não essenciais à navegação por teclado;
- a navegação inferior deve respeitar safe area;
- conteúdo não pode ficar atrás do FAB ou da navegação;
- ao abrir teclado virtual, o campo ativo e a ação de salvar devem continuar acessíveis.

---

## 6. Navegação principal

### 6.1 Barra inferior

Adotar o padrão de navegação inferior inspirado no Veste, com cinco posições:

1. Início;
2. Produtos;
3. ação central `+`;
4. Relatórios;
5. Configurações.

A navegação será fixa no rodapé em dispositivos móveis.

### 6.2 Aparência

- superfície branca;
- sombra superior difusa `--shadow-nav`;
- altura base aproximada de `64px`, acrescida da safe area inferior;
- cinco posições com largura equivalente;
- ícones outline, sem preenchimento pesado;
- ícones com caixa visual de aproximadamente `24px`;
- rótulos pequenos, legíveis e curtos;
- item ativo em `--color-accent`;
- itens inativos em `--color-text-muted`.

### 6.3 Botão central `+`

- circular;
- diâmetro visual de `54–58px`;
- fundo `--color-accent`;
- ícone branco;
- contorno externo branco para separá-lo da barra;
- sombra suave `--shadow-fab`;
- centralizado e levemente elevado em relação à barra;
- alvo de toque mínimo de `48x48px`.

O `+` é a ação primária do aplicativo. Não adicionar outro FAB concorrente nas telas principais.

### 6.4 Fluxos focados

Nas telas de cadastro e scanner, ocultar a barra inferior para reduzir distração e evitar sobreposição com controles do formulário/câmera. Manter uma ação clara de voltar ou fechar no topo.

---

## 7. Componentes e padrões de interface

### 7.1 Cabeçalho de tela

Anatomia:

- título da tela alinhado à esquerda;
- opcionalmente uma descrição curta abaixo;
- botão de voltar quando a tela for secundária;
- ações complementares somente quando forem realmente necessárias.

Não usar logotipo grande ocupando muito espaço no início de cada tela. A marca pode aparecer como pequeno símbolo no cabeçalho inicial ou em Sobre, sem competir com os vencimentos.

### 7.2 Indicadores de validade na visão geral

Apresentar três indicadores compactos:

- Vencidos;
- Vence hoje;
- Próximos.

Os indicadores devem ter números visualmente destacados, rótulos curtos e uso contido das cores semânticas.

Em telas estreitas, permitir que ocupem uma linha compacta ou uma grade de três colunas com conteúdo legível. Não transformar cada indicador em um card alto com ícones decorativos.

Os indicadores devem ser acionáveis: tocar em um deles abre a tela Produtos já filtrada pela situação correspondente.

A categoria Dentro da validade pode ser acessada por filtro na tela Produtos e deve aparecer no relatório completo, mas não precisa ocupar espaço na primeira linha da visão geral.

### 7.3 Linha de produto

O produto deve ser apresentado preferencialmente como linha/list item, não como card grande.

Anatomia recomendada:

- nome do produto em primeiro plano;
- data de validade com números tabulares;
- badge com a situação;
- EAN ou marca em texto secundário somente quando ajudar;
- ação de excluir discreta e acessível, conforme o contexto.

A data não pode ser escondida em menu ou tooltip.

O item deve manter altura confortável, separação visual leve e alinhamento consistente.

### 7.4 Agrupamento por data

Quando o modo `date` estiver ativo:

- agrupar registros pela data de validade;
- mostrar cabeçalho com data legível e, quando aplicável, rótulo relativo (Hoje, Amanhã);
- dentro do grupo, manter cada produto como registro individual;
- ordenar grupos e registros do mais próximo para o mais distante;
- produtos vencidos devem formar grupos anteriores à data atual, ordenados do vencimento mais recente para o mais antigo, salvo quando filtro específico pedir outra ordem.

### 7.5 Agrupamento por nome

Quando o modo `name` estiver ativo:

- agrupar somente para apresentação registros com o mesmo nome normalizado para comparação;
- preservar e mostrar cada ocorrência com sua própria validade;
- não somar, contar como estoque ou ocultar datas;
- usar o nome como cabeçalho e exibir as datas das ocorrências logo abaixo;
- diferenças de EAN não devem fundir registros de nomes diferentes;
- não alterar o nome salvo apenas para conseguir agrupar.

### 7.6 Badges de situação

- formato pill ou retângulo com raio `--radius-pill`;
- tipografia 11–12px, peso 600;
- padding horizontal 9–10px e vertical 5–6px;
- fundo e texto conforme a paleta semântica;
- sempre conter rótulo textual: `Vencido`, `Hoje`, `Próximo`, `Dentro da validade`;
- ícone pequeno é opcional e nunca substitui o texto.

### 7.7 Busca

- campo com ícone de lupa à esquerda;
- fundo branco ou `--color-surface-soft`;
- raio 14–16px;
- contorno muito leve;
- altura mínima de 46px;
- placeholder: `Buscar produto...`;
- limpar busca com botão acessível quando houver texto;
- busca textual não deve disparar rede.

### 7.8 Chips de filtro

- formato pill;
- altura mínima de 36px, alvo de toque real de pelo menos 44px;
- opção ativa com fundo escuro e texto branco;
- opção inativa com fundo branco/cinza claro e texto secundário;
- rolagem horizontal se necessário;
- não usar contorno tracejado como padrão; preferir superfície neutra e estados claros.

### 7.9 Formulários

- label sempre visível acima do campo;
- altura de input mínima de 48px;
- raio 12–16px;
- fundo branco;
- borda `--color-border`;
- foco com ring de 2px em `--color-focus` e offset discreto;
- texto principal 15–16px;
- mensagens de erro próximas ao campo;
- placeholders apenas como exemplo, nunca como substitutos do label.

Data de validade deve usar controle de data nativo quando oferecer boa experiência no navegador. A apresentação deve continuar clara em navegadores móveis.

### 7.10 Botões

**Primário:**

- fundo `--color-accent`;
- texto branco;
- altura mínima 48px;
- raio 14–16px;
- peso 600;
- sombra somente quando houver hierarquia ou necessidade real.

**Secundário:**

- fundo branco ou `--color-surface-muted`;
- texto escuro;
- contorno sutil opcional;
- mesma altura e raio do primário.

**Destrutivo:**

- texto vermelho escuro ou fundo semântico de erro;
- nunca usar como ação principal visual da tela;
- sempre acompanhado de confirmação.

**Ícone:**

- alvo de toque >=44x44px;
- ícone centralizado;
- aria-label obrigatório quando não houver texto visível.

### 7.11 Modais e confirmações

Usar modal central para confirmações curtas e importantes, por exemplo exclusão de produto ou substituição do backup.

- overlay `--color-overlay` com blur muito leve, se suportado;
- modal branco;
- largura máxima aproximada de 420px;
- raio 24px;
- padding 24px;
- título claro;
- mensagem curta que identifique o impacto;
- botões com pelo menos 44px de altura;
- ação destrutiva separada e visualmente identificável.

Não criar confirmação modal para cada ação simples.

### 7.12 Bottom sheets

Utilizar bottom sheet quando o conteúdo for contextual e curto, especialmente no celular.

- fundo branco;
- cantos superiores de 24px;
- sombra `--shadow-soft-lg`;
- overlay escuro translúcido;
- puxador pequeno e neutro no topo, somente como affordance;
- altura máxima aproximada de 85dvh;
- conteúdo com rolagem própria;
- botão de fechar visível ou gesto de retorno do sistema compatível.

Não usar puxadores decorativos 3D do Veste; manter o detalhe mínimo.

### 7.13 Toasts e feedback

Usar mensagens breves para operações concluídas ou falhas não bloqueantes.

- superfície escura neutra ou branca elevada;
- texto curto;
- ícone de estado opcional;
- posição acima da navegação inferior;
- duração aproximada de 2,5–3,5 segundos;
- mensagens importantes também devem estar disponíveis por `aria-live`.

Não usar alertas nativos `alert()` como padrão da interface.

---

## 8. Especificação das telas

## 8.1 Visão geral / Início

Objetivo: mostrar rapidamente o que requer atenção e oferecer o caminho mais curto para cadastrar um produto.

Ordem vertical:

1. Cabeçalho `Validades` e data atual, se útil.
2. Resumo compacto com três contagens: Vencidos, Hoje, Próximos.
3. Cabeçalho `Próximos vencimentos` com ação `Ver todos`.
4. Lista dos registros com vencimento mais próximo, priorizando vencidos e vencimentos imediatos.
5. Estado vazio ou mensagem de ausência de produtos quando necessário.

Regras:

- não exibir gráficos;
- não exibir estatísticas sem utilidade;
- não exibir preço, quantidade ou métricas de estoque;
- evitar uma tela inicial dominada por cards;
- indicadores clicáveis aplicam filtros na tela Produtos;
- o botão central `+` fica na navegação inferior.

### Estado sem registros

Mostrar mensagem amigável e direta, por exemplo:

- título: `Nenhum produto cadastrado`;
- texto: `Adicione um produto para começar a acompanhar as validades.`;
- ação: `Adicionar produto`.

A ação deve abrir diretamente o cadastro, não uma tela intermediária.

### Estado sem vencimentos próximos

Não mostrar erro. Exibir uma mensagem positiva e discreta, por exemplo `Tudo em dia por enquanto`, mantendo o acesso à lista completa.

## 8.2 Produtos

Objetivo: consultar todos os registros, localizar produtos e alternar visualização.

Ordem dos elementos:

1. Cabeçalho `Produtos`.
2. Campo de busca.
3. Filtros de situação: Todos, Vencidos, Hoje, Próximos, Dentro da validade.
4. Controle de agrupamento: `Por data` / `Por produto`.
5. Lista agrupada conforme seleção.

Regras:

- filtro `Todos` é o padrão;
- busca e filtro podem ser usados juntos;
- manter a seleção visual de filtro e agrupamento durante navegação enquanto fizer sentido;
- mostrar estado vazio específico para filtro sem resultados;
- excluir um produto exige confirmação com nome e data;
- não oferecer edição;
- nenhum agrupamento altera os registros originais.

## 8.3 Cadastro de produto

Objetivo: adicionar um registro com o menor número de etapas.

A tela será aberta pelo botão `+` e não exibirá a navegação inferior.

Ordem:

1. Cabeçalho com voltar/fechar e título `Adicionar produto`.
2. Campo `Nome do produto`.
3. Botão secundário `Escanear código de barras` próximo ao campo de nome.
4. Exibição discreta do EAN após leitura.
5. Campo `Validade`.
6. Campo opcional `Marca`, visualmente secundário.
7. Botão primário fixo/próximo ao rodapé `Salvar produto`.

Regras:

- nome e validade são obrigatórios;
- usuário pode digitar nome ou escanear;
- nome preenchido pelo scanner pode ser ajustado antes de salvar;
- se consulta falhar, manter formulário utilizável;
- não apagar texto digitado sem confirmação;
- datas passadas são permitidas;
- não pedir quantidade;
- não pedir confirmação em segundo modal antes de salvar;
- evitar perder o formulário se a câmera for aberta e cancelada.

A ação de salvar deve apresentar estado de processamento e impedir duplo clique.

## 8.4 Scanner

Objetivo: ler EAN sem ambiguidades e sem distração.

A experiência será focada, podendo usar tela inteira no celular:

- fundo escuro para melhorar leitura da câmera;
- preview da câmera ocupando a maior parte da área útil;
- moldura/linha de leitura simples;
- instrução `Aponte para o código de barras`;
- botão fechar/cancelar sempre visível;
- botão de lanterna somente quando suportado;
- não exibir controles desnecessários.

Após leitura válida, encerrar câmera imediatamente e retornar ao formulário.

Erros de permissão, ausência de câmera ou câmera ocupada devem ser apresentados em linguagem simples e oferecer retorno ao preenchimento manual.

## 8.5 Relatórios

Objetivo: consultar todos os registros em um período e copiar o conteúdo completo para compartilhar.

Ordem:

1. Cabeçalho `Relatórios`.
2. Filtro de intervalo: `Data inicial` e `Data final`.
3. Ação `Aplicar filtro` e ação para limpar intervalo.
4. Resumo do período e totais por situação.
5. Relatório completo agrupado por situação.
6. Botão principal `Copiar relatório`.

Regras:

- sem intervalo definido, considerar todos os registros;
- intervalo filtra pela data de validade (`expiresAt`), com limites inclusivos;
- validar data inicial <= data final;
- categorias seguem a classificação dinâmica em relação a hoje;
- incluir todas as categorias no relatório completo, inclusive Dentro da validade;
- mostrar o período aplicado no relatório copiado;
- botão copiar deve apresentar feedback `Relatório copiado`;
- não enviar automaticamente para WhatsApp.

## 8.6 Configurações

Objetivo: concentrar poucas preferências e ações de segurança dos dados.

Organizar em seções simples:

**Validade**
- campo numérico `Considerar próximo do vencimento em`;
- padrão 15 dias;
- validar número inteiro positivo dentro de limite razoável;
- explicar que a regra considera os próximos N dias.

**Identificação de produtos**
- campo `URL de consulta` com marcador `{ean}`;
- exemplo preenchido com a URL da Americanas;
- botão salvar configuração;
- texto auxiliar informando que a consulta precisa ser compatível com CORS e responder JSON;
- cadastro manual não depende dessa URL.

**Backup**
- botão `Exportar backup`;
- botão `Importar backup`;
- no fluxo de importação, escolher substituir ou mesclar;
- explicar claramente o efeito das duas opções antes de confirmar.

**Sobre**
- nome do aplicativo;
- versão, caso disponível;
- informação curta de que os dados ficam no dispositivo.

Não adicionar tela de perfil, login, conta ou preferências irrelevantes.

---

## 9. Estados de interface

Toda tela que consulta dados ou executa operações deve prever estados claros.

### 9.1 Carregando

- usar skeleton discreto com fundo cinza muito claro;
- manter dimensões próximas ao conteúdo final para evitar layout shift;
- pulse suave, sem shimmer agressivo;
- não exibir skeleton para operações instantâneas sem necessidade.

### 9.2 Vazio

- texto simples;
- ícone outline pequeno opcional;
- uma ação principal contextual;
- evitar ilustração grande ou mensagem genérica.

### 9.3 Erro

- informar o que falhou em linguagem simples;
- preservar dados já digitados;
- oferecer ação de tentar novamente quando possível;
- nunca esconder o caminho manual por erro da API.

### 9.4 Offline

Não exibir banner fixo assustador. Se a conexão for relevante para uma ação externa, mostrar aviso contextual, por exemplo: `Sem conexão. Você pode continuar digitando o nome.`

Cadastro manual, consultas locais e relatórios devem continuar funcionais.

### 9.5 Sucesso

Usar toast ou texto de confirmação curto após salvar, excluir, exportar, importar ou copiar relatório.

### 9.6 Desabilitado

Botões desabilitados devem reduzir opacidade de forma moderada, preservar legibilidade e não responder a clique. Não depender apenas da cor para indicar indisponibilidade.

---

## 10. Animações e microinterações

As animações devem ser curtas, suaves e funcionais. O objetivo é mostrar continuidade e feedback, não chamar atenção.

### 10.1 Tokens de movimento

| Token | Duração | Easing | Uso |
|---|---:|---|---|
| `--motion-fast` | `140ms` | `ease-out` | hover/focus/ícones |
| `--motion-base` | `200ms` | `cubic-bezier(0.2, 0.7, 0.2, 1)` | botões e feedback |
| `--motion-page` | `220ms` | `ease-out` | transição de tela |
| `--motion-sheet` | `260ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | bottom sheet |
| `--motion-dialog` | `180ms` | `ease-out` | modal |
| `--motion-list` | `180ms` | `ease-out` | entrada/saída de itens |

### 10.2 Feedback de toque

Elementos clicáveis principais devem ter feedback de pressão:

```css
.interactive {
  transition:
    transform var(--motion-base) ease-out,
    background-color var(--motion-fast) ease-out,
    box-shadow var(--motion-fast) ease-out;
}

.interactive:active {
  transform: scale(0.97);
}
```

Regras:

- utilizar escala `0.97` como padrão; `0.95` somente em controles pequenos e robustos;
- não aplicar escala a textos selecionáveis, campos de formulário ou containers inteiros;
- não deslocar o layout durante o toque;
- em dispositivos sem hover, o estado `active` deve continuar funcionando.

### 10.3 Transição de tela

Usar transição discreta:

- entrada: opacity `0 → 1`, translateY `6px → 0`;
- saída: opacity `1 → 0`, translateY `0 → -4px`;
- duração aproximada: 200–220ms;
- evitar transições grandes que pareçam navegação de apresentação.

### 10.4 Bottom sheet

- entrada: `translateY(100%) → 0`;
- saída: `translateY(0) → 100%`;
- overlay altera opacidade junto;
- duração aproximada 240–260ms;
- curva `cubic-bezier(0.22, 1, 0.36, 1)`.

### 10.5 Dialog

- overlay: fade;
- painel: `scale(0.96) translateY(6px) → scale(1) translateY(0)`;
- entrada 180ms;
- saída 140–160ms;
- não utilizar bounce ou spring exagerado.

### 10.6 Listas e agrupamentos

- quando itens forem inseridos/removidos, usar fade e pequeno deslocamento vertical;
- stagger opcional de 20–30ms por item;
- limitar stagger aos primeiros 8–10 itens visíveis;
- não atrasar a aparição de toda a lista;
- não animar grandes listas inteiras a cada filtro.

### 10.7 Loading

- skeleton com pulse discreto;
- spinner somente em operações pontuais sem layout previsível;
- progresso percentual apenas para importação/exportação quando houver trabalho suficientemente longo;
- não criar animação contínua em elementos estáticos.

### 10.8 Respeito à preferência do usuário

Obrigatório implementar `prefers-reduced-motion: reduce`:

- reduzir transições a praticamente instantâneas;
- remover stagger;
- desativar deslocamentos e escalas decorativas;
- manter apenas feedback essencial e mudança de estado.

---

## 11. Ícones e elementos gráficos

- usar ícones SVG outline, consistentes entre si;
- viewBox usual `0 0 24 24`;
- stroke width aproximado 1.7–2;
- stroke-linecap e stroke-linejoin arredondados;
- cor herdada do texto/estado;
- não usar mistura de emojis, ícones preenchidos e outline na interface principal;
- emojis são permitidos no texto de relatório para WhatsApp, conforme especificação funcional;
- não adicionar biblioteca de ícones grande apenas para poucos ícones;
- criar helper pequeno ou SVGs inline quando necessário.

Ícones principais esperados: início/home, lista/caixa, mais, relatório/documento, configurações, busca, calendário, câmera/scanner, voltar, fechar, excluir, copiar, alerta e check.

Todos os botões que contenham somente ícone precisam de nome acessível.

---

## 12. Acessibilidade e usabilidade

### 12.1 Alvos de toque

- mínimo absoluto: `44x44px`;
- preferencial: `48x48px`;
- distância entre controles próximos: pelo menos `8px` quando possível.

### 12.2 Contraste

- texto comum: contraste mínimo WCAG AA de 4.5:1;
- texto grande: mínimo 3:1;
- controles, ícones funcionais e foco devem ser identificáveis contra o fundo;
- verificar especialmente `--color-text-muted` em superfícies claras;
- badges semânticos devem usar pares fundo/texto definidos neste documento.

### 12.3 Teclado e foco

- todos os controles devem ser alcançáveis por teclado;
- `:focus-visible` deve ter indicador claro;
- não remover outline sem substituto;
- ordem de tabulação deve seguir a ordem visual;
- modais devem gerenciar foco, impedir foco atrás do overlay e devolver foco ao controle que abriu o modal.

### 12.4 Semântica

- usar headings em hierarquia correta;
- associar label e input;
- erros de validação devem ser associados ao campo;
- mudanças de sucesso e erro importantes devem usar `aria-live`;
- botão de exclusão deve identificar qual produto será removido;
- status deve ser textual e não depender apenas da cor.

### 12.5 Legibilidade

- corpo não deve ficar abaixo de 13px;
- evitar textos muito longos em caixa alta;
- não usar texto cinza claro demais;
- não truncar nome de produto sem permitir consulta ao conteúdo completo;
- a data de validade precisa ficar visível na linha do produto.

---

## 13. CSS base recomendado

Os tokens devem ser centralizados e os componentes devem consumir variáveis, evitando valores isolados.

```css
:root {
  color-scheme: light;

  --color-app-bg: #F7F7F6;
  --color-surface: #FFFFFF;
  --color-surface-soft: #FCFCFA;
  --color-surface-muted: #F1F2F1;
  --color-accent: #2D2D2D;
  --color-accent-hover: #202020;
  --color-text-main: #1F2937;
  --color-text-secondary: #4B5563;
  --color-text-muted: #6B7280;
  --color-border: #E7E8E6;
  --color-border-strong: #D5D7D4;
  --color-focus: #454545;
  --color-overlay: rgba(18, 18, 17, 0.36);

  --status-expired-bg: #FCE8E6;
  --status-expired-text: #9B1C1C;
  --status-expired-border: #F3C7C2;
  --status-today-bg: #FFF1E6;
  --status-today-text: #9A3412;
  --status-today-border: #F7D2BC;
  --status-upcoming-bg: #FFF7D6;
  --status-upcoming-text: #7A4B00;
  --status-upcoming-border: #EEDFA8;
  --status-valid-bg: #E7F4EC;
  --status-valid-text: #17603A;
  --status-valid-border: #C9E6D4;

  --shadow-soft: 0 8px 30px rgba(0, 0, 0, 0.04);
  --shadow-soft-lg: 0 10px 40px rgba(0, 0, 0, 0.06);
  --shadow-nav: 0 -2px 16px rgba(0, 0, 0, 0.06);
  --shadow-fab: 0 5px 16px rgba(0, 0, 0, 0.16);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --font-xs: 11px;
  --font-sm: 13px;
  --font-base: 15px;
  --font-md: 16px;
  --font-lg: 18px;
  --font-xl: 22px;
  --font-2xl: 28px;

  --motion-fast: 140ms;
  --motion-base: 200ms;
  --motion-page: 220ms;
  --motion-sheet: 260ms;
  --motion-dialog: 180ms;
  --motion-list: 180ms;

  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: var(--font-base);
  color: var(--color-text-main);
  background: var(--color-app-bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: var(--color-app-bg);
}

body {
  min-width: 320px;
  min-height: 100dvh;
  margin: 0;
  background: var(--color-app-bg);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

O trecho é uma base inicial. O agente pode dividir os tokens em arquivos menores desde que mantenha uma única fonte de verdade e os mesmos valores.

---

## 14. Regras de qualidade visual

Antes de concluir qualquer tela, o agente deve verificar:

- [ ] A tela tem hierarquia visual clara?
- [ ] O usuário entende o próximo passo sem precisar ler instruções longas?
- [ ] O conteúdo principal recebe mais destaque que a decoração?
- [ ] As cores neutras seguem os tokens?
- [ ] Cores semânticas são usadas somente para estados?
- [ ] Os nomes e datas são legíveis em 360px?
- [ ] Os controles têm pelo menos 44px de área de toque?
- [ ] O layout considera safe areas e navegação inferior?
- [ ] Os estados vazio, carregando, erro e sucesso foram considerados?
- [ ] A tela não parece um dashboard administrativo genérico?
- [ ] Há excesso de cards, bordas, sombras ou ícones decorativos?
- [ ] Animações respeitam `prefers-reduced-motion`?
- [ ] Os textos do usuário não são truncados sem alternativa de leitura?
- [ ] O foco por teclado permanece visível?
- [ ] Não existe recurso visual essencial carregado por CDN?

### 14.1 Restrições estéticas

Não utilizar:

- gradientes chamativos ou decorativos;
- glassmorphism como estilo geral;
- blur excessivo;
- sombras pesadas;
- bordas cinza escuras;
- cards coloridos grandes;
- efeitos 3D;
- animação de bounce;
- parallax;
- animação contínua em elementos sem estado de carregamento;
- ícones de estilos diferentes misturados;
- excesso de emojis na interface;
- fontes externas em runtime;
- componentes visuais de dashboard financeiro/ERP.

---

## 15. Critérios de aceite visual

A UI/UX será considerada alinhada a este documento quando:

1. As quatro telas principais (Início, Produtos, Relatórios e Configurações) compartilharem o mesmo sistema visual.
2. O botão `+` for claramente a ação primária e permanecer acessível na navegação principal.
3. O cadastro for curto, com nome e validade em primeiro plano.
4. As quatro situações de validade forem identificáveis por texto e cor semântica consistente.
5. As listas forem compactas e legíveis, sem cards desnecessariamente altos.
6. O agrupamento por data e por nome mantiver a mesma apresentação de itens.
7. O relatório tiver filtros de data claros e ação de copiar evidente.
8. As telas funcionarem em 360px sem rolagem horizontal.
9. A navegação e os formulários respeitarem safe areas e teclado virtual.
10. Os feedbacks, modais e sheets tiverem transições discretas.
11. `prefers-reduced-motion` for respeitado.
12. A aplicação não carregar fontes, ícones ou estilos externos em runtime.
13. O contraste e o foco forem verificáveis.
14. A implementação não introduzir framework visual ou biblioteca de componentes.

---

## 16. Instruções obrigatórias para o agente OpenCode

Antes de implementar ou alterar qualquer tela, componente, CSS, navegação ou interação:

1. Ler integralmente `DESIGN_SYSTEM.md`.
2. Ler a seção funcional correspondente em `ESPECIFICACAO_COMPLETA.md`.
3. Consultar a skill `.opencode/skills/design-system/SKILL.md` quando a tarefa envolver UI/UX.
4. Reutilizar tokens e padrões existentes; não inventar uma nova paleta ou escala.
5. Se um detalhe visual não estiver definido, escolher a solução mais simples que respeite *Invisible Design / Content-First*.
6. Não copiar elementos específicos do Veste que não façam sentido para validade de produtos.
7. Não adicionar Tailwind, framework de interface ou biblioteca de componentes para implementar o design.
8. Ao finalizar, informar telas/componentes afetados e verificar responsividade, acessibilidade e estados.

Em caso de divergência visual, este documento prevalece sobre escolhas ad hoc feitas durante a implementação. Requisitos funcionais explícitos do usuário e `ESPECIFICACAO_COMPLETA.md` continuam prevalecendo sobre detalhes puramente estéticos.

---

## 17. Referências

- Projeto de referência: https://github.com/JonathanCosta/veste
- Design System no README: https://github.com/JonathanCosta/veste#design-system-invisible-design
- Tokens do tema: https://github.com/JonathanCosta/veste/blob/main/tailwind.config.js
- Navegação inferior: https://github.com/JonathanCosta/veste/blob/main/src/components/BottomNav.vue
- Lista e cards: https://github.com/JonathanCosta/veste/blob/main/src/views/WardrobeView.vue
- Dialog e transições: https://github.com/JonathanCosta/veste/blob/main/src/components/CustomDialog.vue
