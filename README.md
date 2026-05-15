# Sistema Web de Agendamento e Gestão
 
> Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento FullStack** — Universidade SENAI CIMATEC  
> Professor: Celso Barreto
> Integrantes do Grupo: Leonardo Magalhães, Marcos Menezes, Rafael Guerra, Rian Albert, Vinicius Fernandes
 
---
 
## Sobre o Projeto
 
O **Sistema Web de Agendamento e Gestão** é uma aplicação moderna e responsiva voltada para organizações e profissionais que precisam gerenciar horários, espaços e compromissos de forma prática e eficiente.
 
O sistema centraliza informações de agendamentos, reduz erros operacionais, melhora a comunicação com clientes e aumenta a produtividade das equipes.
 
---
 
## Funcionalidades
 
| Funcionalidade | Descrição |
|---|---|
| Agendamento Online | O cliente realiza marcações diretamente pelo sistema, visualizando horários disponíveis |
| Lembretes Automáticos | Envio de notificações por e-mail para clientes sobre agendamentos futuros |
| Agenda por Status e Cores | Visualização da agenda com cores diferenciadas por status (Agendado, Confirmado, Pendente, Cancelado, Concluído) |
| Bloqueio de Horários | Possibilidade de bloquear períodos indisponíveis no calendário |
| Gestão de Espaços | Controle e associação de salas/consultórios/ambientes a agendamentos |
| Integração Google Agenda | Sincronização bidirecional de compromissos com o Google Calendar |
| Personalização da Agenda | Configuração de horários de funcionamento, intervalos, visualização e preferências visuais |
 
---


## Tecnologias Utilizadas

### Frontend
- **JavaScript** (Vanilla JS / React)
- HTML5 + CSS3
- Interface responsiva (mobile-first)
### Backend
- **Node.js** com Express.js
- API RESTful
- Autenticação JWT
- Integração com Google Calendar API
### Banco de Dados
- **MySQL** ou **PostgreSQL** (via Supabase)
### Controle de Versão
- Git + GitHub
---
 
## Estrutura do Projeto
 
```
sistema-agendamento/
│
├── frontend/
│   ├── pages/          # Páginas da aplicação
│   ├── components/     # Componentes reutilizáveis
│   ├── services/       # Chamadas à API
│   ├── styles/         # Arquivos CSS/estilização
│   └── assets/         # Imagens, ícones e fontes
│
├── backend/
│   ├── controllers/    # Lógica de controle das rotas
│   ├── routes/         # Definição dos endpoints
│   ├── services/       # Regras de negócio
│   ├── models/         # Modelos de dados
│   ├── middlewares/    # Autenticação, validação etc.
│   └── config/         # Configurações gerais
│
├── database/
│   └── schema.sql      # Script de criação do banco de dados
│
├── docs/
│   ├── manual-usuario.docx
│   └── documentacao-tecnica.md
│
└── README.md
```
 
---
 
## Modelo de Banco de Dados
 
O banco de dados segue modelagem relacional com as seguintes tabelas principais:
 
- `usuarios` — Administradores e profissionais do sistema
- `clientes` — Pessoas que realizam agendamentos
- `agendamentos` — Registros de marcações com data, horário e status
- `espacos` — Salas, consultórios ou ambientes disponíveis
- `status` — Tabela de domínio de status possíveis
- `lembretes` — Configurações e registros de notificações enviadas
- `configuracoes_agenda` — Preferências por usuário/organização
---
 
## Como Executar o Projeto
 
### Pré-requisitos
- Node.js v18+
- MySQL ou conta no Supabase (PostgreSQL)
- Git
### Passo a passo
 
```bash
# 1. Clone o repositório
git clone https://github.com/sucelsoav2/Sistema-Web-de-Agendamento-e-Gestao.git
cd Sistema-Web-de-Agendamento-e-Gestao
 
# 2. Instale as dependências do backend
cd backend
npm install
 
# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais de banco e API
 
# 4. Execute as migrations do banco de dados
npm run migrate
 
# 5. Inicie o servidor backend
npm run dev
 
# 6. Em outro terminal, inicie o frontend
cd ../frontend
npm install
npm start
```
 
### Variáveis de Ambiente (`.env`)
 
```env
# Banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=agendamento_db
 
# Autenticação
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:3000
 
# Google Calendar API
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/google-calendar/callback
 
# Nodemailer (envio de e-mails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
EMAIL_FROM=seu_email@gmail.com
```

### Deploy na Vercel

O projeto já inclui `vercel.json` e a função serverless `api/index.js`.

Variáveis que precisam ser cadastradas em **Vercel > Project Settings > Environment Variables**:

```env
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
APP_URL=https://seu-projeto.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://seu-projeto.vercel.app/google-calendar/callback
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

Depois do deploy, atualize também:

- Supabase Auth Redirect URLs:
  - `https://seu-projeto.vercel.app/src/pages/reset-password.html`
- Google Cloud OAuth Redirect URI:
  - `https://seu-projeto.vercel.app/google-calendar/callback`
 
---
 
## Endpoints da API
 
### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login do usuário |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/register` | Cadastro de novo usuário |
 
### Agendamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/agendamentos` | Listar todos os agendamentos |
| GET | `/api/agendamentos/:id` | Buscar agendamento por ID |
| POST | `/api/agendamentos` | Criar novo agendamento |
| PUT | `/api/agendamentos/:id` | Atualizar agendamento |
| DELETE | `/api/agendamentos/:id` | Cancelar agendamento |
 
### Espaços
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/espacos` | Listar todos os espaços |
| POST | `/api/espacos` | Cadastrar novo espaço |
| PUT | `/api/espacos/:id` | Atualizar espaço |
| DELETE | `/api/espacos/:id` | Remover espaço |
 
### Clientes
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Cadastrar cliente |
| PUT | `/api/clientes/:id` | Atualizar cliente |
 
### Lembretes
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/lembretes/enviar` | Disparar lembrete manual |
| GET | `/api/lembretes/configuracoes` | Obter configurações de lembrete |
 
---
 
## Identidade Visual
 
| Elemento | Valor |
|----------|-------|
| Cor principal | `#2563EB` (Azul) |
| Cor de sucesso | `#10B981` (Verde) |
| Cor de alerta | `#F59E0B` (Amarelo) |
| Cor de erro | `#EF4444` (Vermelho) |
| Fundo neutro | `#F3F4F6` (Cinza claro) |
| Texto principal | `#1F2937` (Cinza grafite) |
| Fonte | Inter / Poppins / Roboto |
 
### Status dos Agendamentos
- 🔵 **Agendado** — `#2563EB`
- 🟢 **Confirmado** — `#10B981`
- 🟡 **Pendente** — `#F59E0B`
- 🔴 **Cancelado** — `#EF4444`
- ⚫ **Concluído** — `#6B7280`
- ⬜ **Bloqueado** — `#9CA3AF`
---
 
## Equipe
 
| Integrante | Responsabilidade |
|------------|-----------------|
| [Membro 1] | GitHub · README · Docs técnicas · Manual do usuário · Roteiro de pitch |
| [Membro 2] | Script final do banco (dump SQL) |
| [Membro 3] | Testes e integração final |
| [Membro 4] | Frontend |
| [Membro 5] | Backend |
 
---
 
## Licença
 
Projeto acadêmico desenvolvido para fins educacionais — SENAI CIMATEC, 2026.
 
---
 
## Repositório
[github.com/sucelsoav2/Sistema-Web-de-Agendamento-e-Gestao](https://github.com/sucelsoav2/Sistema-Web-de-Agendamento-e-Gestao)
