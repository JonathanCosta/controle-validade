# Projeto: Controle de Validade

## 1. Apresentação do projeto

O **Controle de Validade** é uma aplicação web progressiva (PWA) desenvolvida para facilitar o cadastro, a organização e o acompanhamento das datas de validade de produtos.

A proposta é oferecer uma ferramenta pessoal, simples e prática, que permita ao usuário registrar os produtos que possui e identificar rapidamente quais estão próximos do vencimento, quais vencem no dia atual e quais já estão vencidos.

O aplicativo será projetado principalmente para utilização em celulares, com uma interface intuitiva, poucos passos para realizar as operações e acesso rápido às informações mais importantes.

O cadastro de produtos poderá ser realizado de duas maneiras: digitando o nome manualmente ou utilizando a câmera do celular para escanear o código de barras. Quando possível, o sistema consultará uma fonte externa para identificar o produto e preencher automaticamente seu nome.

Todos os registros serão armazenados localmente no dispositivo do usuário, permitindo consultar e cadastrar produtos mesmo sem conexão com a internet. O aplicativo também oferecerá recursos de backup e recuperação para preservar os dados.

O projeto não tem como objetivo gerenciar estoques, compras ou movimentações de produtos. Sua finalidade é exclusivamente acompanhar datas de validade e facilitar a identificação dos produtos que merecem atenção.

## 2. Objetivo principal

O principal objetivo é permitir que o usuário saiba, de maneira rápida e organizada, quais produtos estão próximos do vencimento ou já passaram da data de validade.

O aplicativo deverá reduzir o esforço necessário para cadastrar e consultar essas informações, evitando processos complexos e funcionalidades que não contribuam diretamente para esse propósito.

A experiência deverá ser baseada em três ações fundamentais:

1. **Cadastrar:** adicionar um produto informando seu nome e sua data de validade.
2. **Consultar:** visualizar os produtos organizados conforme suas datas e situações.
3. **Compartilhar:** gerar um relatório formatado que possa ser copiado e enviado pelo WhatsApp.

Backup, recuperação e configurações complementam essas funcionalidades, garantindo maior segurança e flexibilidade no uso.

## 3. Conceito e limites da aplicação

O sistema será de uso pessoal, inicialmente utilizado por um único usuário em um único celular.

Não será necessário criar uma conta, realizar login ou manter um cadastro em um servidor externo.

Cada registro representará um produto individual, identificado principalmente pelo nome e pela sua data de validade.

Por exemplo, se o usuário tiver três embalagens do mesmo produto com datas de validade diferentes, poderá cadastrar cada uma separadamente:

- Leite integral — validade em 12/11/2026.
- Leite integral — validade em 15/11/2026.
- Leite integral — validade em 20/11/2026.

Esses registros serão independentes, mesmo que possuam o mesmo nome ou código de barras.

O aplicativo poderá agrupá-los visualmente por nome ou por data, mas esse agrupamento não representará uma quantidade ou um saldo de estoque.

### O que o sistema não pretende fazer

O Controle de Validade não será um sistema de gestão de estoque ou ERP.

Não haverá:

- Controle de quantidade disponível.
- Entrada ou saída de produtos.
- Movimentação de estoque.
- Registro de consumo ou descarte.
- Controle de compras e fornecedores.
- Gestão de preços.
- Cálculo de saldo ou inventário.
- Histórico de movimentações.
- Controle de múltiplos usuários ou dispositivos.
- Notificações push ou alertas externos.

A intenção é manter somente o necessário para controlar as datas de validade.

## 4. Cadastro de produtos

O cadastro deverá ser uma das operações mais rápidas da aplicação.

Na tela principal haverá um botão flutuante identificado pelo símbolo **+**, sempre acessível para adicionar um novo produto.

Ao tocar nesse botão, o usuário será direcionado diretamente à tela de cadastro.

