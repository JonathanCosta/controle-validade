# OpenCode v2 — configuração do Controle de Validade

Este pacote contém uma configuração de projeto para OpenCode v2, com foco em modelos gratuitos do OpenCode Zen/Console e baixo consumo de contexto.

## Arquivos

- `opencode.json`: configuração v2, modelo padrão, permissões, agentes e comandos slash.
- `AGENTS.md`: regras permanentes e limites inegociáveis do projeto.
- `ESPECIFICACAO_COMPLETA.md`: especificação funcional e técnica que o agente deve seguir.
- `DESIGN_SYSTEM.md`: especificação normativa de layout, cores, tipografia, componentes, estados, animações, acessibilidade e UX.
- `.opencode/skills/`: cinco skills especializadas carregadas sob demanda.

## Instalação no repositório

Copie os arquivos para a raiz do repositório do Controle de Validade. Preserve arquivos que já existam. Se `opencode.json` ou `AGENTS.md` já existirem, faça merge manual em vez de sobrescrever.

O arquivo `ESPECIFICACAO_COMPLETA.md` deve ficar na raiz, pois é carregado em `instructions` e referenciado pelos agentes.

## Conectar o OpenCode Zen/Console

1. Atualize o OpenCode para a versão 2.x usada no seu ambiente e confirme com `opencode --version`.
2. Abra o OpenCode dentro da raiz do repositório.
3. Execute `/connect` e selecione o provedor OpenCode Zen/OpenCode Console disponível na sua versão. Conclua a autenticação da sua conta.
4. Execute `/models` e confirme que o modelo `opencode/glm-5.3-flash-free` está disponível.
5. Selecione um modelo gratuito. O `opencode.json` define GLM-5.3 Flash Free como padrão; se a sua conta não o listar, escolha outro modelo gratuito e atualize o campo `model`.

Não coloque a API key em `opencode.json`, `AGENTS.md` ou qualquer arquivo versionado. A autenticação é local ao OpenCode.

## Modelos gratuitos identificados na documentação oficial

A lista abaixo foi consultada em 12/11/2026 e pode mudar, pois os modelos são oferecidos por tempo limitado e sujeitos a cotas:

| Nome | ID usado no OpenCode |
|---|---|
| GLM-5.3-Flash Free | `opencode/glm-5.3-flash-free` |
| DeepSeek V4.1 Flash Free | `opencode/deepseek-v4.1-flash-free` |
| MiniMax M3.1 Flash Free | `opencode/minimax-m3.1-flash-free` |
| MiMo-V2.6-Flash Free | `opencode/mimo-v2.6-flash-free` |
| Nemotron 3 Ultra Free | `opencode/nemotron-3-ultra-free` |
| Nemotron 3.5 Lightning Free | `opencode/nemotron-3.5-lightning-free` |
| Nemotron 3.5 Super VL Free | `opencode/nemotron-3.5-super-vl-free` |
| Iceman Free | `opencode/iceman-free` |
| Inkling 2 Small Free | `opencode/inkling-2-small-free` |
| Beam Free | `opencode/beam-free` |
| Flint 40B Free | `opencode/flint-40b-free` |
| LongCat 2.5 Free | `opencode/longcat-2.5-free` |
| Big Pickle | `opencode/big-pickle` |

Observações:

- A disponibilidade e a cota podem mudar sem alteração do repositório.
- LongCat 2.5 Free tem limite publicado de 100 requisições por dia.
- A documentação informa retenção de dados para Inkling 2 Small Free; evite usá-lo para conteúdo sensível.
- Big Pickle já apresentou `FreeUsageLimitError` no seu uso anterior; por isso não é o modelo padrão desta configuração.
- Se `OPENCODE_DISABLE_FREE_MODELS=1` estiver definido no ambiente, os modelos gratuitos podem ficar ocultos.
- Use `/models` como fonte final de disponibilidade da sua conta.

## Skills especializadas

