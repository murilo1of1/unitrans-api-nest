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

- 🔐 **Autenticação completa** para alunos e empresas
- 🚌 **Gestão de veículos** com upload de imagens
- 🔗 **Sistema de vínculos** aluno-empresa (via token ou solicitação)
- 🛣️ **Gerenciamento de rotas** e pontos de parada
- 📧 **Sistema de e-mail** para recuperação de senha

---

## 🛠️ **Tecnologias Utilizadas**

- **Backend:** Node.js + NestJS
- **Banco de Dados:** PostgreSQL + TypeORM
- **Autenticação:** JWT + bcrypt
- **Validação:** class-validator
- **E-mail:** Nodemailer
- **Testes:** Jest

---

## **Scripts Disponíveis**

```bash
npm run start:dev     # Executa servidor em modo desenvolvimento
npm run start:prod    # Executa servidor em produção
npm run test          # Executa testes
```

---

<div align="center">
  <p>Desenvolvido para facilitar o transporte universitário</p>
</div>