Não haverá uma etapa intermediária para escolher o tipo de cadastro. A própria tela oferecerá as duas formas de identificação.

### 4.1. Cadastro digitando o nome

O usuário poderá informar manualmente o nome do produto.

Esse processo deverá funcionar independentemente de conexão com a internet e não exigirá um código de barras.

Depois de preencher o nome, basta informar a data de validade e salvar.

### 4.2. Cadastro escaneando o código de barras

A segunda possibilidade será utilizar a câmera do celular para escanear o código de barras EAN do produto.

Após identificar o código, o sistema fará uma consulta à fonte de informações configurada para tentar localizar sua descrição.

Quando a consulta retornar um resultado válido, o nome será preenchido automaticamente no formulário.

O usuário poderá conferir e alterar o nome antes de salvar.

Caso o código não seja encontrado, a consulta falhe ou a conexão esteja indisponível, o campo de nome continuará disponível para preenchimento manual.

O escaneamento será uma facilidade para acelerar o cadastro, nunca uma condição obrigatória para utilizar o aplicativo.

### 4.3. Dados do cadastro

Os dados principais de cada registro serão:

| Campo | Obrigatoriedade | Finalidade |
|---|---|---|
| Identificador | Automático | Identificar individualmente o registro |
| Nome do produto | Obrigatório | Identificação do produto |
| Data de validade | Obrigatório | Determinar a situação do produto |
| EAN | Opcional | Identificação por código de barras |
| Marca | Opcional | Informação complementar, quando disponível |

A data deverá ser exata, com dia, mês e ano.

Não serão aceitos cadastros com apenas mês e ano, pois o objetivo é identificar precisamente quando o produto vence.

### 4.4. Registros sem edição

Depois que um produto for cadastrado, seus dados não poderão ser editados.

O usuário poderá apenas adicionar novos registros ou excluir registros existentes.

Se informar uma data incorreta ou precisar corrigir o nome, deverá excluir o registro incorreto e fazer um novo cadastro.

Essa regra mantém o funcionamento simples e evita a necessidade de uma tela de edição.

## 5. Identificação de produtos pela Americanas

A primeira fonte de identificação de produtos será a API utilizada pelo leitor de preços da Americanas.

O endpoint identificado segue este padrão:

`https://sl-bff-report.americanas.io/web/price-scanner/store/{LOJA}/ean/{EAN}`

A loja utilizada inicialmente será `L267`.

Exemplo:

`https://sl-bff-report.americanas.io/web/price-scanner/store/L267/ean/7898524349322`

A resposta identificada contém informações como:

- `ean`: código de barras do produto.
- `description`: descrição do produto.
- `sapId`: identificador interno da Americanas.
- `price.regular`: preço normal.
- `price.promotional`: preço promocional.

O aplicativo utilizará principalmente o EAN e a descrição para preencher os dados do cadastro.

Os preços e demais informações comerciais serão ignorados, pois não fazem parte do objetivo da aplicação.

### 5.1. URL configurável

O endereço da API não deverá ficar fixo diretamente no código da aplicação.

Nas configurações haverá uma opção para informar ou alterar a URL de consulta, utilizando um marcador que será substituído pelo EAN lido.

Dessa forma, será possível trocar o endereço ou a loja utilizada sem precisar modificar o funcionamento do cadastro.

A URL inicial será preenchida com o endpoint da Americanas.

A integração deverá ser independente da tela de cadastro, permitindo adicionar outras fontes de identificação futuramente sem reconstruir o aplicativo.

A aplicação precisará validar a resposta recebida e tratar erros de conexão, códigos não encontrados e formatos inesperados.

A consulta dependerá de conexão com a internet e da disponibilidade da fonte externa. O cadastro manual continuará disponível em todos esses casos.

A utilização direta dessa API também deverá respeitar as restrições técnicas do navegador, especialmente CORS e eventuais exigências de cabeçalhos ou autenticação.

## 6. Controle e classificação das datas de validade

