---
name: db-architecture
description: Use ao criar, consultar ou alterar IndexedDB, repositórios, modelos de produto, configurações, datas civis ou cálculo de validade. Carregue esta skill antes de qualquer mudança nesses componentes.
---

# Arquitetura de dados, IndexedDB e datas

## Fonte de verdade

- Siga `ESPECIFICACAO_COMPLETA.md`. Esta skill detalha como implementar suas regras; não pode redefinir o produto.
- Se houver divergência, prevalece o requisito explícito mais recente do usuário e depois a especificação.
- O produto não é um sistema de estoque. Não introduza quantidades, lotes, movimentações ou saldo.

## Persistência

- Use exclusivamente a biblioteca `idb` como abstração para IndexedDB. Não adicionar Dexie, localForage, SQLite, ORM ou outro wrapper de persistência.
- Centralize `DB_NAME` e `DB_VERSION` em `src/database/db.ts` ou no módulo equivalente já estabelecido.
- Nome do banco: `controle-validade`. Versão inicial: `1`.
- Toda mudança de schema exige incrementar `DB_VERSION` e implementar migração compatível no callback `upgrade(db, oldVersion, newVersion, transaction)`.
- Nunca apagar e recriar o banco para atualizar a aplicação. Nunca remover dados existentes durante uma migração sem requisito explícito e migração segura.

### Object Stores

`products`:
- `keyPath: 'id'`.
- Índice `expiresAt`, não único.
- Índice `ean`, não único. EAN repetido é permitido.

`settings`:
- `keyPath: 'key'`.
- Registro único da aplicação: `{ key: 'app', value: AppSettings }`.

Tipos canônicos definidos na especificação:

```ts
export interface Product {
  id: string;
  name: string;
  expiresAt: string; // YYYY-MM-DD
  ean: string | null;
  brand: string | null;
}

export type GroupingMode = 'date' | 'name';

export interface AppSettings {
  nearExpiryDays: number;
  lookupUrlTemplate: string;
  groupingMode: GroupingMode;
}
```

Padrões de configuração:

```ts
export const DEFAULT_SETTINGS: AppSettings = {
  nearExpiryDays: 15,
  lookupUrlTemplate:
    'https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/{ean}',
  groupingMode: 'date',
};
```

## Regras do modelo

- `id` é UUID criado com `crypto.randomUUID()` a cada inclusão.
- `name` é obrigatório e deve receber `trim()`.
- `expiresAt` é obrigatório, data civil válida em `YYYY-MM-DD`.
- `ean` e `brand` são opcionais e devem ser armazenados como `null` quando vazios.
- O mesmo EAN, nome ou data pode aparecer em vários registros. Não criar índice único nem regra de deduplicação por conteúdo.
- Não adicionar `barcode`, `expiryDate`, `batch`, `quantity`, `stock`, `status`, `price`, `createdAt`, `updatedAt` ou histórico. Os nomes canônicos são `ean` e `expiresAt`; lote e timestamp de criação não pertencem ao escopo aprovado.
- O status de validade nunca é persistido.

## Repositórios

A API mínima de produtos deve respeitar a especificação:

```ts
interface ProductsRepository {
  add(product: Product): Promise<void>;
  getById(id: string): Promise<Product | undefined>;
  getAll(): Promise<Product[]>;
  getByEan(ean: string): Promise<Product[]>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}
```

- Inclusão deve usar `add()`, nunca `put()`.
- Não implementar `update()`, `save()` ou qualquer método que sobrescreva produto existente.
- A exclusão em massa só deve ser usada pelos fluxos de substituição de backup, em transação atômica.
- Configurações são mutáveis. `put()` pode ser usado na Object Store `settings`; a proibição de `put()` aplica-se aos produtos.
- Não acessar IndexedDB diretamente a partir das telas. Usar repositórios/serviços.

## Datas civis

- O campo `expiresAt` é uma data sem horário: `YYYY-MM-DD`.
- Nunca persistir `Date` para validade.
- Não usar `new Date('YYYY-MM-DD')` para interpretar data civil local.
- Não usar `new Date().toISOString().slice(0, 10)` nem `toISOString().split('T')[0]` para descobrir hoje; isso retorna a data UTC, que pode diferir do dia local.
- O relógio local do aparelho define o dia atual.
- Centralizar toda utilização de `Date` em um único módulo, por exemplo `src/domain/date.ts`. Outros módulos devem consumir suas funções e não instanciar `Date`.
- Não criar `createdAt`: a especificação aprovada exclui esse campo.

API recomendada para `date.ts`:

```ts
export function todayLocal(): string;
export function isValidDateOnly(value: string): boolean;
export function formatDateBR(value: string): string;
export function addDays(isoDate: string, days: number): string;
export function diffCalendarDays(from: string, to: string): number;
```

Regras de implementação:

- `todayLocal()` monta a string com `getFullYear()`, `getMonth() + 1` e `getDate()` locais.
- `isValidDateOnly()` valida formato e calendário real; não basta regex. Rejeitar, por exemplo, `2026-02-30`.
- Para aritmética, converter os componentes para um número de dia UTC via `Date.UTC(year, month - 1, day)`. Essa conversão é apenas matemática; não interpretar `YYYY-MM-DD` por `new Date(string)`.
- `addDays()` deve tratar corretamente mudança de mês, ano e ano bissexto.
- Comparação lexicográfica só é permitida depois de validar que ambas as strings são datas canônicas `YYYY-MM-DD`.
- Funções de domínio devem receber `today` como argumento sempre que possível, para testes determinísticos.

## Status de validade

Use exatamente os status da especificação:

```ts
export type ValidityStatus = 'expired' | 'today' | 'upcoming' | 'valid';
```

Com `daysUntil = diffCalendarDays(today, expiresAt)`:

- `< 0`: `expired`.
- `=== 0`: `today`.
- `>= 1 && <= nearExpiryDays`: `upcoming`.
- `> nearExpiryDays`: `valid`.

O padrão é **15 dias**, inclusivo. O valor configurável deve ser inteiro entre 1 e 365. Não usar o padrão 7 dias nem o status `warning`.

## Testes obrigatórios

- Datas antes de hoje, hoje, amanhã, exatamente no limite configurado e um dia além do limite.
- Datas inválidas e formatos incorretos.
- Virada de mês e ano, fevereiro e ano bissexto.
- Data local em fusos negativos/positivos, sem deslocamento de um dia.
- Injeção de `today` para não depender do relógio real nos testes.
- Persistência de vários registros com mesmo EAN.
- Ausência de `status` no schema e ausência de `update()`/`put()` no repositório de produtos.
- Migração de schema preserva os registros já existentes.

## Critérios de aceite

- Nenhum módulo fora do módulo de datas instancia `Date`.
- Não existe `createdAt`, `batch`, `barcode`, `expiryDate` ou `warnDays` nos modelos canônicos.
- Não existe campo `status` persistido.
- Índices `expiresAt` e `ean` são não únicos.
- `nearExpiryDays` inicia em 15.
- Não existe atualização de produto: somente inclusão, leitura e exclusão.
