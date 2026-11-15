# Controle de Validade — Especificação completa de produto e desenvolvimento

> **Diretriz visual obrigatória:** todo layout, tela, componente, estilo, animação e interação deve seguir `DESIGN_SYSTEM.md`. O documento define o sistema visual inspirado no Veste e adaptado ao Controle de Validade; ele não altera a stack técnica aprovada.

> **Documento principal para implementação por agente de IA**  
> Versão: 1.0  
> Idioma da aplicação: português do Brasil (`pt-BR`)  
> Plataforma inicial: PWA para uso pessoal em celular  
> Hospedagem planejada: GitHub Pages  
> Estado: requisitos funcionais e arquitetura inicial aprovados

---

## 0. Instruções obrigatórias para o agente de desenvolvimento

Este documento é a fonte de verdade do projeto. Leia-o integralmente antes de alterar ou criar arquivos.

### 0.1. Como executar o trabalho

1. Inspecione o repositório e seu estado atual antes de modificar qualquer arquivo.
2. Se o repositório já contiver uma aplicação, identifique sua finalidade, tecnologia, comandos e convenções. Preserve código e configurações que não pertençam a este projeto.
3. Implemente o produto descrito neste documento, não apenas um protótipo visual ou telas sem comportamento.
4. Não solicite decisões já tomadas neste documento. Para detalhes de implementação não especificados, siga as regras e os padrões aqui definidos.
5. Não adicione funcionalidades fora do escopo para tornar o sistema parecido com um ERP, controle de estoque ou aplicativo comercial.
6. Não introduza backend, banco remoto, autenticação, sincronização, serviços de notificação, analytics ou dependências grandes.
7. Antes de adicionar qualquer dependência, verifique se o navegador ou a stack já oferece o recurso necessário. Adicione somente dependências pequenas e justificadas.
8. Use APIs e documentação oficiais atuais das bibliotecas escolhidas. Fixe versões compatíveis no `package-lock.json` e não utilize CDN em tempo de execução.
9. Ao terminar cada etapa, execute build, verificação de tipos e testes disponíveis. Corrija erros antes de avançar.
10. Não marque uma funcionalidade como concluída se estiver apenas simulada, com dados falsos ou com botão sem ação.
11. Se uma integração externa for bloqueada por uma limitação que não pode ser resolvida sem backend (por exemplo, CORS), implemente o tratamento correto, mantenha o fluxo manual funcional e documente a limitação. Não crie um proxy ou serviço remoto para contornar a restrição.
12. Ao concluir, apresente resumo do que foi implementado, comandos executados, testes realizados, limitações encontradas e instruções para executar/publicar.

### 0.2. Proteção de outros projetos e do GitHub Pages

O usuário já possui outros projetos publicados no GitHub Pages. Portanto:

- Não altere, substitua ou remova workflows, arquivos, domínios, CNAMEs ou configurações de outros repositórios.
- Não presuma que o repositório atual seja o repositório do aplicativo. Inspecione antes.
- Não reutilize nem sobrescreva o projeto `lista-compras` ou qualquer outra aplicação existente.
- A publicação deste projeto deve acontecer somente no repositório escolhido para o Controle de Validade.
- O caminho-base da publicação deve ser configurável; nunca presuma que o site será servido na raiz do domínio.

### 0.3. Vocabulário normativo

Neste documento:

- **DEVE** significa requisito obrigatório.
- **NÃO DEVE** significa comportamento proibido.
- **PODE** indica comportamento opcional dentro do escopo.
- **MVP** significa primeira versão funcional do aplicativo.

---

# 1. Visão e objetivo do produto

## 1.1. O que é o Controle de Validade

O Controle de Validade é uma aplicação web progressiva (PWA) para cadastrar produtos e acompanhar suas datas de validade. Foi concebido para uso pessoal, principalmente em celular, por uma única pessoa e inicialmente em um único dispositivo.

Sua finalidade é permitir que o usuário descubra rapidamente:

- quais produtos já venceram;
- quais vencem hoje;
- quais estão próximos do vencimento;
- quais ainda estão dentro do período de validade.

O cadastro deve ser rápido. O usuário poderá digitar o nome do produto ou escanear o código de barras EAN com a câmera. Quando o código for identificado, a aplicação tentará buscar a descrição em uma fonte externa configurável, inicialmente a API utilizada pelo scanner da Americanas.

Os registros serão armazenados no próprio navegador por meio do IndexedDB. O aplicativo deverá funcionar offline para consulta, cadastro manual, exclusão, filtros, relatórios e backup. A busca externa de descrição dependerá de internet.

## 1.2. Princípio central

**Simplicidade no cadastro, clareza na consulta e segurança na preservação dos dados.**

As ações centrais são:

1. Cadastrar um produto.
2. Consultar as validades.
3. Copiar um relatório para compartilhar.

Backup, recuperação e configurações dão suporte a essas ações.

## 1.3. Não é um controle de estoque

O aplicativo NÃO DEVE implementar:

- quantidade ou saldo de unidades;
- entrada ou saída de estoque;
- movimentação de produtos;
- consumo, descarte ou baixa;
- inventário;
- compras, fornecedores ou pedidos;
- preços ou comparação de preços;
- histórico de movimentação;
- múltiplos usuários;
- sincronização entre dispositivos;
- login ou cadastro de conta;
- notificações push, SMS, e-mail ou alertas externos;
- rotinas em segundo plano para monitorar vencimentos.

Cada cadastro é uma ocorrência individual. Dois registros podem ter o mesmo nome e EAN e datas de validade diferentes. O sistema pode agrupar esses registros visualmente, mas nunca deve somar ou converter registros em quantidade.

---

# 2. Escopo funcional da primeira versão

A primeira versão DEVE conter:

1. Visão geral com indicadores e vencimentos mais próximos.
2. Cadastro por digitação ou leitura de EAN em uma única tela.
3. Consulta opcional à Americanas, com URL editável nas configurações.
4. Listagem completa de registros.
5. Busca por nome e filtro por situação.
6. Agrupamento visual por data ou por nome do produto.
7. Exclusão manual de registros, com confirmação.
8. Classificação dinâmica das datas de validade.
9. Relatório completo com filtro por intervalo de validade.
10. Cópia do relatório em texto formatado para WhatsApp.
11. Exportação de backup JSON.
12. Importação com escolha entre substituir ou mesclar.
13. Configurações locais do período de proximidade, URL de consulta e agrupamento.
14. Armazenamento local com IndexedDB.
15. PWA instalável e funcionamento offline do núcleo da aplicação.
16. Publicação estática no GitHub Pages.

---

# 3. Stack e decisões arquiteturais

## 3.1. Tecnologias aprovadas

| Camada | Tecnologia | Uso |
|---|---|---|
| Build/dev server | Vite | Desenvolvimento e build estático |
| Linguagem | TypeScript | Regras, serviços e interface |
| Interface | HTML sem framework + CSS | Telas e interações |
| Persistência | IndexedDB | Dados locais |
| Abstração IndexedDB | `idb` | API baseada em Promises |
| Leitor de código | `BarcodeDetector` + `@zxing/browser` | API nativa quando EAN-8 e EAN-13 forem suportados; ZXing como fallback sob demanda |
| PWA | `vite-plugin-pwa` | Manifest e Service Worker |
| Testes unitários | Vitest | Regras de domínio e validações |
| Deploy | GitHub Actions + GitHub Pages | Publicação do diretório `dist` |
| Gerenciador de pacotes | npm | Dependências e scripts |