Uma das principais responsabilidades do sistema será classificar automaticamente os registros de acordo com a data de validade.

O período padrão para considerar um produto próximo do vencimento será de **15 dias**.

Esse período poderá ser alterado nas configurações.

As categorias serão:

| Situação | Critério |
|---|---|
| Vencido | Data de validade anterior à data atual |
| Vence hoje | Data de validade igual à data atual |
| Próximo do vencimento | Data entre amanhã e os próximos 15 dias, inclusive |
| Dentro da validade | Data superior a 15 dias a partir da data atual |

A classificação será calculada automaticamente sempre que os dados forem consultados.

Não será necessário atualizar manualmente a situação de um produto.

O sistema utilizará a data local do dispositivo como referência.

A data de validade será armazenada sem horário, evitando que diferenças de fuso horário alterem o dia apresentado ao usuário.

### 6.1. Permanência dos produtos vencidos

Produtos vencidos não serão removidos automaticamente.

Eles continuarão aparecendo nas consultas e relatórios até que o usuário decida excluí-los.

Não haverá arquivamento obrigatório nem exclusão por tempo de permanência.

## 7. Visão geral e organização dos produtos

A visão geral será a tela inicial do aplicativo.

Ela deverá apresentar as informações mais importantes sem exigir que o usuário entre em várias telas.

O destaque será para os produtos vencidos, os que vencem hoje e aqueles que estão próximos do vencimento.

### 7.1. Resumo das situações

A tela apresentará indicadores com a quantidade de registros em cada categoria:

- Vencidos.
- Vencem hoje.
- Próximos do vencimento.
- Dentro da validade, quando fizer sentido na consulta completa.

Esses números representarão a quantidade de registros cadastrados, nunca unidades em estoque.

### 7.2. Lista de produtos

A tela também apresentará uma listagem dos produtos, priorizando aqueles que precisam de atenção.

Os produtos poderão ser organizados de duas maneiras:

**Agrupar por data:** os registros serão separados pelas respectivas datas de validade, facilitando a identificação do que vence primeiro.

**Agrupar por nome do produto:** registros com o mesmo nome serão apresentados juntos, mas cada ocorrência continuará exibindo sua própria data de validade.

O usuário poderá alternar entre essas formas de visualização.

O agrupamento será exclusivamente visual e não modificará os registros armazenados.

### 7.3. Busca e filtros

A consulta dos produtos deverá permitir localizar registros pelo nome.

Também deverá oferecer filtros por situação, facilitando a visualização de produtos vencidos, próximos do vencimento ou ainda dentro da validade.

A intenção é permitir que o usuário encontre rapidamente o que procura, sem adicionar complexidade à navegação.

## 8. Relatórios e compartilhamento pelo WhatsApp

O aplicativo terá uma área específica para gerar relatórios das datas de validade.

O relatório deverá apresentar os produtos organizados por situação, incluindo:

- Produtos vencidos.
- Produtos que vencem hoje.
- Produtos próximos do vencimento.
- Produtos dentro da validade.

### 8.1. Filtro por data

O relatório completo deverá contar com filtro por intervalo de datas.

O filtro considerará a data de validade dos produtos.

Por exemplo, o usuário poderá selecionar um intervalo de 01/11/2026 até 30/11/2026 e consultar todos os registros cuja validade esteja dentro desse período.

O relatório deverá refletir o intervalo selecionado e as classificações dos registros em relação à data atual.

### 8.2. Copiar relatório

Depois de visualizar o resultado, o usuário poderá tocar em um botão para copiar o relatório.

O conteúdo será preparado em texto simples, utilizando a formatação reconhecida pelo WhatsApp:

- Títulos em negrito.
- Emojis para identificar cada situação.
- Separação dos produtos por categoria.
- Nome e data de validade.
- Totais por categoria.
- Total geral.
- Período consultado.

Exemplo:

