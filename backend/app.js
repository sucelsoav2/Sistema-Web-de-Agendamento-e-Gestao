const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

require('./src/config/database');

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
const googleCalendarRoutes = require('./src/routes/googleCalendarRoutes');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/espacos', espacosRoutes);
app.use('/bloqueios', bloqueiosRoutes);
app.use('/lembretes', lembretesRoutes);
app.use('/configuracoes', configuracoesRoutes);
app.use('/clientes', clientesRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/google-calendar', googleCalendarRoutes);

// Quando o usuário acessar a raiz (/), envia o arquivo index.html do frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;