Não utilizar React, Vue, Angular, Redux, Zustand, Tailwind, Bootstrap, biblioteca de componentes, biblioteca de gráficos ou roteador externo. Não há necessidade desses recursos para o escopo atual.

O uso de `@zxing/library` diretamente só é permitido caso a API pública da versão instalada de `@zxing/browser` exija os enums/tipos para restringir os formatos. Nesse caso, declarar a dependência explicitamente; não importar arquivos internos de `node_modules`.

## 3.2. Ambiente de desenvolvimento

- Node.js: utilizar uma versão LTS compatível com a versão atual do Vite; a linha Node 22 é a referência inicial.
- npm: utilizar `package-lock.json` versionado.
- TypeScript em modo `strict`.
- Build de produção sem depender de serviços externos.
- Não carregar scripts, fontes ou bibliotecas por CDN em runtime.

O agente deve confirmar as versões atuais e a compatibilidade entre Vite, TypeScript e `vite-plugin-pwa` no momento da instalação. Não fixar números de versão desatualizados copiados deste documento.

## 3.3. Arquitetura em camadas

```text
Interface (screens/components)
        |
        v
Serviços de aplicação (services)
        |
        +--------------------+
        |                    |
        v                    v
Domínio/regras            Repositórios
(domain)                  (database)
                             |
                             v
                          IndexedDB

Integrações externas:
- scanner EAN (câmera + BarcodeDetector quando compatível; ZXing como fallback)
- consulta opcional de descrição (Americanas)
```

Responsabilidades:

- `screens`: renderizar telas, receber ações, apresentar estados e mensagens.
- `domain`: tipos, regras puras, validação de datas e classificação.
- `services`: orquestrar operações de cadastro, exclusão, relatórios e backup.
- `database`: abrir banco, atualizar esquema e executar consultas.
- `integrations/scanner`: iniciar/interromper câmera e retornar EAN válido.
- `integrations/lookup`: realizar consulta externa e converter resposta para o tipo interno.
- `app`: inicialização, navegação e estado global mínimo.

A interface NÃO DEVE manipular IndexedDB diretamente. Serviços NÃO DEVEM manipular elementos DOM. Regras de domínio devem ser testáveis sem navegador sempre que possível.

## 3.4. Estrutura de diretórios sugerida

```text
controle-validade/
├── public/
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── icon-maskable-512.png
├── src/
│   ├── app/
│   │   ├── main.ts
│   │   ├── navigation.ts
│   │   ├── state.ts
│   │   └── pwa.ts
│   ├── domain/
│   │   ├── product.ts
│   │   ├── settings.ts
│   │   ├── date.ts
│   │   ├── validity.ts
│   │   ├── ean.ts
│   │   └── errors.ts
│   ├── database/
│   │   ├── db.ts
│   │   ├── products.repository.ts
│   │   └── settings.repository.ts
│   ├── services/
│   │   ├── products.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── reports.service.ts
│   │   ├── backup.service.ts
│   │   └── settings.service.ts
│   ├── integrations/
│   │   ├── scanner.ts
│   │   └── lookup/
│   │       ├── product-lookup.ts
│   │       └── americanas.ts
│   ├── screens/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── product-form/
│   │   ├── reports/
│   │   └── settings/
│   ├── components/
│   │   ├── app-shell.ts
│   │   ├── modal.ts
│   │   ├── toast.ts
│   │   ├── empty-state.ts
│   │   └── status-badge.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   └── components.css
│   └── types/
│       └── pwa.d.ts
├── tests/
│   ├── domain/
│   ├── services/
│   └── fixtures/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
└── README.md
```

A estrutura é uma organização recomendada. O agente pode manter menos arquivos quando isso deixar o código mais simples, mas deve preservar a separação de responsabilidades.

## 3.5. Navegação

Não instalar roteador externo. Utilizar navegação simples baseada em hash para funcionar no GitHub Pages sem configuração de rewrite.

Rotas:

- `#/inicio` — visão geral (rota inicial).
- `#/produtos` — listagem de registros.
- `#/novo` — cadastro.
- `#/relatorios` — relatório.
- `#/configuracoes` — configurações.

A rota desconhecida deve voltar para `#/inicio`. O botão voltar do navegador deve funcionar. Ao abrir `#/novo` diretamente, o formulário deve funcionar normalmente.

Navegação principal em dispositivos móveis: Início, Produtos, Relatórios e Configurações. O botão `+` é uma ação de destaque na visão geral e abre `#/novo`.

---

# 4. Modelo de dados

## 4.1. Produto

Um registro representa um produto individual com uma validade específica.

```typescript
export interface Product {
  id: string;
  name: string;
  expiresAt: string; // YYYY-MM-DD
  ean: string | null;
  brand: string | null;
}
```

Regras:

- `id`: UUID gerado com `crypto.randomUUID()` em cada novo cadastro.
- `name`: obrigatório, trim aplicado, não pode ficar vazio.
- `expiresAt`: obrigatório, data real no formato `YYYY-MM-DD`.
- `ean`: string EAN-8/EAN-13 ou `null`.
- `brand`: string ou `null`.
- Não criar `quantity`, `stock`, `status`, `price`, `createdAt`, `updatedAt` ou histórico de movimentação na primeira versão.
- O status nunca é gravado no banco; é calculado no momento da consulta.
- Não existe edição de produto.

Exemplo de dois registros independentes:

```json
[
  {
    "id": "a91f28a0-0c81-4a91-9ac3-44b1fb2c7c20",
    "name": "Leite integral",
    "expiresAt": "2026-11-15",
    "ean": "7890000000000",
    "brand": null
  },
  {
    "id": "c52e137c-cd0a-453b-a54a-6be49a00b25b",
    "name": "Leite integral",
    "expiresAt": "2026-11-20",
    "ean": "7890000000000",
    "brand": null
  }
]
```

Os IDs acima são exemplos ilustrativos.

## 4.2. Configurações

```typescript
export type GroupingMode = 'date' | 'name';

export interface AppSettings {
  nearExpiryDays: number;
  lookupUrlTemplate: string;
  groupingMode: GroupingMode;
}
```

Valores padrão:

```typescript
export const DEFAULT_SETTINGS: AppSettings = {
  nearExpiryDays: 15,
  lookupUrlTemplate:
    'https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/{ean}',
  groupingMode: 'date',
};
```

Regras:

- `nearExpiryDays`: inteiro de 1 a 365; padrão 15.
- `lookupUrlTemplate`: URL HTTPS que contém exatamente um marcador `{ean}`.
- `groupingMode`: modo de agrupamento inicial e última preferência escolhida.
- Alterar configurações não altera registros de produtos.
- Configurações são armazenadas em uma Object Store separada.

## 4.3. IndexedDB

Nome do banco: `controle-validade`. Versão inicial: `1`.

Object Stores:

### `products`

- `keyPath: 'id'`.
- Índice `expiresAt`, não único.
- Índice `ean`, não único.

### `settings`

- `keyPath: 'key'`.
- Um registro com `key: 'app'` e `value: AppSettings`.