📋 *RELATÓRIO DE VALIDADE*

📅 Período: 01/11/2026 a 30/11/2026

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

O exemplo é ilustrativo. O conteúdo real será gerado com base nos registros e no período selecionado.

O sistema apenas copiará o texto para a área de transferência. O usuário decidirá quando compartilhar e para quem enviar.

Não haverá envio automático de mensagens ou integração obrigatória com o WhatsApp.

## 9. Backup e recuperação dos dados

Como todos os registros ficarão armazenados localmente, o aplicativo terá funções de exportação e recuperação.

Esses recursos são importantes porque os dados poderão ser perdidos caso o usuário apague o armazenamento do navegador, remova os dados do site ou perca o dispositivo.

### 9.1. Exportar backup

O usuário poderá gerar um arquivo JSON contendo todos os registros cadastrados.

O arquivo deverá preservar:

- Identificadores dos registros.
- Nome dos produtos.
- Datas de validade.
- Códigos EAN.
- Marcas, quando existentes.
- Informações necessárias para a recuperação dos dados.

O backup deverá incluir todos os produtos, inclusive os vencidos.

### 9.2. Restaurar backup

O usuário poderá selecionar um arquivo JSON previamente exportado.

Antes da recuperação, o aplicativo verificará se o arquivo possui estrutura válida e se os registros podem ser importados.

Na própria operação de importação, o usuário escolherá entre duas possibilidades:

**Substituir os registros atuais:** remove os registros existentes e recupera os registros do arquivo selecionado.

**Mesclar os registros:** adiciona os registros do arquivo aos registros existentes, sem duplicar aqueles que já possuem o mesmo identificador.

A identificação de duplicidade deverá utilizar o ID individual do registro, e não o nome ou EAN.

Isso é essencial porque registros com o mesmo produto podem representar embalagens diferentes e possuir datas de validade distintas.

A operação de substituição deverá solicitar confirmação antes de apagar qualquer dado existente.

## 10. Configurações

A área de configurações reunirá as opções necessárias para ajustar o comportamento do aplicativo.

Inicialmente, deverá contemplar:

- Período considerado próximo do vencimento, com padrão de 15 dias.
- URL da fonte de identificação de produtos.
- Exportação de backup.
- Recuperação de backup.

As configurações serão armazenadas localmente, sempre que aplicável.

Não haverá uma estrutura extensa de preferências ou personalização, pois a intenção é manter o aplicativo simples.

## 11. Funcionamento offline e armazenamento local

O Controle de Validade será desenvolvido seguindo o conceito local-first.

Isso significa que as funcionalidades principais não dependerão de um servidor ou banco de dados remoto.

Os produtos ficarão armazenados no próprio navegador do dispositivo por meio do IndexedDB.

Com os arquivos da aplicação previamente carregados, o usuário poderá:

- Abrir o aplicativo.
- Consultar produtos cadastrados.
- Consultar as datas e situações.
- Realizar buscas e filtros.
- Cadastrar produtos manualmente.
- Excluir registros.
- Gerar relatórios.
- Copiar relatórios.
- Exportar e importar backups.

A consulta à Americanas ou a outra fonte externa de identificação dependerá de conexão com a internet.

O aplicativo deverá continuar funcionando quando estiver offline, respeitando essa limitação.

O usuário deverá ser informado de que os dados estão armazenados localmente e que o backup é sua principal forma de proteção contra perda de dados.

## 12. Plataforma e tecnologia

A aplicação será uma PWA, permitindo instalação na tela inicial do celular e utilização semelhante à de um aplicativo convencional.

A hospedagem inicial será feita no GitHub Pages, sem necessidade de manter um servidor próprio.

A arquitetura será estática e utilizará recursos nativos do navegador sempre que possível.

### Direção tecnológica

