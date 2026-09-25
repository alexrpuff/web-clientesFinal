# web-clientesFinal — WebAlex

Frontend **Angular 22** + **Bootstrap 5** integrado à API `clientesApi` (projeto `clientesFinal`) — Projeto Final da formação Java WebDeveloper.

O **WebAlex** é um sistema de controle de clientes: permite cadastrar clientes com os seus endereços, consultar, editar e excluir os registros, e acompanhar em um dashboard quantos clientes existem e onde eles estão localizados.

## Recursos

- Navegação de páginas com rotas (`src/app/app.routes.ts`)
- Layout com Bootstrap e identidade visual própria (`src/styles.css`)
- Formulários reativos com as mesmas validações da API (`shared/cliente-form`)
- Integração com a API via `HttpClient` (`services/cliente-service.ts`)
- Dashboard com indicadores e páginas de cadastro, consulta, edição e exclusão de clientes

| Rota | Página |
|---|---|
| `/inicio` | Dashboard: total de clientes e localidades (por estado e por cidade) |
| `/cadastrar-cliente` | Cadastro de cliente e endereço |
| `/consultar-clientes` | Lista em ordem alfabética com filtro |
| `/editar-cliente/:id` | Edição do cliente e de um endereço (ou inclusão de novo endereço) |
| `/excluir-cliente/:id` | Confirmação e exclusão |

Qualquer rota desconhecida (ou a raiz `/`) redireciona para `/inicio`.

## Telas

### Dashboard (`/inicio`)

Página inicial do sistema, com uma visão geral da base de clientes:

- **Indicadores:** clientes cadastrados (em destaque), estados atendidos e cidades atendidas.
- **Clientes por estado:** gráfico de barras ordenado da maior para a menor quantidade. Ao passar o mouse (ou focar com o teclado) em uma barra, é exibida a quantidade, o percentual sobre o total de clientes e as cidades daquele estado.
- **Clientes por cidade:** tabela com cidade, UF, quantidade de clientes e percentual.
- **Atalhos:** botões **Novo cliente** e **Consultar clientes**.

Um cliente é contado uma única vez em cada localidade, mesmo que tenha mais de um endereço nela. Um cliente com endereços em localidades diferentes é contado em cada uma delas, por isso a soma dos percentuais pode passar de 100%.

### Cadastrar cliente (`/cadastrar-cliente`)

Formulário com os **dados do cliente** (nome, email, CPF e data de nascimento) e o seu **primeiro endereço** (CEP, logradouro, número, complemento, bairro, cidade e UF).

- Os campos são validados na tela antes do envio; os campos inválidos ficam destacados com a mensagem do erro.
- Após o cadastro, a tela exibe uma mensagem de sucesso, informa que um **email de confirmação** foi enviado ao cliente e limpa o formulário para um novo cadastro.
- Se a API recusar o cadastro (por exemplo, CPF já cadastrado), a mensagem de erro retornada é exibida.

### Consultar clientes (`/consultar-clientes`)

Lista todos os clientes em **ordem alfabética** com nome, email, CPF (`000.000.000-00`), data de nascimento (`dd/mm/aaaa`) e todos os endereços (CEP no formato `00000-000`).

- **Filtro** instantâneo por nome, email ou CPF (o CPF pode ser digitado com ou sem pontuação).
- Contador de clientes exibidos em relação ao total (ex.: `3 de 10 cliente(s)`).
- Cada linha tem os botões **Editar** e **Excluir**; o botão **Novo cliente** leva ao cadastro.

### Editar cliente (`/editar-cliente/:id`)

Carrega os dados do cliente e permite alterá-los junto com **um endereço por vez**:

- O campo **Endereço a ser editado** lista os endereços do cliente; ao escolher um, os campos de endereço são preenchidos com os seus dados.
- A opção **+ Adicionar novo endereço** limpa os campos de endereço; ao salvar, o novo endereço é incluído no cliente e passa a ser o endereço selecionado.
- As validações são as mesmas do cadastro.

### Excluir cliente (`/excluir-cliente/:id`)