Tipo de registro de configuração:

```typescript
interface SettingsRecord {
  key: 'app';
  value: AppSettings;
}
```

Não criar uma Object Store para catálogo de produtos: o registro de produto já contém nome, EAN e validade. Não criar uma tabela separada de estoque ou de lotes.

## 4.4. Repositórios

API mínima de produto:

```typescript
interface ProductsRepository {
  add(product: Product): Promise<void>;
  getById(id: string): Promise<Product | undefined>;
  getAll(): Promise<Product[]>;
  getByEan(ean: string): Promise<Product[]>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}
```

Não implementar `update()` ou `save()` que possa sobrescrever registro existente. Para criar produto, usar `add()` e não `put()`.

API de configurações:

```typescript
interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}
```

`get()` deve retornar os valores padrão se a configuração ainda não existir. A inicialização pode gravar os padrões na primeira execução.

## 4.5. Versionamento do banco

Toda alteração futura do esquema deve incrementar a versão do IndexedDB e implementar migração no evento `upgrade`. Não apagar o banco inteiro para atualizar a aplicação. A atualização de frontend nunca deve apagar os dados dos usuários.

---

# 5. Regras de datas e validade

## 5.1. Formato

- Armazenar validade como string `YYYY-MM-DD`.
- Exibir em `DD/MM/YYYY`.
- Não persistir horário ou timezone no campo de validade.
- A data atual é obtida do relógio local do dispositivo.
- Comparações são feitas como datas civis, sem hora.

## 5.2. Funções de domínio

Implementar funções puras, testáveis:

```typescript
type ValidityStatus = 'expired' | 'today' | 'upcoming' | 'valid';

function getLocalToday(): string;
function isValidDateOnly(value: string): boolean;
function formatDateBR(value: string): string;
function diffCalendarDays(from: string, to: string): number;
function getValidityStatus(
  expiresAt: string,
  today: string,
  nearExpiryDays: number,
): ValidityStatus;
```

Para evitar deslocamento de dia por timezone e horário de verão:

- construir `today` com `getFullYear()`, `getMonth() + 1` e `getDate()` locais;
- validar datas conferindo se ano/mês/dia reconstituídos continuam iguais aos componentes informados;
- calcular diferenças com componentes convertidos para `Date.UTC(ano, mês - 1, dia)` e dividir por `86_400_000`;
- não utilizar `new Date('YYYY-MM-DD')` para formatar ou comparar datas locais.

Strings `YYYY-MM-DD` válidas também podem ser comparadas lexicograficamente para ordenação, pois o formato é do maior para o menor componente.

## 5.3. Classificação

Definição considerando `daysUntil = diferença em dias entre hoje e expiresAt`:

| Condição | Status | Rótulo pt-BR |
|---|---|---|
| `daysUntil < 0` | `expired` | Vencido |
| `daysUntil === 0` | `today` | Vence hoje |
| `daysUntil >= 1 && daysUntil <= nearExpiryDays` | `upcoming` | Próximo do vencimento |
| `daysUntil > nearExpiryDays` | `valid` | Dentro da validade |

O limite de 15 dias é inclusivo. Exemplo: com padrão 15, produto que vence amanhã ou em 15 dias é `upcoming`; produto que vence em 16 dias é `valid`.

Datas passadas são permitidas no cadastro.

## 5.4. Testes obrigatórios de data

Com `today = 2026-11-12` e `nearExpiryDays = 15`:

| Validade | Resultado |
|---|---|
| `2026-11-11` | Vencido |
| `2026-11-12` | Vence hoje |
| `2026-11-13` | Próximo do vencimento |
| `2026-11-27` | Próximo do vencimento |
| `2026-11-28` | Dentro da validade |

Testar também virada de mês, virada de ano, ano bissexto, fevereiro, datas inválidas e execução em timezone diferente. O resultado da data civil deve permanecer correto.

---

# 6. Cadastro de produtos

## 6.1. Acesso e fluxo

Na visão geral existe um botão `+` facilmente acessível. Ao tocar, abrir diretamente o formulário. Não criar tela de escolha entre digitação e scanner.

O formulário tem:

- nome do produto (obrigatório);
- botão `Escanear código de barras`;
- EAN identificado (opcional, exibido depois da leitura);
- marca (opcional);
- validade (obrigatória);
- botão `Salvar`;
- ação `Cancelar`/voltar.

Os caminhos manual e scanner convergem para o mesmo formulário e a mesma função de validação/gravação.

## 6.2. Cadastro manual

Deve funcionar completamente offline:

1. Digitar nome.
2. Selecionar validade.
3. Salvar.

O EAN pode ficar nulo. Não exigir marca.

## 6.3. Scanner

A leitura deve seguir uma estratégia de melhoria progressiva:

1. Verificar se `BarcodeDetector` está disponível e consultar `BarcodeDetector.getSupportedFormats()`.
2. Usar a API nativa somente se ela confirmar suporte aos dois formatos necessários: `ean_8` e `ean_13`, e se a inicialização do detector funcionar.
3. Se a API não existir, estiver desabilitada, não suportar um dos formatos ou falhar, carregar `@zxing/browser` dinamicamente somente quando o usuário iniciar o scanner.
4. Se ambos os leitores falharem, manter a digitação manual disponível.

Não basta testar somente `'BarcodeDetector' in window`: verificar os formatos suportados em runtime. O suporte à API nativa é limitado em navegadores importantes, por isso o fallback ZXing é obrigatório.

- Carregar `@zxing/browser` dinamicamente somente quando necessário, sem incluí-lo no bundle inicial quando o navegador usar a API nativa.
- A câmera nunca deve iniciar automaticamente ao abrir o formulário.
- Usar `getUserMedia` através da biblioteca; priorizar câmera traseira (`environment`).
- Restringir a leitura a EAN-8 e EAN-13.
- Não aceitar QR Code nem outros formatos na primeira versão.
- Renderizar vídeo dentro de um diálogo/overlay acessível.
- Exibir instrução visual para posicionar o código.
- Oferecer botão Cancelar/Fechar.
- Oferecer lanterna somente se o dispositivo e a API usada suportarem o recurso; não exibir controle falso.
- Encerrar leitura e liberar todas as tracks de mídia ao detectar o primeiro código, cancelar, navegar para fora ou ocorrer erro.
- Não salvar automaticamente depois da leitura.

Se não houver permissão, câmera, dispositivo ou suporte, explicar o problema e manter o formulário manual disponível.

A leitura exige contexto seguro (HTTPS ou localhost). GitHub Pages atende por HTTPS.

## 6.4. Preenchimento depois da leitura

Quando um EAN for reconhecido:

1. Validar formato e dígito verificador.
2. Encerrar câmera.
3. Preencher o campo EAN.
4. Consultar a fonte configurada, se existir e se houver internet.
5. Se o nome estiver vazio e a consulta retornar descrição válida, preencher o nome.
6. Se o nome já estiver preenchido, não sobrescrever silenciosamente. Preservar o texto digitado.
7. Se não houver resultado, manter nome vazio ou o texto previamente digitado e informar que o usuário pode preencher manualmente.

A leitura e a consulta não criam registro. Só o botão Salvar cria um produto.

## 6.5. Validação de EAN

