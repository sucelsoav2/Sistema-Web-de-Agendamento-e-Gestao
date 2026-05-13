const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/database');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});