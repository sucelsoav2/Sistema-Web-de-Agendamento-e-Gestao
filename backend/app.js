const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const supabase = require('./src/config/database');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir arquivos estáticos da pasta frontend (que está um nível acima da pasta backend)
app.use(express.static(path.join(__dirname, '../frontend')));

const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const espacosRoutes = require('./src/routes/espacosRoutes');
const bloqueiosRoutes = require('./src/routes/bloqueiosRoutes');
const lembretesRoutes = require('./src/routes/lembretesRoutes');
const configuracoesRoutes = require('./src/routes/configuracoesRoutes');
const clientesRoutes = require('./src/routes/clientesRoutes');
const agendamentosRoutes = require('./src/routes/agendamentosRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/espacos', espacosRoutes);
app.use('/bloqueios', bloqueiosRoutes);
app.use('/lembretes', lembretesRoutes);
app.use('/configuracoes', configuracoesRoutes);
app.use('/clientes', clientesRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/usuarios', usuariosRoutes);

// Quando o usuário acessar a raiz (/), envia o arquivo index.html do frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});