- Tratar EAN como string para preservar zeros à esquerda.
- Aceitar comprimento 8 ou 13.
- Aceitar somente dígitos.
- Validar dígito verificador antes de consultar.
- O índice `ean` do IndexedDB não é único.

## 6.6. Validação de cadastro

Nome:

- obrigatório;
- aplicar `trim()`;
- não aceitar string vazia ou somente espaços;
- preservar acentuação e caixa digitada;
- não converter automaticamente para maiúsculas/minúsculas.

Validade:

- obrigatória;
- deve ser data real no calendário;
- deve ser armazenada como `YYYY-MM-DD`;
- datas passadas são válidas e podem ser cadastradas.

EAN:

- opcional;
- quando presente, deve ser EAN-8 ou EAN-13 válido.

Marca:

- opcional;
- aplicar `trim()`;
- se vazia, armazenar `null`.

## 6.7. Salvamento

Ao tocar em Salvar:

1. Desabilitar o botão enquanto salva.
2. Validar campos.
3. Criar `Product` com `crypto.randomUUID()`.
4. Normalizar valores opcionais para `null`.
5. Gravar com `productsRepository.add()`.
6. Em sucesso, mostrar confirmação e navegar para a visão geral.
7. Em erro do IndexedDB, mostrar mensagem e preservar os campos para nova tentativa.

Clique duplo não pode gerar duas gravações por um único envio. O botão deve permanecer bloqueado durante a operação.

Não há edição de produto. Não implementar tela ou ação de editar.

## 6.8. Produtos repetidos

Não bloquear EAN, nome ou combinação de nome/data repetidos. Cada ação válida de salvar cria um UUID novo.

Nunca incrementar quantidade, alterar validade existente ou substituir registro anterior.

## 6.9. Cancelamento

Cancelar não cria registro. Se scanner estiver aberto, encerrar câmera e cancelar requisição pendente quando possível. Não é necessário salvar rascunho persistente.

---

# 7. Integração de consulta de produto

## 7.1. Interface de provider

A tela de cadastro não deve conhecer detalhes da Americanas. Usar adaptador com contrato comum:

```typescript
export interface ProductLookupResult {
  ean: string;
  name: string;
  brand: string | null;
}

export interface ProductLookupProvider {
  lookup(ean: string): Promise<ProductLookupResult | null>;
}
```

O provider inicial é `AmericanasLookupProvider`.

## 7.2. URL padrão

```text
https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/{ean}
```

Exemplo validado pelo usuário:

```text
https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/7898524349322
```

A URL será editável em Configurações. O marcador `{ean}` será substituído pelo EAN lido.

## 7.3. Validação da URL configurada

- Exigir protocolo `https:`.
- Exigir exatamente um marcador literal `{ean}`.
- Validar a URL substituindo temporariamente o marcador por um EAN de exemplo.
- Rejeitar URL com usuário/senha embutidos.
- Remover espaços no início/fim.
- Não permitir salvar configuração inválida.
- Não exigir que o domínio seja obrigatoriamente Americanas; porém o endpoint precisa retornar o formato esperado pelo provider atual.

Alterar URL não significa suportar automaticamente qualquer API. Para outra fonte com JSON diferente, será necessário implementar outro provider/adaptador.

## 7.4. Requisição

- Método `GET`.
- Cabeçalho `Accept: application/json`.
- Usar `fetch`.
- `credentials: 'omit'`.
- Timeout de 8 segundos com `AbortController`.
- Não realizar retries automáticos.
- Não armazenar cookies, tokens ou credenciais.
- Não persistir preços recebidos.

## 7.5. Resposta esperada

Exemplo observado:

```json
{
  "ean": "7898524349322",
  "sapId": "4330862",
  "description": "CR TRAT SALON LINE 1KG",
  "price": {
    "regular": "R$ 28,99",
    "promotional": "R$ 17,99"
  }
}
```

Mapeamento:

| Resposta | Uso |
|---|---|
| `ean` | Confirmar código consultado |
| `description` | Nome sugerido |
| `sapId` | Ignorar |
| `price.regular` | Ignorar |
| `price.promotional` | Ignorar |

A descrição deve ser string não vazia e deve receber `trim()`. O EAN retornado deve corresponder ao EAN consultado. Resposta inválida ou EAN diferente deve ser tratada como falha de consulta.

## 7.6. Falhas

| Falha | Comportamento no cadastro |
|---|---|
| Produto encontrado | Sugerir/preencher descrição |
| HTTP 404 ou resultado vazio | Informar não encontrado; permitir digitação |
| HTTP 429 | Informar indisponibilidade temporária; permitir digitação |
| HTTP 5xx | Informar falha da fonte; permitir digitação |
| Timeout | Permitir digitação |
| Sem conexão | Permitir digitação |
| CORS/rede bloqueada | Exibir mensagem genérica de consulta indisponível; permitir digitação |
| JSON inválido | Descartar resposta e permitir digitação |
| Descrição vazia | Não preencher nome; permitir digitação |

Não tentar contornar CORS com proxy. CORS é uma restrição do serviço externo; trocar a URL nas configurações só resolve se a fonte permitir chamadas pelo navegador.

## 7.7. Limite da integração

A integração é auxiliar. A disponibilidade da API não pode afetar cadastro manual, consulta local, relatórios ou backup.

Não implementar busca por preço, histórico de preço, comparação comercial ou qualquer outro dado retornado pela Americanas.

---

# 8. Visão geral (dashboard)

## 8.1. Objetivo

Apresentar imediatamente a situação geral dos produtos e permitir iniciar um cadastro com um único toque.

## 8.2. Indicadores

Exibir a contagem de registros em cada status:

- Vencidos.
- Vencem hoje.
- Próximos do vencimento.
- Dentro da validade.

Contagens são número de registros, não quantidade de unidades.

Também pode apresentar total geral de registros.

## 8.3. Lista resumida

Exibir seção de vencimentos mais próximos, ordenada por `expiresAt` crescente e, em empate, por nome normalizado crescente. Mostrar até 10 registros que exigem atenção (vencido, hoje ou próximo). Se não houver nenhum, apresentar estado vazio positivo e acesso à lista completa.

Cada item deve mostrar nome, data de validade e status por texto + cor.

## 8.4. Ação de cadastro

Botão flutuante `+` visível e acessível, com `aria-label="Adicionar produto"`. Deve abrir `#/novo`.

## 8.5. Estados

- Primeiro uso sem produtos: explicar como cadastrar e destacar `+`.
- Sem produtos que exijam atenção: informar que não há vencimentos próximos; não esconder o acesso aos produtos.
- Erro de leitura do banco: mensagem clara com opção de tentar novamente.

---

# 9. Listagem de produtos

## 9.1. Conteúdo

A tela Produtos exibe todos os registros, independentemente do status.

Cada registro deve mostrar:

- nome;
- data de validade formatada;
- status;
- marca, se preenchida;
- EAN, se preenchido;
- ação de excluir.

Não exibir quantidade. Não exibir ação de editar.

## 9.2. Busca

Campo de busca por nome. Busca deve:

- ignorar diferenças entre maiúsculas/minúsculas;
- ignorar acentos;
- procurar trecho contido no nome;
- aplicar `trim()` na expressão digitada.

Implementar normalização sem alterar o texto armazenado:

