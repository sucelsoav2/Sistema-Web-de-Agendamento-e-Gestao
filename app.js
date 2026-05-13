const express = require('express');
const cors = require('cors');
require('dotenv').config();

// TODO: descomentar quando supabase estiver configurado
// const connectDB = require('./config/database');
// connectDB();

// importar middlewares
const validarEntrada = require('./src/middlewares/validarEntrada');
const manipuladorErrosGlobal = require('./src/middlewares/manipuladorErros');

// importar rotas
const authRoutes = require('./src/routes/authRoutes');
const agendamentoRoutes = require('./src/routes/agendamentoRoutes');
const espacoRoutes = require('./src/routes/espacoRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const lembreteRoutes = require('./src/routes/lembreteRoutes');
const bloqueioHorarioRoutes = require('./src/routes/bloqueioHorarioRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();

// middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(validarEntrada);

// rotas de autenticação
app.use('/auth', authRoutes);

// rotas da aplicação
app.use('/agendamentos', agendamentoRoutes);
app.use('/espacos', espacoRoutes);
app.use('/clientes', clienteRoutes);
app.use('/lembretes', lembreteRoutes);
app.use('/bloqueios', bloqueioHorarioRoutes);
app.use('/usuarios', usuarioRoutes);

// rota de health check
app.get('/health', (req, res) => {
  return res.status(200).json({
    sucesso: true,
    mensagem: 'Servidor está operacional',
    timestamp: new Date().toISOString()
  });
});

// rota 404
app.use((req, res) => {
  return res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada',
    path: req.path,
    metodo: req.method
  });
});

// middleware de tratamento de erros (deve ser o último)
app.use(manipuladorErrosGlobal);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`servidor rodando na porta ${PORT}`);
  console.log(`acesse http://localhost:${PORT}`);
});
