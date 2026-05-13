const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const lembretesController = require('../controllers/lembretesController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, lembretesController.listar);
router.post('/', verificarToken, lembretesController.criar);
router.put('/:id', verificarToken, lembretesController.atualizar);

module.exports = router;
