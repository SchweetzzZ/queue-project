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

## 🔁 Fluxo Completo e Teste das Rotas (Passo a Passo)

Para simular o fluxo completo do sistema ponta a ponta (cadastro, fila, atendimento e chat), siga o passo a passo abaixo utilizando um cliente HTTP (Postman, Insomnia, etc.) e um cliente de WebSocket (como a extensão de Socket.io do Postman ou um cliente simples web).

### 🛠️ Preparação: Tornar-se SUPER_ADMIN
Por padrão, todo usuário registrado começa como `USER`. Para realizar operações administrativas (criar empresas, criar filas, etc.), você deve se elevar a `SUPER_ADMIN`:
1. Registre um usuário normalmente (Passo 1).
2. Abra o Prisma Studio no terminal:
   ```bash
   npx prisma studio
   ```
3. Acesse a tabela **User**, localize o seu usuário e altere o campo `role` de `USER` para `SUPER_ADMIN`. Salve a alteração.

---

### 1️⃣ Autenticação

#### **Cadastro do Usuário**
*   **Método:** `POST`
*   **Rota:** `/auth/register`
*   **Corpo (JSON):**
    ```json
    {
      "name": "João Agente",
      "email": "joao@email.com",
      "password": "senha123",
      "phone": "11999999999"
    }
    ```

#### **Login do Usuário**
*   **Método:** `POST`
*   **Rota:** `/auth/login`
*   **Corpo (JSON):**
    ```json
    {
      "email": "joao@email.com",
      "password": "senha123"
    }
    ```
*   *Nota:* O login salvará o token `access_token` nos cookies do navegador/cliente HTTP. Se preferir usar Headers, copie o token retornado (ou verifique os cookies do cliente) e passe nos próximos requests como `Authorization: Bearer <seu_token>`.

---

### 2️⃣ Gestão de Empresas (Tenancy)

#### **Criar Empresa**
O usuário criador (que deve ser `SUPER_ADMIN`) se tornará automaticamente um **Agente ADMIN** desta empresa.
*   **Método:** `POST`
*   **Rota:** `/company`
*   **Headers:** `Authorization: Bearer <seu_token>`
*   **Corpo (JSON):**
    ```json
    {
      "name": "Minha Empresa de Suporte",
      "plan": "FREE",
      "isActive": true
    }
    ```
*   *Resposta:* Guarde o `id` retornado da empresa (chamaremos de `COMPANY_ID`).

---

### 3️⃣ Gestão de Filas

#### **Criar Fila**
Cadastre um setor de atendimento para a empresa.
*   **Método:** `POST`
*   **Rota:** `/queue`
*   **Headers:**
    *   `Authorization: Bearer <seu_token>`
    *   `x-company-id: <COMPANY_ID>`
*   **Corpo (JSON):**
    ```json
    {
      "name": "Suporte Técnico"
    }
    ```
*   *Resposta:* Guarde o `id` retornado da fila (chamaremos de `QUEUE_ID`).

---

### 4️⃣ Fluxo de Atendimento (Cliente & Agente)

#### **Cliente Entra na Fila**
Esta rota é pública, simulando a entrada do cliente pelo site ou totem de atendimento.
*   **Método:** `POST`
*   **Rota:** `/queue-entry`
*   **Corpo (JSON):**
    ```json
    {
      "queueId": "<QUEUE_ID>",
      "companyId": "<COMPANY_ID>",
      "name": "Carlos Cliente",
      "email": "carlos@email.com",
      "phone": "11988888888"
    }
    ```
*   *Resposta:* Retornará a posição na fila e o registro da entrada. Guarde o `id` retornado (que chamaremos de `QUEUE_ENTRY_ID`) e o `customerId` criado para o cliente.

#### **Cliente Consulta sua Posição**
*   **Método:** `GET`
*   **Rota:** `/queue-entry/<QUEUE_ID>/position/<QUEUE_ENTRY_ID>`

---

### 5️⃣ Atendimento pelo Agente

#### **Chamar Próximo da Fila**
O agente chama o próximo cliente disponível na fila utilizando o Redis. Isso muda o status da entrada para `IN_PROGRESS` e cria uma sala de `Chat`.
*   **Método:** `POST`
*   **Rota:** `/queue-entry/<QUEUE_ID>/call-next`
*   **Headers:**
    *   `Authorization: Bearer <seu_token>`
    *   `x-company-id: <COMPANY_ID>`
*   *Resposta:* Retorna os detalhes da entrada e o ID do Chat gerado (chamaremos de `CHAT_ID`).

---

### 6️⃣ Comunicação em Tempo Real (WebSockets)

Conecte no servidor de WebSockets no namespace `/chat`:
*   **URL de Conexão:** `ws://localhost:3000/chat`
*   **Para Agente Autenticar:** Passe o token de autenticação nos parâmetros de conexão (`auth: { token: "<seu_token>" }`).

#### **Eventos de WebSocket:**

1.  **Identificar o Cliente:**
    Para que o cliente receba a notificação de que foi chamado, ele deve escutar sua sala privada enviando o evento `identify`:
    *   **Emitir evento:** `identify`
    *   **Payload:** `{ "userId": "<CUSTOMER_ID>" }`
    *   *Nota:* Ao fazer isso, o cliente receberá o evento **`agent_called`** contendo o `chatId` assim que o agente rodar o passo `call-next`.

2.  **Entrar no Chat (Agente e Cliente):**
    Ambos devem entrar na sala do chat para trocar mensagens.
    *   **Emitir evento:** `join_chat`
    *   **Payload:** `{ "chatId": "<CHAT_ID>" }`

3.  **Enviar Mensagem:**
    *   **Emitir evento:** `send_message`
    *   **Payload:**
        ```json
        {
          "chatId": "<CHAT_ID>",
          "senderType": "AGENT", // ou "CUSTOMER"
          "senderId": "<AGENT_ID_ou_CUSTOMER_ID>",
          "content": "Olá, como posso te ajudar hoje?"
        }
        ```
    *   *Resultado:* O servidor registrará a mensagem no banco de dados e emitirá o evento **`new_message`** para todos na sala do chat.

---

### 7️⃣ Finalização do Atendimento

#### **Concluir Atendimento**
*   **Método:** `PATCH`
*   **Rota:** `/queue-entry/<QUEUE_ENTRY_ID>/complete`
*   **Headers:**
    *   `Authorization: Bearer <seu_token>`
    *   `x-company-id: <COMPANY_ID>`

---

## 🧪 Estrutura de Testes Automatizados

Os testes unitários ficam localizados próximos aos respectivos arquivos que testam, utilizando a extensão `.spec.ts`. Exemplo:
*   `app.controller.spec.ts` contendo testes para o `app.controller.ts`.

Para executar testes de integração ponta a ponta (E2E):
```bash
npm run test:e2e
```
