# 🚿 Faxina+ — Sistema de Agendamentos

Sistema web full stack para gestão de agendamentos de faxinas residenciais e comerciais.

## Stack

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS            |
| Backend    | Node.js, Express                        |
| ORM        | Prisma                                  |
| Banco      |  PostgreSQL 
| Auth       | JWT + bcryptjs                          |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- npm 9+

---

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
node src/lib/seed.js
npm run dev
```

API rodando em: `http://localhost:3333`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App rodando em: `http://localhost:5173`

---

## 🔑 Credenciais de teste

| Email              | Senha    | Papel     |
|--------------------|----------|-----------|
| admin@faxina.com   | admin123 | Admin     |
| op1@faxina.com     | op123    | Operador  |

---

## 📁 Estrutura

```
faxina/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelos do banco
│   └── src/
│       ├── index.js             # Entry point Express
│       ├── middleware/auth.js   # JWT middleware
│       ├── routes/
│       │   ├── auth.js          # Login / Registro
│       │   ├── agendamentos.js  # CRUD agendamentos + conflito
│       │   └── entities.js      # Clientes e Profissionais
│       └── lib/seed.js          # Seed do banco
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx        # Login + Cadastro
│       │   ├── Dashboard.jsx    # Tela principal
│       │   ├── Agendamentos.jsx # CRUD de agendamentos
│       │   └── Gestao.jsx       # Gestão + ordenação + conflito
│       ├── components/
│       │   └── Layout.jsx       # Sidebar + header
│       ├── hooks/useAuth.jsx    # Context de autenticação
│       └── lib/api.js           # Axios configurado
└── faxina_db.sql                # Script SQL (MySQL/PostgreSQL)
```

---

## 📋 Funcionalidades

- ✅ Cadastro e login de usuários com JWT
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de agendamentos
- ✅ Busca por texto nos agendamentos
- ✅ Validação de campos com alertas
- ✅ Detecção e alerta de conflito de horários
- ✅ Ordenação por data ou nome (Bubble Sort)
- ✅ Logout com redirecionamento
- ✅ Design responsivo em tons terrosos

## 🗝️ Requisitos de Infraestrutura

- **SGBD:** SQLite 3.x (desenvolvimento) / PostgreSQL 16+ (produção)
- **Linguagem:** JavaScript (Node.js 18 LTS)
- **Framework Backend:** Express 4.18
- **ORM:** Prisma 5.10
- **Framework Frontend:** React 18 + Vite 5
- **Sistema Operacional:** Ubuntu 22.04 / Windows 11 / macOS 14