```typescript
function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}
```

## 9.3. Filtro de status

Opções:

- Todos (padrão).
- Vencidos.
- Vence hoje.
- Próximos do vencimento.
- Dentro da validade.

Busca e filtro são combinados com condição AND.

## 9.4. Agrupamento

O usuário poderá alternar entre:

### Agrupar por data

- Agrupar registros com o mesmo `expiresAt`.
- Título do grupo mostra a data em formato brasileiro.
- Dentro do grupo, ordenar por nome.
- Grupos ordenados pela data crescente.

### Agrupar por nome

- Agrupar nomes exatamente iguais após normalização de acentos, espaços externos e caixa.
- Não utilizar aproximação/fuzzy matching.
- O nome de exibição deve ser o texto original do registro escolhido para representar o grupo (deterministicamente, o primeiro nome original em ordem alfabética dentro do grupo).
- Cada ocorrência permanece listada com sua própria validade e status.
- Ordenar ocorrências dentro do grupo por validade crescente.
- Ordenar grupos pela menor data de validade do grupo; em empate, pelo nome normalizado.

Não agrupar por EAN ou marca. Agrupar é somente apresentação, sem alterar registros.

A última forma escolhida deve ser salva em `settings.groupingMode`.

## 9.5. Ordenação sem agrupamento adicional

Ordenação padrão: validade crescente, depois nome normalizado, depois ID para desempate determinístico.

## 9.6. Exclusão

- Cada registro tem ação Excluir.
- Antes de excluir, exibir confirmação com nome e validade.
- Não oferecer edição.
- Após confirmar, chamar `delete(id)`.
- Atualizar lista e indicadores.
- Em falha, manter registro visível e mostrar erro.
- A exclusão é definitiva no dispositivo; a recuperação só será possível por backup.

Não é necessário implementar lixeira, arquivamento ou exclusão automática.

---

# 10. Relatórios e cópia para WhatsApp

## 10.1. Princípio

O relatório é completo: inclui todos os registros que atendem ao filtro de validade selecionado, não apenas produtos próximos do vencimento.

## 10.2. Filtro por data

O filtro usa a **data de validade**, não data de cadastro.

Campos:

- Data inicial (opcional).
- Data final (opcional).

Regras:

- Ambos vazios: incluir todos os registros.
- Somente data inicial: incluir `expiresAt >= dataInicial`.
- Somente data final: incluir `expiresAt <= dataFinal`.
- Ambas preenchidas: incluir intervalo inclusivo (`>= inicial` e `<= final`).
- Se data inicial for posterior à final, impedir geração e apresentar validação.
- Não definir intervalo padrão limitado; ao abrir, o relatório começa sem filtros e exibe todos os registros.
- Exibir claramente o período aplicado: `Todas as datas` ou intervalo/limite escolhido.

## 10.3. Classificação do relatório

Depois de filtrar pela data de validade, classificar cada registro usando a data local de hoje e `nearExpiryDays` atual.

Logo, um relatório de um intervalo passado pode conter produtos classificados como vencidos, pois o status é sempre relativo à data atual.

## 10.4. Conteúdo visual

Mostrar:

- título do relatório;
- período selecionado;
- data de geração;
- seções por status;
- nome e data de validade de cada registro;
- contagem por status;
- total geral.

Ordenar os registros por data crescente e nome.

Omitir seções vazias para evitar poluição visual, mas sempre exibir total geral e totais das categorias com registros.

## 10.5. Texto copiado

Gerar uma versão texto compatível com a formatação do WhatsApp:

- `*texto*` para negrito;
- emojis para distinguir categorias;
- linhas curtas;
- separação entre seções;
- período consultado;
- data da geração;
- totais.

Modelo:

```text
📋 *RELATÓRIO DE VALIDADE*

📅 Período: 01/11/2026 a 30/11/2026
🗓️ Gerado em: 12/11/2026

🔴 *VENCIDOS (2)*
- Leite integral — 08/11/2026
- Iogurte natural — 09/11/2026

🟠 *VENCEM HOJE (1)*
- Queijo muçarela — 12/11/2026

🟡 *PRÓXIMOS DO VENCIMENTO (2)*
- Presunto — 15/11/2026
- Creme de leite — 20/11/2026

🟢 *DENTRO DA VALIDADE (1)*
- Arroz — 28/11/2026

*TOTAL: 6 REGISTROS*
```

Os valores acima são somente exemplo. O texto real deve vir do banco.

## 10.6. Copiar

- Botão `Copiar relatório`.
- Usar `navigator.clipboard.writeText()` acionado diretamente pelo clique do usuário.
- Em sucesso, mostrar confirmação visual discreta.
- Se Clipboard API não estiver disponível ou falhar, abrir área de texto somente leitura com conteúdo selecionável e instrução para copiar manualmente.
- Não enviar mensagem automaticamente, não abrir WhatsApp automaticamente e não exigir integração com WhatsApp.

## 10.7. Relatório vazio

Se nenhum registro corresponder ao filtro:

- exibir mensagem de que não há produtos no período;
- exibir total zero;
- desabilitar ou ocultar ação de copiar relatório vazio.

---

# 11. Configurações

Tela única, simples e dividida por assuntos.

## 11.1. Período de proximidade

- Campo numérico inteiro.
- Padrão 15 dias.
- Mínimo 1.
- Máximo 365.
- Persistir em `nearExpiryDays`.
- Recalcular todos os status imediatamente após salvar.

## 11.2. URL da consulta de EAN

- Campo de texto editável.
- Valor inicial da Americanas.
- Deve conter exatamente um `{ean}`.
- Exigir HTTPS.
- Validar antes de salvar.
- Exibir mensagem explicando que o formato de resposta esperado é compatível com o provider atual.
- Não armazenar tokens/segredos.
- Alterar URL não modifica registros anteriores.

Não implementar configuração genérica de mapeamento JSON na primeira versão.

## 11.3. Agrupamento padrão

Opções: por data ou por nome. Persistir a escolha em `groupingMode`.

## 11.4. Backup e recuperação

Acessos para exportar e importar devem estar nessa tela, além de estarem disponíveis de maneira clara e fácil.

---

# 12. Backup e recuperação

## 12.1. Formato do arquivo

Nome do arquivo:

```text
controle-validade-backup-YYYY-MM-DD.json
```

Estrutura versão 1:

```json
{
  "schema": "controle-validade-backup",
  "version": 1,
  "exportedAt": "2026-11-12T20:30:00.000Z",
  "appVersion": "1.0.0",
  "products": [
    {
      "id": "a91f28a0-0c81-4a91-9ac3-44b1fb2c7c20",
      "name": "Leite integral",
      "expiresAt": "2026-11-15",
      "ean": "7890000000000",
      "brand": null
    }
  ],
  "settings": {
    "nearExpiryDays": 15,
    "lookupUrlTemplate": "https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/{ean}",
    "groupingMode": "date"
  }
}
```

- `schema` identifica o tipo de arquivo.
- `version` versiona o formato do backup, independente da versão do IndexedDB.
- `exportedAt` é timestamp ISO UTC de exportação, não data de validade.
- `appVersion` vem da versão do projeto.
- `products` contém todos os registros, inclusive vencidos.
- `settings` contém as configurações atuais.

## 12.2. Exportação