- **Vite:** desenvolvimento e compilação da aplicação.
- **TypeScript:** implementação das regras e funcionalidades.
- **HTML e CSS:** construção da interface, sem necessidade de framework de componentes.
- **IndexedDB:** armazenamento persistente dos registros locais.
- **idb:** pequena camada de conveniência para trabalhar com IndexedDB.
- **ZXing Browser:** leitura de códigos de barras pela câmera, carregada somente quando necessária.
- **Service Worker:** cache e funcionamento offline.
- **Web App Manifest:** instalação como PWA.
- **GitHub Pages:** hospedagem da aplicação.
- **GitHub Actions:** publicação automatizada.

A escolha técnica priorizará dependências pequenas e especializadas, evitando frameworks e bibliotecas completas quando os recursos nativos do navegador forem suficientes.

Não existe necessidade inicial de React, Redux, banco remoto, API própria, autenticação ou backend.

## 13. Interface e experiência do usuário

O aplicativo será desenvolvido com prioridade para dispositivos móveis.

A interface deverá ser clara, objetiva e funcional, sem excesso de elementos visuais ou etapas desnecessárias.

A navegação deverá destacar as operações mais utilizadas:

- Consultar vencimentos.
- Adicionar produtos.
- Consultar registros.
- Gerar relatórios.
- Acessar configurações.

O botão de adicionar produto deverá permanecer facilmente acessível na tela principal.

As situações dos produtos deverão ser visualmente distintas, utilizando cores e identificações textuais para não depender exclusivamente da percepção das cores.

O formulário de cadastro deverá ser direto, sem campos desnecessários ou etapas adicionais.

A aplicação também deverá considerar acessibilidade, boa legibilidade, adaptação a diferentes tamanhos de tela e desempenho adequado em celulares.

## 14. Regras fundamentais do projeto

As seguintes regras deverão orientar todas as decisões de desenvolvimento:

1. O objetivo é acompanhar datas de validade, não gerenciar estoque.
2. Cada registro representa uma ocorrência individual de produto.
3. Nome e validade são os únicos campos obrigatórios.
4. O usuário pode cadastrar digitando o nome ou escaneando o código EAN.
5. O cadastro manual deve funcionar sem internet.
6. O registro salvo não poderá ser editado, somente excluído.
7. O status de validade será calculado automaticamente.
8. O período padrão de proximidade será de 15 dias.
9. Produtos vencidos permanecerão cadastrados até exclusão manual.
10. A visualização poderá agrupar registros por nome ou data.
11. O relatório será completo e terá filtro por intervalo de datas.
12. O relatório poderá ser copiado e compartilhado manualmente.
13. Backup e recuperação farão parte da primeira versão.
14. O usuário escolherá entre substituir ou mesclar durante a recuperação.
15. Os dados principais serão armazenados localmente.
16. Nenhuma funcionalidade principal dependerá de servidor externo.
17. A integração de identificação de produtos será opcional e configurável.
18. A interface deverá privilegiar simplicidade e rapidez.

## 15. Resultado esperado

O resultado será um aplicativo pessoal para acompanhamento de validades, instalável no celular, que permita manter uma lista organizada dos produtos e identificar facilmente aqueles que precisam de atenção.

O usuário poderá adicionar um produto rapidamente, digitando seu nome ou utilizando a câmera para ler o código de barras. Depois de informar a validade, o registro ficará disponível para consultas e classificações automáticas.

A aplicação organizará as informações por data ou nome, oferecerá uma visão geral das situações, permitirá gerar relatórios completos com filtros e compartilhar os resultados pelo WhatsApp.

Todos os dados ficarão armazenados localmente e poderão ser protegidos por backups exportáveis e recuperáveis.

O sistema deverá ser leve, independente e simples de utilizar, sem exigir infraestrutura complexa ou serviços externos permanentes.

**O princípio central é oferecer uma maneira prática de saber o que está vencido, o que está perto de vencer e quando cada produto vence, com o mínimo de esforço para cadastrar e consultar essas informações.**
