# 🖥️ Queue Flow - Backend API

Esta é a API REST & Gateway de WebSockets do **Queue Flow**, construída com **NestJS**, **Prisma ORM**, **PostgreSQL** e **Redis**.

Este diretório contém todo o ecossistema de microsserviços, controle de filas, autenticação e comunicação bidirecional em tempo real do sistema.

---

## ⚙️ Configuração Local

### 1. Requisitos e Variáveis
Certifique-se de configurar o arquivo `.env` na raiz desta pasta com as seguintes variáveis obrigatórias:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:polegadas5000@localhost:5432/queueDB?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
```

### 2. Inicializando os Serviços (Docker)
Antes de ligar o servidor, certifique-se de que os containers do **PostgreSQL** e do **Redis** estão ativos e saudáveis:

```bash
docker-compose up -d postgres redis
```

### 3. Rodando o Servidor de Desenvolvimento
Com as dependências instaladas e o banco configurado:

```bash
# Instalar dependências
npm install

# Rodar migrações do Prisma
npx prisma migrate dev

# Iniciar servidor em modo watch (recarrega automático ao salvar arquivos)
npm run start:dev
```

---

## 📂 Arquitetura de Módulos (NestJS)

O backend é organizado de forma modular. Cada pasta dentro de `src/modules` encapsula suas próprias rotas (controllers), lógica de negócios (services), esquemas de validação (DTOs) e comunicação (gateways).

*   **`auth/`**: Gerencia login, criptografia de senhas com `bcrypt` e emissão de tokens JWT.
*   **`company/`** & **`companySetting/`**: Gerencia o cadastro de empresas (tenants) e configurações personalizadas de etiquetas para customização da interface.
*   **`agent/`**: Lida com atendentes, seus cargos (`ADMIN` ou `AGENT`), status atual (`ONLINE`, `OFFLINE`, `BUSY`) e associações à empresa.
*   **`customers/`**: Cadastro e validação de clientes que interagem com o sistema de atendimento.
*   **`queue/`**: Criação e controle de filas de atendimento categorizadas por setores.
*   **`queueEntry/`**: Gerencia a jornada do cliente na fila, controlando o status (`WAITING`, `MATCHED`, `IN_PROGRESS`, etc.).
*   **`chat/`**: Configuração do gateway de WebSockets (Socket.io) para comunicação instantânea bidirecional.
*   **`redis/`**: Gerenciador de conexão com o cache Redis, otimizando transações rápidas e pub/sub.
*   **`health/`**: Módulo de telemetria que expõe a saúde do sistema (`/health`) para ferramentas de monitoramento.

---

## 🔧 Principais Scripts Disponíveis

No arquivo `package.json` estão mapeados os scripts que você mais usará no dia a dia:

| Comando | Descrição |
| :--- | :--- |
| `npm run start:dev` | Inicia o servidor NestJS observando mudanças nos arquivos (`watch mode`). |
| `npm run start:debug` | Inicia o servidor com depurador ativo para inspeção de erros. |
| `npm run start:prod` | Executa o build de produção compilado a partir de `dist/main.js`. |
| `npm run build` | Compila o código TypeScript em arquivos de produção JavaScript na pasta `dist/`. |
| `npm run format` | Corrige a formatação do código em arquivos `.ts` usando o Prettier. |
| `npm run lint` | Analisa e corrige erros de estilo/padrões de código usando o ESLint. |
| `npm run test` | Executa todos os testes unitários (`jest`). |
| `npm run test:watch` | Executa testes salvando e re-executando à medida que você altera o código. |
| `npm run test:cov` | Gera um relatório visual de cobertura de código no console e na pasta `/coverage`. |

---

## 🧪 Estrutura de Testes

Os testes unitários ficam localizados próximos aos respectivos arquivos que testam, utilizando a extensão `.spec.ts`. Exemplo:
*   `app.controller.spec.ts` contendo testes para o `app.controller.ts`.

Para executar testes de integração ponta a ponta (E2E):
```bash
npm run test:e2e
```