1. Consultar todos os produtos e configurações.
2. Ordenar produtos por `expiresAt`, nome e ID.
3. Montar objeto no formato acima.
4. Serializar JSON indentado com dois espaços e UTF-8.
5. Criar arquivo Blob `application/json`.
6. Iniciar download com nome padrão.
7. Revogar `ObjectURL` depois do download.

Não exportar status calculado, dados de preço, tokens ou dados de serviços externos.

## 12.3. Validação da importação

Antes de alterar qualquer dado:

- Ler o arquivo escolhido pelo usuário.
- Fazer parse JSON com tratamento de erro.
- Validar `schema`.
- Aceitar somente `version: 1` nesta versão.
- Validar que `products` é array.
- Validar cada produto: UUID, nome não vazio, data real `YYYY-MM-DD`, EAN nulo ou válido, marca nula ou string.
- Validar que não há IDs repetidos dentro do próprio arquivo.
- Validar `settings` e seus limites.
- Validar URL HTTPS com exatamente um `{ean}`.
- Se qualquer registro for inválido, rejeitar o arquivo inteiro e não importar parcialmente.
- Campos extras desconhecidos podem ser ignorados, mas campos obrigatórios ausentes ou tipos incorretos invalidam o backup.

A importação deve ser atômica. Nunca apagar os registros atuais antes de terminar a validação do arquivo e da escolha do usuário.

## 12.4. Escolha no momento da recuperação

Depois da validação, oferecer:

### Substituir

- Exibir confirmação explícita de que todos os registros atuais serão removidos.
- Importar exatamente os produtos do arquivo.
- Restaurar também as configurações do arquivo.
- Se `products` for array vazio, a substituição deixará a lista sem produtos; isso é permitido, após confirmação.

### Mesclar

- Manter todos os registros e configurações atuais.
- Para cada produto importado, verificar o `id`.
- Se o ID já existir, não sobrescrever e contar como ignorado.
- Se o ID não existir, inserir como novo registro.
- Não deduplicar por nome, EAN ou data: registros com IDs diferentes são ocorrências distintas, mesmo se os demais campos forem idênticos.
- Manter as configurações atuais; mesclar não deve trocar preferências do usuário.
- Mostrar resumo: adicionados e ignorados por ID existente.

## 12.5. Atomicidade

- Substituição: uma transação `readwrite` envolvendo `products` e `settings`; limpar produtos, inserir produtos importados e salvar configurações importadas dentro da mesma transação. Se falhar, a transação deve abortar e preservar o estado anterior.
- Mesclagem: uma transação `readwrite` em `products`; inserir apenas IDs inexistentes. A configuração atual não é alterada.
- Não fazer `await` de requisições de rede durante transação IndexedDB.
- Só apresentar sucesso depois de `tx.done`.

## 12.6. Segurança e UX

- Nunca importar automaticamente após selecionar o arquivo; primeiro validar e exibir escolha.
- Nunca substituir dados sem confirmação.
- Informar que a mesclagem não substitui um registro de mesmo ID.
- Se a importação falhar, mostrar erro e manter dados atuais.
- Não enviar backup para servidor. O arquivo permanece sob controle do usuário.

---

# 13. PWA e funcionamento offline

## 13.1. Manifesto

Definir:

- `name`: `Controle de Validade`.
- `short_name`: `Validades`.
- `lang`: `pt-BR`.
- `display`: `standalone`.
- `start_url`: baseado em `import.meta.env.BASE_URL`.
- `scope`: baseado no caminho-base da publicação.
- `theme_color` e `background_color` coerentes com a interface.
- ícones 192x192, 512x512 e 512x512 maskable.

Criar ícones próprios simples em SVG/PNG, sem depender de serviço remoto.

## 13.2. Service Worker

Usar `vite-plugin-pwa` com estratégia `generateSW` e registro do tipo `prompt`.

Motivo: uma atualização não deve recarregar a aplicação automaticamente enquanto o usuário estiver preenchendo um cadastro ou relatório.

Comportamento:

- Fazer precache do shell estático e assets versionados.
- Mostrar aviso quando houver atualização disponível.
- Oferecer `Atualizar agora` e `Mais tarde`.
- Só chamar atualização/reload após ação do usuário.
- Mostrar aviso quando o app estiver pronto para funcionamento offline.
- Nunca armazenar resposta da API externa como requisito para funcionamento.
- Não armazenar registros de produto no cache do Service Worker; eles ficam no IndexedDB.
- Não criar cache de chamadas de consulta da Americanas.

## 13.3. Funcionalidades offline

Após o primeiro carregamento online e cache concluído, devem funcionar offline:

- inicialização da PWA;
- navegação entre telas;
- leitura do IndexedDB;
- cadastro manual;
- exclusão;
- busca e filtros;
- classificação das validades;
- agrupamento;
- relatório;
- cópia do relatório quando o navegador permitir;
- backup e recuperação local.

Dependem de internet:

- primeira instalação/carregamento do app;
- consulta externa de descrição do produto;
- obtenção de atualizações do aplicativo.

O scanner usa a câmera e pode funcionar offline para ler o EAN, usando BarcodeDetector quando plenamente compatível ou ZXing como fallback; somente a consulta do nome à API externa depende da internet.

## 13.4. Armazenamento persistente

Na inicialização, consultar `navigator.storage.persisted()` e tentar `navigator.storage.persist()` quando disponível, sem bloquear a aplicação se a solicitação for negada.

Não prometer que os dados são impossíveis de perder. Exibir nas configurações uma orientação simples para fazer backups regularmente.

---

# 14. Interface, UX e acessibilidade

## 14.1. Direção visual

- Interface limpa, leve e funcional.
- Mobile-first.
- Priorizar leitura rápida de datas e status.
- Fundo claro como padrão; respeitar `prefers-color-scheme: dark` com tema escuro equivalente.
- CSS custom properties para cores, espaçamentos, raios e tipografia.
- Evitar frameworks visuais, gradientes decorativos, animações excessivas e cards sem função.
- Usar animações curtas e discretas somente quando melhorarem feedback ou transição.

## 14.2. Cores e status

Usar cores distintas para status, mas sempre acompanhadas de texto e/ou ícone. Cor nunca deve ser o único indicador.

Sugestão:

- Vencido: vermelho.
- Vence hoje: laranja.
- Próximo: amarelo/âmbar.
- Dentro da validade: verde.

Garantir contraste adequado em tema claro e escuro.

## 14.3. Acessibilidade

- HTML semântico.
- Labels associados aos campos.
- Botões com nomes acessíveis.
- Foco visível.
- Navegação por teclado.
- Dialogs com foco controlado, fechamento acessível e retorno de foco.
- Mensagens de sucesso/erro anunciadas com região `aria-live`.
- Inputs com tamanho e contraste adequados a celular.
- Alvos de toque confortáveis.

## 14.4. Segurança da interface

Nunca inserir nome, marca, EAN ou conteúdo de backup com interpolação não escapada em `innerHTML`. Preferir `textContent`, `createElement` ou templates com escape confiável. Todo conteúdo importado ou retornado por API é dado não confiável.

---

# 15. Estados, mensagens e erros

Todas as mensagens visíveis devem estar em português do Brasil, com linguagem direta.

Estados a contemplar:

