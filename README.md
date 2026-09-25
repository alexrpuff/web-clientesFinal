# web-clientesFinal

Frontend **Angular 22** + **Bootstrap 5** integrado à API `clientesApi` (projeto `clientesFinal`) — Projeto Final da formação Java WebDeveloper.

## Recursos

- Navegação de páginas com rotas (`src/app/app.routes.ts`)
- Layout com Bootstrap
- Formulários reativos com as mesmas validações da API (`shared/cliente-form`)
- Integração com a API via `HttpClient` (`services/cliente-service.ts`)
- Páginas de cadastro, consulta, edição e exclusão de clientes

| Rota | Página |
|---|---|
| `/inicio` | Dashboard: total de clientes e localidades (por estado e por cidade) |
| `/cadastrar-cliente` | Cadastro de cliente e endereço |
| `/consultar-clientes` | Lista em ordem alfabética com filtro |
| `/editar-cliente/:id` | Edição do cliente e de um endereço (ou inclusão de novo endereço) |
| `/excluir-cliente/:id` | Confirmação e exclusão |

## Executando

A API deve estar em execução em `http://localhost:8083`.

```bash
npm install
npm start      # http://localhost:4200
```

Testes unitários: `npm test`