As skills ficam em `.opencode/skills/<id>/SKILL.md`. O OpenCode as descobre automaticamente e as carrega sob demanda, conforme a tarefa. Não é necessário carregar todas em cada sessão.

| Skill | Quando utilizar |
|---|---|
| `db-architecture` | IndexedDB, `idb`, schema, modelos, datas e validade |
| `scanner` | Leitura EAN, câmera, BarcodeDetector e ZXing |
| `pwa-offline` | Manifest, Service Worker, cache, atualizações e GitHub Pages |
| `ui-immutability` | Interface Vanilla TypeScript, formulários, renderização segura e regras de não edição |
| `design-system` | Layout, cores, tipografia, componentes, animações, acessibilidade e usabilidade |

Antes de criar ou alterar qualquer tela, CSS, componente ou interação, o agente deve ler `DESIGN_SYSTEM.md` integralmente. O `opencode.json` concede permissão para carregar skills. As skills complementam a especificação; não podem redefinir requisitos como o padrão de 15 dias, os campos `expiresAt`/`ean`, a ausência de edição ou o funcionamento local.

## Comandos disponíveis

| Comando | Finalidade |
|---|---|
| `/bootstrap` | Lê a especificação e inspeciona o estado do repositório, sem editar |
| `/plan <tarefa>` | Produz plano incremental sem alterar arquivos |
| `/implement <tarefa>` | Implementa uma tarefa específica e executa verificações |
| `/review` | Revisa o diff sem modificar arquivos |
| `/validate` | Executa typecheck, testes e build existentes |
| `/security` | Faz revisão de segurança e privacidade sem modificar arquivos |

## Fluxo recomendado

Para uma tarefa nova:

1. `/bootstrap` na primeira utilização do repositório.
2. `/plan descrição da tarefa` para tarefas que envolvam mais de um arquivo ou regra de negócio.
3. `/implement descrição da tarefa` para implementar.
4. `/review` para procurar bugs e regressões.
5. `/validate` para executar as verificações.
6. `/security` quando a alteração envolver importação de arquivos, API externa, câmera, armazenamento ou renderização de dados.

Para mudanças pequenas e isoladas, pode executar `/implement` diretamente e depois `/validate`, evitando criar subagentes desnecessários e economizando a cota gratuita.

## Permissões e segurança

- Leitura, busca e edição dentro do repositório são permitidas.
- Arquivos `.env`, chaves privadas e diretórios de segredos são bloqueados para leitura/edição.
- Comandos shell pedem aprovação por padrão.
- Inspeção básica do Git e scripts de typecheck/test/build estão liberados.
- `git push`, `git reset`, `git clean`, `rm` e `sudo` são bloqueados.
- `git commit`, instalação de dependências, execução de servidores e outros comandos não liberados continuam sujeitos à aprovação.
- Os agentes `planner`, `reviewer`, `qa` e `security-reviewer` são subagentes. Os agentes de revisão/QA não podem editar arquivos. O planner não executa shell, exceto inspeções Git somente leitura.
- O modelo gratuito está definido como padrão e os agentes herdam o modelo da sessão. A configuração não consegue restringir apenas modelos gratuitos dentro do próprio provedor `opencode`; portanto, não selecione manualmente modelos pagos em `/models`. A restrição por provedor seria possível, mas não distinguiria os modelos pagos e gratuitos do mesmo provedor.

## Validações esperadas do projeto

A especificação funcional define scripts mínimos no `package.json`:

```bash
npm run typecheck
npm run test
npm run build
```

A configuração de permissões libera esses scripts para o agente QA. Se os nomes dos scripts forem alterados, atualize `opencode.json` e `AGENTS.md` em conjunto.

## Referências oficiais

- Configuração: https://opencode.ai/docs/config
- Agentes: https://opencode.ai/docs/agents
- Comandos: https://opencode.ai/docs/commands
- Permissões v2: https://opencode.ai/docs/permissions
- Modelos gratuitos: https://dev.opencode.ai/docs/console/models/