- carregando dados;
- lista vazia;
- nenhum resultado de busca;
- nenhum produto no filtro selecionado;
- produto salvo;
- falha ao salvar;
- exclusão confirmada;
- falha ao excluir;
- câmera sem permissão;
- câmera indisponível;
- scanner iniciado;
- EAN identificado;
- produto não encontrado na fonte;
- fonte de consulta indisponível;
- arquivo de backup inválido;
- backup exportado;
- restauração concluída;
- restauração cancelada;
- atualização da PWA disponível;
- aplicação pronta para offline.

Não usar `alert()`/`confirm()` nativos como interface principal. Criar componentes simples de diálogo e toast. Confirmação de exclusão e substituição de backup deve ser modal acessível.

---

# 16. Segurança, privacidade e limites

- Não há conta, login ou dados de usuário enviados a servidor próprio.
- Produtos são armazenados localmente no navegador.
- A consulta externa envia o EAN para o endpoint configurado; informar isso de forma simples na interface do scanner/configurações.
- Não enviar nome, data de validade ou lista inteira para a Americanas.
- A chamada externa deve usar `credentials: 'omit'`.
- Não guardar tokens, cookies ou credenciais.
- Validar arquivo de backup antes de importá-lo.
- Não executar HTML/script vindo do backup ou API.
- Não registrar produtos em logs remotos ou analytics.
- Não instalar rastreadores ou ferramentas de publicidade.
- Não criar integração que envie mensagens ao WhatsApp.

---

# 17. Testes e qualidade

## 17.1. Scripts mínimos

Configurar scripts equivalentes a:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

Ajustar os comandos ao `tsconfig` criado, sem manter scripts que não funcionem.

## 17.2. Testes automatizados obrigatórios

### Domínio de datas

- Todos os limites da seção 5.
- Datas inválidas.
- Fevereiro em ano bissexto e não bissexto.
- Virada de mês e ano.
- Datas locais em timezone diferente.

### EAN

- EAN-8 válido e inválido.
- EAN-13 válido e inválido.
- zeros à esquerda.
- comprimento incorreto.
- caracteres não numéricos.
- dígito verificador incorreto.

### Produtos

- nome vazio rejeitado;
- data inválida rejeitada;
- data passada aceita;
- dois registros com mesmo EAN recebem IDs diferentes;
- exclusão remove somente o ID solicitado.

### Lookup

- mapeamento do JSON esperado;
- descrição ausente;
- EAN retornado diferente;
- JSON inválido;
- HTTP 404, 429 e 500;
- timeout;
- erro de rede/CORS tratado sem quebrar cadastro.

### Relatórios

- nenhum filtro inclui todos os registros;
- limite inicial inclusivo;
- limite final inclusivo;
- intervalo inclusivo;
- intervalo inválido rejeitado;
- classificação baseada na data atual;
- contagens por status;
- texto copiado no formato esperado.

### Backup

- exportar arquivo com todos os registros e configurações;
- importar backup válido;
- rejeitar JSON inválido;
- rejeitar versão não suportada;
- rejeitar ID repetido dentro do arquivo;
- substituir dados e configurações;
- mesclar IDs novos;
- ignorar IDs existentes sem sobrescrever;
- manter configurações atuais na mesclagem;
- rollback se falhar operação transacional.

## 17.3. Testes manuais em dispositivos

Realizar pelo menos:

- Chrome Android ou navegador Chromium em Android.
- Safari em iOS, se disponível para validação.
- instalação da PWA.
- permissão e negação de câmera.
- leitura EAN-8 e EAN-13.
- desligar internet após primeiro carregamento.
- fechar e reabrir app e confirmar dados persistentes.
- copiar relatório.
- baixar e importar backup.
- atualizar versão do app sem perder IndexedDB.

A compatibilidade de câmera precisa ser verificada em aparelho real; testes unitários não substituem esse teste.

## 17.4. Critério de qualidade

A implementação não está pronta enquanto:

- `npm run build` falhar;
- `npm run typecheck` falhar;
- testes automatizados falharem;
- cadastro manual não funcionar offline;
- uma atualização da PWA puder apagar o IndexedDB;
- scanner deixar a câmera ativa após fechar;
- importação parcial puder deixar o banco inconsistente;
- botões exibidos não tiverem comportamento real.

---

# 18. Implantação no GitHub Pages

## 18.1. Build estático

A aplicação deve gerar o diretório `dist` e não necessitar de servidor de aplicação.

## 18.2. Caminho-base configurável

No `vite.config.ts`, configurar `base` por variável de ambiente, com fallback `/`.

Exemplo conceitual:

```typescript
const base = process.env.VITE_BASE_PATH ?? '/';
```

A configuração efetiva deve respeitar o tipo de módulo do Vite/Node; usar `loadEnv` ou `process.env` conforme a implementação correta.

- GitHub Pages em domínio raiz: base `/`.
- GitHub Pages de projeto: base `/<nome-do-repositorio>/`.
- Domínio personalizado apontando para raiz: base `/`.

Todos os caminhos de assets, manifest, `start_url`, `scope` e Service Worker devem respeitar a base configurada.

Não fixar `/controle-validade/` no código sem verificar o repositório/domínio real.

## 18.3. GitHub Actions

Criar workflow somente no repositório deste projeto, usando o fluxo oficial do GitHub Pages:

1. checkout;
2. configurar Node e cache npm;
3. `npm ci`;
4. definir `VITE_BASE_PATH` conforme o contexto de publicação;
5. `npm run build`;
6. configurar Pages;
7. enviar `dist` como artifact;
8. deploy com `actions/deploy-pages`.

Permissões mínimas necessárias devem ser configuradas para publicação, incluindo `pages: write` e `id-token: write` no job de deploy. Publicar somente a partir da branch principal definida pelo repositório.

O agente deve seguir a documentação atual do GitHub para versões das Actions. Não copiar versões antigas automaticamente.

## 18.4. Proteção do armazenamento na publicação

A origem (protocolo + host) define o armazenamento do navegador; manter domínio estável depois de começar a usar. Alterar o domínio pode fazer a aplicação parecer sem dados porque o IndexedDB pertence à origem anterior.

Não mudar o caminho/domínio de publicação sem considerar o impacto sobre Service Worker e acesso ao armazenamento já criado.

---

# 19. Critérios de aceite gerais da primeira versão

A primeira versão está funcional quando todos os itens abaixo forem atendidos:

## Cadastro

- [ ] Botão `+` abre diretamente o formulário.
- [ ] Usuário consegue cadastrar manualmente sem internet.
- [ ] Usuário consegue abrir scanner por ação explícita.
- [ ] Scanner lê EAN-8 e EAN-13.
- [ ] Scanner encerra câmera depois da leitura ou cancelamento.
- [ ] Consulta externa sugere nome quando possível.
- [ ] Falha externa não bloqueia cadastro.
- [ ] Nome e validade são obrigatórios.
- [ ] Datas passadas são aceitas.
- [ ] Cada salvamento cria novo UUID.
- [ ] EAN repetido é permitido.
- [ ] Registro salvo não pode ser editado.

## Consulta

