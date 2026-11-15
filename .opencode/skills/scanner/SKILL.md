---
name: scanner
description: Use ao implementar ou alterar leitura de EAN, câmera, BarcodeDetector, ZXing, permissões de câmera ou fluxo de identificação de produto.
---

# Scanner de código de barras

## Objetivo e escopo

- O scanner existe para identificar produtos no cadastro; não é um módulo de estoque ou de consulta comercial.
- Formatos iniciais aceitos: EAN-13 e EAN-8. Não adicionar QR Code, Code 128, UPC-A ou UPC-E sem requisito explícito.
- O scanner é opcional. Digitação manual do nome deve continuar sempre acessível e funcional sem câmera e sem internet.
- A leitura apenas preenche o formulário. Nunca salva um produto automaticamente.

## Estratégia de implementação

1. Verificar suporte real à API nativa `BarcodeDetector` e aos formatos EAN-13 e EAN-8.
2. Usar `BarcodeDetector` somente quando `BarcodeDetector.getSupportedFormats()` existir e confirmar ambos os formatos necessários. Verificar também que a criação do detector funciona.
3. Se a API não existir, não listar os formatos necessários ou falhar na inicialização/detecção, usar `@zxing/browser` por `import()` dinâmico.
4. Se a inicialização da câmera ou ambos os leitores falharem, oferecer o formulário manual sem bloquear o cadastro.

Não verificar apenas `'BarcodeDetector' in window`: a API tem disponibilidade limitada e pode estar desabilitada ou suportar apenas parte dos formatos. Consultar os formatos em runtime.

O uso da API nativa é uma otimização progressiva. ZXing continua sendo a alternativa de compatibilidade para navegadores sem suporte adequado.

## Formatos

- Native BarcodeDetector: `ean_13` e `ean_8`.
- ZXing: `BarcodeFormat.EAN_13` e `BarcodeFormat.EAN_8`, usando `DecodeHintType.POSSIBLE_FORMATS`.
- Rejeitar qualquer outro formato retornado.
- Preservar o código como string, incluindo zeros à esquerda.

## Validação EAN

Antes de aceitar o resultado:

- EAN-13 deve conter exatamente 13 dígitos.
- EAN-8 deve conter exatamente 8 dígitos.
- Validar o dígito verificador conforme o algoritmo GS1 (soma ponderada alternada dos dígitos de dados, módulo 10).
- Rejeitar caracteres não numéricos, comprimento incorreto e checksum inválido.
- Não converter o código para `number`.

Criar função pura e testes unitários para EAN-8 e EAN-13 válidos e inválidos.

## Câmera e vídeo

- A câmera só pode ser solicitada após ação explícita do usuário no botão de escanear.
- Requer contexto seguro: HTTPS ou localhost.
- Solicitar `getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })`.
- Usar elemento `<video playsinline muted>`; definir `autoplay` conforme necessário e chamar `play()` após associar o stream.
- Exibir o vídeo de forma responsiva, sem distorcer a proporção.
- Não manter câmera ativa quando o scanner não estiver visível.

## Encerramento obrigatório da câmera

Encerrar todas as tracks (`stream.getTracks().forEach(track => track.stop())`) e limpar `video.srcObject`:

- após a primeira leitura aceita;
- ao fechar o modal/tela;
- ao cancelar;
- ao trocar de rota;
- quando `document.visibilityState` mudar para `hidden`;
- quando o componente/serviço for desmontado;
- em qualquer erro depois que o stream tiver sido aberto.

Remover listeners e limpar timers/loops de detecção no encerramento. Evitar duas sessões de scanner simultâneas.

## Tratamento de erros

Tratar e apresentar mensagens claras:

- `NotAllowedError`: permissão negada; explicar como liberar acesso à câmera e oferecer digitação manual.
- `NotFoundError`: nenhuma câmera disponível; oferecer digitação manual.
- `NotReadableError`: câmera em uso ou indisponível; oferecer tentar novamente ou digitar.
- `OverconstrainedError`: restrição de câmera não atendida; tentar uma configuração menos restritiva uma única vez.
- `SecurityError` ou contexto inseguro: explicar que a câmera exige HTTPS ou localhost.
- Erros de BarcodeDetector/ZXing: encerrar recursos e permitir cadastro manual.

Nunca esconder o campo de nome nem tornar o cadastro dependente da permissão de câmera.

## Leitura repetida e feedback

- Aceitar no máximo uma leitura por sessão; após leitura válida, parar imediatamente o scanner.
- Proteger também contra callbacks repetidos: ignorar o mesmo código por pelo menos 1,5 segundo.
- `navigator.vibrate?.(100)` pode ser usado como melhoria opcional; nunca depender de vibração, pois não está disponível em todos os navegadores.
- Sempre oferecer feedback visual de leitura bem-sucedida.

## Integração com cadastro

Após leitura válida:

1. Encerrar o scanner e a câmera.
2. Guardar o EAN no estado do formulário.
3. Procurar registros locais com `getByEan(ean)`; se houver registro, sugerir o nome já cadastrado.
4. Consultar o provider externo configurado quando houver conexão e quando a configuração for válida.
5. Se a consulta retornar descrição válida, preencher o nome somente se o campo estiver vazio ou se o usuário confirmar a substituição. Nunca sobrescrever silenciosamente um nome digitado.
6. Se a consulta falhar, manter EAN e nome manual editável.
7. Voltar ao formulário. Não gravar no IndexedDB até o usuário tocar em Salvar.

## Critérios de aceite

- EAN-8 e EAN-13 são reconhecidos e validados.
- ZXing só é carregado sob demanda quando necessário.
- A câmera é liberada em todos os caminhos de saída.
- Scanner não abre automaticamente ao entrar no cadastro.
- Sem câmera/permissão/rede, cadastro manual continua funcional.
- Uma leitura não cria registro automaticamente.
