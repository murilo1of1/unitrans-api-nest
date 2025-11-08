# 🚌 UniTrans API

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-FE0902?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

## 📋 Sobre o Projeto

**UniTrans** é um sistema completo de gerenciamento de transporte universitário que conecta **estudantes** e **empresas de transporte**. O sistema permite que alunos se vinculem a múltiplas empresas de transporte através de dois métodos: **tokens de acesso** (imediatos) ou **solicitações de vínculo** (com aprovação).

### 🎯 Funcionalidades Principais

- 🔐 **Autenticação completa** para alunos e empresas (JWT)
- 🚌 **Gestão de veículos** com upload de imagens
- 🔗 **Sistema de vínculos** aluno-empresa (via token ou solicitação)
- 🛣️ **Gerenciamento de rotas** e pontos de parada
- 📧 **Sistema de e-mail** para recuperação de senha
- ✅ **Validação de dados** com decorators
- 📚 **Documentação automática** com Swagger
- 🧪 **Testes unitários e E2E** com Jest

---

## 🛠️ **Tecnologias Utilizadas**

- **Backend:** Node.js + NestJS
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL + TypeORM
- **Autenticação:** JWT + Passport + bcrypt
- **Validação:** class-validator + class-transformer
- **E-mail:** Nodemailer
- **Testes:** Jest + Supertest
- **Documentação:** Swagger/OpenAPI

---

## 📦 **Instalação**

```bash
# Clone o repositório
git clone https://github.com/murilo1of1/unitrans-api-nest.git
cd unitrans-api-nest

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

---

## ⚙️ **Configuração**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=seu_usuario
POSTGRES_PASSWORD=sua_senha
POSTGRES_DB=unitrans

# JWT
TOKEN_KEY=sua_chave_secreta_jwt

# Email
EMAIL_USER=seu_email@gmail.com
PASS_KEY=sua_senha_app

# API
PORT=3000
NODE_ENV=development
```

---

## 🚀 **Executando o Projeto**

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Produção
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

A API estará disponível em: `http://localhost:3000`

---

## 📚 **Documentação da API**

Acesse a documentação Swagger em: `http://localhost:3000/docs`

---

## 🧪 **Testes**

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e

# Watch mode
npm run test:watch
```

---

## 📝 **Scripts Disponíveis**

```bash
npm run start:dev     # Executa servidor em modo desenvolvimento
npm run start:prod    # Executa servidor em produção
npm run build         # Compila o projeto TypeScript
npm run test          # Executa testes unitários
npm run test:cov      # Executa testes com cobertura
npm run test:e2e      # Executa testes E2E
npm run lint          # Verifica código com ESLint
npm run format        # Formata código com Prettier
```

---

## 📁 **Estrutura do Projeto**

```
src/
├── common/                  # Recursos compartilhados
│   └── services/           # Serviços globais (email, etc)
├── modules/                # Módulos da aplicação
│   ├── alunos/            # Gerenciamento de alunos
│   ├── empresas/          # Gerenciamento de empresas
│   ├── auth/              # Autenticação JWT
│   ├── pontos/            # Pontos de embarque/desembarque
│   └── rotas/             # Rotas de transporte
├── app.module.ts          # Módulo principal
└── main.ts                # Ponto de entrada
```

---

## 🔐 **Endpoints Principais**

### Autenticação

- `POST /auth/login` - Login de aluno
- `POST /auth/login-empresa` - Login de empresa
- `POST /auth/forgot-password` - Esqueci minha senha
- `POST /auth/reset-password` - Redefinir senha

### Alunos 🔒

- `GET /alunos` - Lista todos os alunos
- `GET /alunos/:id` - Busca aluno por ID
- `POST /alunos` - Cria novo aluno
- `PATCH /alunos/:id` - Atualiza aluno
- `DELETE /alunos/:id` - Remove aluno
- `POST /alunos/escolher-pontos` - Define pontos de embarque

### Empresas 🔒

- `GET /empresas` - Lista empresas
- `GET /empresas/:id` - Busca empresa por ID
- `POST /empresas` - Cria nova empresa
- `PATCH /empresas/:id` - Atualiza empresa
- `DELETE /empresas/:id` - Remove empresa

🔒 = Requer autenticação JWT

---

## 🛡️ **Segurança**

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Autenticação JWT com expiração (8 horas)
- ✅ Guards para proteção de rotas
- ✅ Validação automática de dados
- ✅ CORS habilitado
- ✅ Tokens de recuperação com expiração (30 minutos)

---

## 🔄 **Migração**

Esta API foi migrada da versão **Express.js** para **NestJS**, mantendo todas as funcionalidades e adicionando:

- ✅ Arquitetura modular e escalável
- ✅ TypeScript strict mode
- ✅ Validação com decorators
- ✅ Testes automatizados (55+ testes)
- ✅ Documentação Swagger automática
- ✅ Dependency Injection
- ✅ Guards e Interceptors

---

<div align="center">
  <p>Desenvolvido para facilitar o transporte universitário 🎓</p>
</div>