- [ ] Dashboard mostra contagens dos quatro status.
- [ ] Dashboard exibe produtos que exigem atenção.
- [ ] Listagem mostra todos os registros.
- [ ] Busca ignora caixa e acentos.
- [ ] Filtro de status funciona.
- [ ] Agrupamento por data funciona.
- [ ] Agrupamento por nome funciona.
- [ ] Agrupamento não soma produtos nem cria quantidade.
- [ ] Exclusão exige confirmação.

## Relatório

- [ ] Relatório começa sem filtro e contém todos os registros.
- [ ] Filtro por validade aceita início, fim ou ambos.
- [ ] Limites de data são inclusivos.
- [ ] Status é calculado em relação ao dia atual.
- [ ] Texto inclui categorias, produtos, datas e totais.
- [ ] Cópia funciona ou apresenta alternativa selecionável.
- [ ] Nenhuma mensagem é enviada automaticamente.

## Backup

- [ ] Exporta todos os registros, inclusive vencidos.
- [ ] Exporta configurações.
- [ ] Valida arquivo antes de importar.
- [ ] Usuário escolhe substituir ou mesclar.
- [ ] Substituir pede confirmação e restaura configurações do arquivo.
- [ ] Mesclar preserva configurações atuais.
- [ ] Mesclar evita duplicidade por ID.
- [ ] Mesclar não elimina registros distintos com mesmo nome/EAN.
- [ ] Importação é atômica.

## PWA e publicação

- [ ] App pode ser instalado.
- [ ] App abre offline após carregamento inicial.
- [ ] Dados continuam disponíveis após fechar/reabrir.
- [ ] Atualização não recarrega automaticamente durante operação.
- [ ] Build funciona na raiz e em subcaminho configurado.
- [ ] GitHub Actions publica `dist`.
- [ ] Nenhum outro projeto ou configuração de Pages foi alterado.

---

# 20. Ordem obrigatória de implementação

Implementar nesta ordem para reduzir retrabalho:

### Etapa 1 — Fundação

- Criar Vite + TypeScript Vanilla.
- Configurar TypeScript strict, scripts e build.
- Criar estrutura inicial.
- Definir base path.
- Criar layout responsivo e navegação hash.

### Etapa 2 — Domínio e banco

- Implementar tipos `Product` e `AppSettings`.
- Implementar funções de data e status.
- Implementar validação EAN.
- Abrir IndexedDB versão 1.
- Criar repositórios e valores padrão.
- Testar persistência.

### Etapa 3 — Cadastro manual

- Criar botão `+` e formulário.
- Implementar validações.
- Salvar via repository `add()`.
- Tratar loading, sucesso e falhas.
- Confirmar que cadastro funciona offline.

### Etapa 4 — Scanner e consulta externa

- Implementar detecção de suporte a `BarcodeDetector` e seus formatos EAN-8/EAN-13.
- Integrar ZXing com import dinâmico como fallback.
- Validar o dígito verificador EAN-8/EAN-13.
- Gerenciar ciclo de vida da câmera.
- Criar provider Americanas.
- Criar configuração editável da URL.
- Testar CORS no domínio real.
- Preservar cadastro manual se API falhar.

### Etapa 5 — Listagem e dashboard

- Criar dashboard e indicadores.
- Criar listagem completa.
- Implementar busca/filtro.
- Implementar agrupamento por data/nome.
- Implementar exclusão com confirmação.

### Etapa 6 — Relatórios

- Criar filtro por intervalo de validade.
- Agrupar por status.
- Gerar texto WhatsApp.
- Implementar cópia e fallback.

### Etapa 7 — Backup e configurações

- Criar exportação JSON.
- Criar parser/validador de backup.
- Implementar substituir e mesclar atomicamente.
- Criar tela de configurações.
- Validar persistência de configurações.

### Etapa 8 — PWA e publicação

- Criar manifest e ícones.
- Configurar `vite-plugin-pwa` e Service Worker.
- Implementar aviso de atualização.
- Configurar GitHub Actions.
- Validar deploy raiz/subcaminho.
- Executar testes offline e em celular.

### Etapa 9 — Revisão final

- Executar todos os testes.
- Revisar acessibilidade.
- Revisar estados vazios/erros.
- Conferir ausência de funcionalidades fora de escopo.
- Atualizar README com instalação, desenvolvimento, build e publicação.

---

# 21. Checklist de proibições e prevenção de escopo

O agente NÃO DEVE:

- criar quantidade, saldo ou movimentação;
- adicionar edição de produto;
- bloquear EAN duplicado;
- impedir datas passadas;
- excluir vencidos automaticamente;
- implementar alertas externos;
- implementar autenticação ou sincronização;
- criar backend para a consulta sem autorização explícita;
- usar Americanas para obter ou mostrar preços;
- bloquear cadastro manual por falha da API;
- transformar agrupamento visual em estoque;
- fazer upload de backup para nuvem;
- adicionar analytics/telemetria;
- usar dados falsos na versão final;
- deixar ações sem implementação;
- sobrescrever projetos ou deployments GitHub Pages não relacionados.

---

# 22. Referências técnicas oficiais

Consultar a documentação atual durante a implementação, especialmente se alguma API ou assinatura da biblioteca tiver mudado.

- Vite — Getting Started: https://vite.dev/guide/
- Vite — Build e base path: https://vite.dev/guide/build
- Vite — configuração `base`: https://vite.dev/config/shared-options
- idb — biblioteca e API: https://github.com/jakearchibald/idb
- ZXing Browser — README e exemplos de câmera: https://github.com/zxing-js/browser
- MDN Barcode Detection API — disponibilidade e formatos suportados: https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API
- ZXing Library — formatos EAN: https://github.com/zxing-js/library
- vite-plugin-pwa — documentação e configuração: https://vite-pwa-org.netlify.app/
- GitHub Pages — workflows personalizados: https://docs.github.com/pt/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- MDN — IndexedDB: https://developer.mozilla.org/docs/Web/API/IndexedDB_API
- MDN — MediaDevices/getUserMedia: https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia
- MDN — StorageManager.persist: https://developer.mozilla.org/docs/Web/API/StorageManager/persist
- MDN — Clipboard.writeText: https://developer.mozilla.org/docs/Web/API/Clipboard/writeText

---

# 23. Definição final do produto

O Controle de Validade é uma PWA local-first, simples e instalável, para registrar ocorrências individuais de produtos e acompanhar suas datas de vencimento.

O usuário adiciona pelo botão `+`, digita o nome ou escaneia o EAN, informa a validade e salva. O aplicativo calcula automaticamente os status, permite consulta com busca, filtros e agrupamento por data ou nome, gera relatório completo por intervalo de validade e copia o resultado para WhatsApp. Os registros podem ser excluídos manualmente, mas não editados; os vencidos permanecem até exclusão. Backup JSON permite substituir ou mesclar dados no momento da recuperação.

A aplicação funciona sem backend, sem login e sem sincronização. IndexedDB guarda os dados localmente; Vite + TypeScript implementam a aplicação; BarcodeDetector realiza leitura nativa quando suporta EAN-8 e EAN-13, com ZXing como fallback; a Americanas é uma fonte opcional e configurável de descrição; `vite-plugin-pwa` fornece instalação e cache offline; GitHub Pages hospeda os arquivos estáticos.

**A implementação deve priorizar o funcionamento real dos fluxos essenciais e a preservação dos dados, sem ampliar o escopo além do que está descrito aqui.**
