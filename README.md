# Sistema Web de Agendamento e Gestão

> Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento FullStack** — Universidade SENAI CIMATEC  
> Professor: Celso Barreto  
> **Integrantes:** Leonardo Magalhães · Marcos Menezes · Rafael Guerra · Rian Albert · Vinicius Fernandes

**Deploy:** [sistema-web-de-agendamento-e-gestao.vercel.app](https://sistema-web-de-agendamento-e-gestao.vercel.app)  
**Repositório:** [github.com/MarcosMenezes30/Sistema-Web-de-Agendamento-e-Gestao](https://github.com/MarcosMenezes30/Sistema-Web-de-Agendamento-e-Gestao)

---

## Sobre o Projeto

O **Sistema Web de Agendamento e Gestão** é uma aplicação web moderna e responsiva voltada para organizações e profissionais que precisam gerenciar horários, espaços e compromissos de forma prática e eficiente.

O sistema centraliza informações de agendamentos, reduz erros operacionais, melhora a comunicação com clientes e aumenta a produtividade das equipes. O frontend é servido como arquivos estáticos e se comunica com um backend Node.js via API REST — ambos hospedados na **Vercel** (função serverless + static files).

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Agendamento Online | O cliente realiza marcações diretamente pelo sistema, visualizando horários disponíveis |
| Lembretes Automáticos | Envio de notificações por e-mail via Nodemailer sobre agendamentos futuros |
| Agenda por Status e Cores | Visualização com cores diferenciadas por status (Agendado, Confirmado, Pendente, Cancelado, Concluído) |
| Bloqueio de Horários | Possibilidade de bloquear períodos indisponíveis no calendário |
| Gestão de Espaços | Controle e associação de salas/ambientes a agendamentos, prevenindo conflitos |
| Integração Google Agenda | Sincronização com o Google Calendar via Google APIs |
| Personalização da Agenda | Configuração de horários de funcionamento, intervalos e preferências visuais |

---

## Tecnologias Utilizadas

### Frontend
- **HTML5 + CSS3 + JavaScript** (Vanilla JS)
- Interface responsiva (mobile-first)
- Servido como arquivos estáticos via Vercel

### Backend
- **Node.js** com **Express.js v5**
- API RESTful com rotas separadas por domínio
- Autenticação via **JWT** (`jsonwebtoken` + `express-jwt`)
- Hash de senhas com **bcrypt**
- Envio de e-mails com **Nodemailer**
- Integração com **Google Calendar** via `googleapis`

### Banco de Dados
- **Supabase** (PostgreSQL gerenciado em nuvem)  
  Acesso via `@supabase/supabase-js`

### Infraestrutura / Deploy
- **Vercel** — backend como função serverless (`api/index.js`) + frontend como static files
- Configuração de rotas em `vercel.json`

### Controle de Versão
- Git + GitHub

---

## Estrutura Real do Projeto

```
Sistema-Web-de-Agendamento-e-Gestao/
│
├── api/
│   └── index.js              # Função serverless para o deploy na Vercel
│
├── backend/
│   ├── sql/                  # Scripts SQL do banco de dados
│   └── src/
│       ├── config/           # Configuração do banco (Supabase) e variáveis
│       ├── controllers/      # Lógica de controle das rotas
│       ├── middlewares/      # Autenticação JWT e validações
│       ├── models/           # Modelos de dados
│       ├── routes/           # Definição dos endpoints por domínio
│       ├── services/         # Regras de negócio
│       ├── utils/            # Funções utilitárias
│       └── app.js            # Configuração do servidor Express
│
├── frontend/                 # Interface do usuário (HTML, CSS, JS)
│
├── .env.example              # Modelo das variáveis de ambiente
├── .gitignore
├── app.js                    # Entry point principal
├── package.json
├── package-lock.json
├── vercel.json               # Configuração do deploy na Vercel
└── README.md
```

---

## Rotas da API

As rotas seguem o padrão definido no `app.js` e são roteadas pela Vercel via `vercel.json`:

| Prefixo | Arquivo de rotas | Responsabilidade |
|---|---|---|
| `/auth` | `authRoutes.js` | Login, logout, registro, reset de senha |
| `/dashboard` | `dashboardRoutes.js` | Dados resumidos para o painel principal |
| `/agendamentos` | `agendamentosRoutes.js` | CRUD de agendamentos |
| `/clientes` | `clientesRoutes.js` | CRUD de clientes |
| `/espacos` | `espacosRoutes.js` | CRUD de espaços/salas |
| `/bloqueios` | `bloqueiosRoutes.js` | Bloqueio de horários indisponíveis |
| `/lembretes` | `lembretesRoutes.js` | Configuração e disparo de lembretes por e-mail |
| `/configuracoes` | `configuracoesRoutes.js` | Preferências da agenda por usuário |
| `/usuarios` | `usuariosRoutes.js` | Gerenciamento de usuários |
| `/google-calendar` | `googleCalendarRoutes.js` | Integração e callback OAuth com Google Calendar |

### Exemplos de endpoints

**Autenticação**
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login do usuário |
| POST | `/auth/register` | Cadastro de novo usuário |
| POST | `/auth/logout` | Logout |

**Agendamentos**
| Método | Rota | Descrição |
|---|---|---|
| GET | `/agendamentos` | Listar todos os agendamentos |
| GET | `/agendamentos/:id` | Buscar agendamento por ID |
| POST | `/agendamentos` | Criar novo agendamento |
| PUT | `/agendamentos/:id` | Atualizar agendamento |
| DELETE | `/agendamentos/:id` | Cancelar/remover agendamento |

**Espaços**
| Método | Rota | Descrição |
|---|---|---|
| GET | `/espacos` | Listar espaços disponíveis |
| POST | `/espacos` | Cadastrar novo espaço |
| PUT | `/espacos/:id` | Atualizar espaço |
| DELETE | `/espacos/:id` | Remover espaço |

**Google Calendar**
| Método | Rota | Descrição |
|---|---|---|
| GET | `/google-calendar/auth` | Inicia o fluxo OAuth com o Google |
| GET | `/google-calendar/callback` | Callback após autorização do Google |
| POST | `/google-calendar/sync` | Sincroniza agendamentos com o Google Calendar |

---

## Banco de Dados (Supabase / PostgreSQL)

O banco é hospedado no **Supabase** e modelado de forma relacional. As principais tabelas são:

- `usuarios` — Administradores e profissionais do sistema
- `clientes` — Pessoas que realizam agendamentos
- `agendamentos` — Registros de marcações com data, horário e status
- `espacos` — Salas, consultórios ou ambientes disponíveis para atendimento
- `bloqueios` — Períodos bloqueados na agenda
- `lembretes` — Configurações e histórico de notificações enviadas
- `configuracoes_agenda` — Preferências por usuário/organização

> Os scripts SQL de criação do banco estão em `backend/sql/`.

---

## Como Executar Localmente

### Pré-requisitos
- **Node.js v18+**
- **npm**
- Conta no **Supabase** com um projeto criado
- Conta no **Google Cloud** com OAuth configurado (para integração com Google Calendar)
- Git

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/MarcosMenezes30/Sistema-Web-de-Agendamento-e-Gestao.git
cd Sistema-Web-de-Agendamento-e-Gestao

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais (veja a seção abaixo)

# 4. Execute o servidor em modo de desenvolvimento
npm run dev
```

O servidor iniciará na porta `3000` por padrão. Acesse: [http://localhost:3000](http://localhost:3000)

> O frontend é servido automaticamente pelo Express a partir da pasta `frontend/`.

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor com nodemon (hot reload) |
| `npm start` | Inicia o servidor em modo produção |
| `npm run vercel-build` | Etapa de build para a Vercel (sem ação necessária) |

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Autenticação JWT
JWT_SECRET=seu_segredo_jwt_muito_seguro

# URL base da aplicação
APP_URL=http://localhost:3000

# Google Calendar OAuth
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/google-calendar/callback

# Nodemailer (envio de e-mails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM=seu_email@gmail.com
```

---

## Deploy na Vercel

O projeto já está configurado para deploy na Vercel via `vercel.json`.

### Arquitetura do deploy

```
Vercel
├── api/index.js        → Função serverless (backend Node.js/Express)
└── frontend/**         → Arquivos estáticos (HTML, CSS, JS)
```

### Roteamento (vercel.json)

As rotas de API (`/auth`, `/agendamentos`, `/espacos`, etc.) são direcionadas para a função serverless. As demais requisições servem os arquivos estáticos do frontend. A rota raiz `/` serve o `frontend/index.html`.

### Variáveis de ambiente na Vercel

Configure em **Vercel > Project Settings > Environment Variables**:

```
SUPABASE_URL
SUPABASE_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
APP_URL=https://sistema-web-de-agendamento-e-gestao.vercel.app
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://sistema-web-de-agendamento-e-gestao.vercel.app/google-calendar/callback
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
```

### Após o deploy, configure também

- **Supabase → Authentication → URL Configuration → Redirect URLs:**  
  `https://sistema-web-de-agendamento-e-gestao.vercel.app/src/pages/reset-password.html`

- **Google Cloud Console → OAuth → URIs de redirecionamento autorizados:**  
  `https://sistema-web-de-agendamento-e-gestao.vercel.app/google-calendar/callback`

---

## Identidade Visual

| Elemento | Cor / Valor |
|---|---|
| Cor principal | `#2563EB` (Azul) |
| Cor de sucesso/confirmado | `#10B981` (Verde) |
| Cor de alerta/pendente | `#F59E0B` (Amarelo) |
| Cor de erro/cancelado | `#EF4444` (Vermelho) |
| Fundo neutro | `#F3F4F6` (Cinza claro) |
| Texto principal | `#1F2937` (Cinza grafite) |
| Tipografia | Inter / Poppins / Roboto |

### Cores por status

| Status | Cor |
|---|---|
| 🔵 Agendado | `#2563EB` |
| 🟢 Confirmado | `#10B981` |
| 🟡 Pendente | `#F59E0B` |
| 🔴 Cancelado | `#EF4444` |
| ⚫ Concluído | `#6B7280` |
| ⬜ Bloqueado | `#9CA3AF` |

---

## Licença

Projeto acadêmico desenvolvido para fins educacionais — SENAI CIMATEC, 2026.
