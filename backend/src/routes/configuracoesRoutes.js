const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const configuracoesController = require('../controllers/configuracoesController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, configuracoesController.obter);
router.put('/', verificarToken, configuracoesController.atualizar);
router.post('/', verificarToken, configuracoesController.atualizar);

module.exports = router;
