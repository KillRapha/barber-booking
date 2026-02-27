# 💈 Barber Booking System

Sistema completo de agendamento para barbearia, desenvolvido com arquitetura moderna, foco em escalabilidade, segurança e experiência mobile-first.

---

## 🚀 Tecnologias Utilizadas

- **Next.js 16 (App Router)**
- **React 18**
- **TypeScript**
- **Node.js**
- **PostgreSQL (Neon)**
- **Prisma ORM**
- **Tailwind CSS**
- **Zod (validações)**
- **JWT (autenticação)**
- **bcrypt (hash de senha)**

---

## 🏗 Arquitetura do Projeto

O projeto segue princípios de:

- Clean Code
- Separação de responsabilidades
- Arquitetura em camadas
- Repository Pattern
- Services Layer
- Mobile-first design
- Princípios SOLID

### 📐 Camadas da Aplicação

app/ → Rotas (Next App Router)
components/ → UI e páginas
services/ → Regras de negócio
repositories/ → Acesso ao banco (Prisma)
lib/ → Utilitários (auth, jwt, date, etc)
validators/ → Validações (Zod)
prisma/ → Schema e migrations


---

## 📂 Estrutura de Pastas


src/
│
├── app/
│ ├── api/
│ ├── dashboard/
│ ├── appointments/
│ ├── login/
│ ├── register/
│
├── components/
│ ├── layout/
│ ├── ui/
│ ├── pages/
│
├── services/
├── repositories/
├── lib/
├── validators/
│
prisma/
├── schema.prisma
├── migrations/
└── seed.ts


---

## 🔐 Autenticação

O sistema utiliza:

- Login com **CPF + senha**
- Senha criptografada com **bcrypt**
- Autenticação baseada em **JWT**
- Cookie HTTP-only
- Middleware de proteção de rotas
- Controle de permissões (ADMIN / CLIENT)

---

## 🗄 Banco de Dados

Banco PostgreSQL hospedado no **Neon**.

### Principais entidades:

- User
- Barber
- Service
- WorkShift
- Appointment

Relacionamentos bem definidos com integridade referencial.

---

## ⚙️ Configuração do Projeto

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/seu-usuario/barber-booking.git
cd barber-booking
2️⃣ Instale as dependências
npm install
3️⃣ Configure o arquivo .env

Crie um arquivo .env na raiz:

DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
JWT_SECRET="uma_chave_secreta_grande_e_aleatoria"
4️⃣ Execute as migrations
npx prisma migrate dev
npx prisma generate
5️⃣ Popular o banco (Seed)
npm run db:seed
6️⃣ Rodar o projeto
npm run dev

Acesse:

http://localhost:3000
📌 Funcionalidades
👤 Cliente

Cadastro

Login com CPF

Visualizar serviços

Escolher barbeiro

Selecionar data

Ver horários disponíveis

Criar agendamento

Cancelar agendamento

🛠 Admin

Cadastrar barbeiros

Ativar/Desativar barbeiros

Criar e editar serviços

Definir turnos de trabalho

Visualizar todos os agendamentos

🧠 Regras de Negócio Importantes

Não permite agendar horário já ocupado

Validação de CPF

Senha sempre com hash

Rotas protegidas por middleware

Cancelamento altera apenas o agendamento selecionado

Disponibilidade baseada em:

Turnos do barbeiro

Agendamentos existentes

Duração do serviço

📱 Mobile First

Interface construída com Tailwind CSS focada em:

Experiência mobile

Layout tipo aplicativo

Componentização reutilizável

🔒 Segurança

JWT assinado

Cookies HTTP-only

Validação no backend

Sanitização de inputs

Prisma protege contra SQL Injection

🧪 Scripts Disponíveis
npm run dev        # Ambiente de desenvolvimento
npm run build      # Build produção
npm run start      # Rodar build
npm run db:seed    # Popular banco
npx prisma studio  # Visualizar banco
📄 Licença

Este projeto é de uso educacional e experimental.

👩‍💻 Autora

Desenvolvido por Raphaella Jheovanna Moreira Tavares


---

# ✅ Agora faça:

1) Crie arquivo na raiz:

README.md


2) Cole tudo acima

3) Commit:

```bash
git add .
git commit -m "docs: add project documentation"
git push