# Controle de Validade

PWA local-first para cadastrar produtos e acompanhar datas de validade. Funciona sem backend: os dados ficam no IndexedDB do navegador e o núcleo do app opera offline após o primeiro carregamento.

## Requisitos

- Node.js 22 (LTS) e npm
- Navegador moderno com suporte a IndexedDB; câmera e leitura de código dependem do dispositivo/navegador

## Desenvolvimento

```bash
npm ci
npm run dev
```

A aplicação usa navegação por hash (`#/inicio`, `#/produtos`, `#/novo`, `#/relatorios`, `#/configuracoes`).

## Scripts

- `npm run dev` — servidor de desenvolvimento (Vite)
- `npm run build` — verificação de tipos e build de produção em `dist/`
- `npm run preview` — servir o build localmente
- `npm run test` — testes (Vitest)
- `npm run typecheck` — checagem TypeScript

## Build e caminho base (GitHub Pages)

O caminho de publicação é configurável por `VITE_BASE_PATH`:

```bash
# Raiz do domínio
VITE_BASE_PATH=/ npm run build

# Repositório de projeto (subcaminho)
VITE_BASE_PATH=/controle-validade/ npm run build
```

O workflow em `.github/workflows/deploy.yml` publica `dist/` no GitHub Pages e define o base path automaticamente (raiz para `<owner>.github.io`, subcaminho para demais repositórios).

## Limitações conhecidas

- **Consulta externa de descrição (Americanas):** envia apenas o EAN para a URL configurada e depende de internet e de CORS permitido pela fonte. Falhas não bloqueiam o cadastro manual.
- **Scanner:** requer contexto seguro (HTTPS/localhost) e permissão de câmera. Usa `BarcodeDetector` quando o navegador suporta EAN-8/EAN-13; caso contrário, carrega ZXing sob demanda.
- **Armazenamento:** os dados são locais ao dispositivo/navegador. Faça backups regularmente em Configurações; a persistência solicitada ao navegador não garante retenção absoluta.
- **Instalação/atualização:** atualização do app não apaga o IndexedDB; novas versões aguardam confirmação do usuário quando `registerType: prompt` detecta atualização.

## Documentação

- `ESPECIFICACAO_COMPLETA.md` — fonte de verdade funcional e técnica
- `DESIGN_SYSTEM.md` — especificação visual
- `AGENTS.md` — regras permanentes de desenvolvimento