Exibe os dados do cliente e todos os seus endereços para conferência antes da exclusão. A exclusão só acontece ao clicar em **Confirmar exclusão**, com o aviso de que a operação **não pode ser desfeita** e de que **todos os endereços do cliente também serão excluídos**.

## Regras de negócio

### Cliente

| Campo | Regra |
|---|---|
| Nome | Obrigatório, de 8 a 100 caracteres |
| Email | Obrigatório, em formato de email válido |
| CPF | Obrigatório, exatamente 11 dígitos numéricos (sem pontuação). **Único**: não pode existir outro cliente com o mesmo CPF, nem no cadastro nem na edição |
| Data de nascimento | Obrigatória |

### Endereço

| Campo | Regra |
|---|---|
| CEP | Obrigatório, exatamente 8 dígitos numéricos (sem hífen) |
| Logradouro | Obrigatório |
| Número | Obrigatório |
| Complemento | Opcional |
| Bairro | Obrigatório |
| Cidade | Obrigatória |
| UF | Obrigatória, escolhida na lista das 27 unidades federativas |

### Relacionamento e ciclo de vida

- Todo cliente é cadastrado com **um endereço**; outros endereços podem ser adicionados depois, na edição. Um cliente pode ter **vários endereços**.
- A edição altera os dados do cliente e **um endereço por vez** (o selecionado) ou adiciona um novo.
- A exclusão de um cliente **remove também todos os seus endereços**.
- No cadastro, a API grava na fila do **RabbitMQ** uma mensagem de boas-vindas, que é enviada por email ao cliente. Se a mensageria estiver indisponível, o cadastro é concluído mesmo assim.

### Tratamento de erros

As mensagens exibidas nas telas vêm da API, conforme o status da resposta:

| Situação | Retorno da API | Exibição na tela |
|---|---|---|
| Dados inválidos | `400` com os erros de cada campo | Mensagens de todos os campos inválidos |
| Cliente ou endereço não encontrado | `404` com a mensagem | Mensagem de erro |
| CPF já cadastrado | `409` com a mensagem | Mensagem de erro |
| Erro interno | `500` com a mensagem | Mensagem de erro |
| API fora do ar | sem resposta | "Não foi possível conectar à API. Verifique se o backend está em execução." |

## Identidade visual

As cores seguem o logotipo (`public/logo-alex.png`): **preto** `#000000`, **vermelho** `#F80A14` e **branco**.

- Barra de navegação preta com o logotipo; o link da página atual fica em vermelho.
- Botões com fundo preto e letras vermelhas, que ficam brancas ao passar o mouse.
- Títulos de seção, links, foco dos campos e gráficos em vermelho; cabeçalho das tabelas em preto.

As cores são definidas como variáveis CSS (`--alex-preto`, `--alex-vermelho`, `--alex-branco`) em `src/styles.css`, que sobrescreve as variáveis do Bootstrap.

## Estrutura

```
src/app
├── models/cliente.ts           # Interfaces (DTOs da API) e lista de UFs
├── services/cliente-service.ts # Chamadas HTTP e tratamento das mensagens de erro
├── shared
│   ├── navbar/                 # Barra de navegação
│   ├── cliente-form/           # Campos e validações do cliente/endereço (cadastro e edição)
│   └── pipes/                  # Formatação de CPF e CEP
└── pages/clientes
    ├── inicio/                 # Dashboard
    ├── cadastrar-cliente/
    ├── consultar-clientes/
    ├── editar-cliente/
    └── excluir-cliente/
```

## Integração com a API

Endereço base: `http://localhost:8083/api/clientes`

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/clientes` | Lista os clientes com endereços, em ordem alfabética (dashboard e consulta) |
| `GET` | `/api/clientes/{id}` | Obtém um cliente (edição e exclusão) |
| `POST` | `/api/clientes` | Cadastra um cliente com o seu endereço |
| `PUT` | `/api/clientes` | Edita o cliente e um endereço (sem `id` no endereço, adiciona um novo) |
| `DELETE` | `/api/clientes/{id}` | Exclui o cliente e os seus endereços |

## Executando

A API deve estar em execução em `http://localhost:8083`.

```bash
npm install
npm start      # http://localhost:4200
```

Testes unitários: `npm test`
