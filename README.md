# User System

Este é um sistema Fullstack desenvolvido com **Next.js** no frontend e **NestJS** no backend. Ele implementa um CRUD de usuários com persistência de dados em PostgreSQL e caching eficiente com Redis.

## Funcionalidades

### Backend (NestJS)
- **CRUD de Usuários**:
  - `POST /users` → Criar usuário
  - `GET /users` → Listar todos os usuários
  - `GET /users/:id` → Buscar um usuário específico
  - `PUT /users/:id` → Atualizar um usuário
  - `DELETE /users/:id` → Remover um usuário
- Banco de dados relacional com **PostgreSQL** utilizando **TypeORM**.
- Cache com **Redis** para otimizar operações.
- Testes automatizados com **Jest**.

### Frontend (Next.js)
- Tela para listagem de usuários, consumindo a API do backend.
- Tela para cadastro e edição de usuários.
- Integração com a API utilizando **React Query** para otimizar chamadas e caching no cliente.

---

## Como executar o projeto

### Pré-requisitos
- Docker e Docker Compose instalados.
- Node.js e npm instalados (opcional para desenvolvimento local).

### Subindo o ambiente com Docker Compose
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/user-system.git
   cd user-system
    ```
2. Suba os serviços com Docker Compose:
    ```bash
    docker-compose up --build
    ```
3. Acesse os serviços:

Frontend: http://localhost:3000
Backend: http://localhost:3001

Variáveis de ambiente
Certifique-se de configurar as variáveis de ambiente no arquivo .env do backend. Exemplo:

```bash
    DB_HOST=postgres
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=postgres
    DB_DATABASE=userdb
    REDIS_HOST=redis
    REDIS_PORT=6379
    NODE_ENV=development
```

Scripts disponíveis
Backend

Iniciar o servidor:
```bash
    npm run start:dev
```

Executar testes:
```bash
    npm run test
```


