# Projeto Wedding

Sistema de controle de convidados e check-in para casamentos: login, dashboard, cadastro de convidados e check-in.

## Estrutura

```
client/                  Front-end (HTML + Tailwind + JS puro)
  api.js                 URL da API, token, authFetch e escapeHtml (compartilhado)
server/
  app.js                 Express: middlewares globais + montagem das rotas
  config/                env.js (variáveis) e database.js (knex/MySQL)
  routes/                Define URL + middlewares de cada endpoint
  controllers/           Recebe a requisição e devolve a resposta
  models/                Único lugar com acesso ao banco
  middlewares/           auth (JWT), validate, rateLimiter, errorHandler
  validators/            Schemas de validação (zod)
  scripts/               hash-passwords.js
  tests/                 Testes de integração (node:test + supertest)
  database.sql           Schema    |   inserts.sql   Dados de exemplo
```

Fluxo de uma requisição: `rota → middlewares (rate limit, JWT, validação) → controller → model → banco`.

## Como rodar

```bash
npm install
cp .env.example .env     # preencha DB_PASSWORD e JWT_SECRET
npm start                # ou: npm run dev (reinicia ao salvar)
npm test
```

Gere o `JWT_SECRET` com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Se o front rodar em outra porta (ex.: Live Server), inclua a origem em `CORS_ORIGINS` no `.env`.

## Banco de dados

Banco novo: execute `server/database.sql` e depois `server/inserts.sql`
(login de demonstração: `admin@email.com` / `admin123`; troque em produção).

Banco já existente:

```sql
ALTER TABLE convidados
  ADD INDEX idx_convidados_status (status),
  ADD INDEX idx_convidados_status_atualizado (status, atualizado_em);
```

```bash
npm run hash-passwords   # converte senhas antigas em texto puro para bcrypt
```

Mesmo sem rodar o script, contas antigas são convertidas automaticamente no primeiro login.

## Segurança aplicada

| Camada | O que faz |
| --- | --- |
| JWT | Login devolve token (HS256, 8h); todas as rotas, exceto `/api/login`, exigem `Authorization: Bearer` |
| bcrypt | Senhas com hash; resposta idêntica para email inexistente e senha errada |
| Rate limit | 10 logins falhos por 15 min e 300 req por 15 min por IP |
| Helmet | Cabeçalhos de segurança (CSP, nosniff, HSTS...) |
| CORS | Somente origens listadas em `CORS_ORIGINS` |
| Validação | zod em body, params e query; campos extras são descartados |
| Erros | Handler central: nunca devolve mensagem interna do banco |
| Body | Limite de 10 KB |
| Front | `escapeHtml` em tudo que vai para `innerHTML` |

## API

| Método | Rota | Auth |
| --- | --- | --- |
| POST | `/api/login` | não |
| GET | `/api/guests` (opcional `?page=&limit=`, total em `X-Total-Count`) | sim |
| POST | `/api/guests` | sim |
| DELETE | `/api/guests/:id` | sim |
| PATCH | `/api/guests/:id/checkin` | sim |
| GET | `/api/checkin` | sim |
| GET | `/api/dashboard` | sim |
| GET | `/api/grafico-confirmacoes` | sim |
| GET | `/health` | não |
