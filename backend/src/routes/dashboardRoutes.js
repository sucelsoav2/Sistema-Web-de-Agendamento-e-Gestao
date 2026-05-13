const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const dashboardController = require('../controllers/dashboardController');

// Middleware de autenticação
const verificarToken = jwt({
  secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui",
  algorithms: ["HS256"],
  requestProperty: "auth",
});

// Busca as estatísticas do painel
router.get('/stats', verificarToken, dashboardController.getStats);

module.exports = router;
