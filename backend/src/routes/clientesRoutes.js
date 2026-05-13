const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const clientesController = require('../controllers/clientesController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, clientesController.listar);
router.post('/', verificarToken, clientesController.criar);
router.put('/:id', verificarToken, clientesController.atualizar);
router.delete('/:id', verificarToken, clientesController.deletar);

module.exports = router;
