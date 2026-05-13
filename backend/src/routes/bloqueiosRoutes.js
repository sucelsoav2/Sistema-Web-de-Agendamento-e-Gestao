const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const bloqueiosController = require('../controllers/bloqueiosController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, bloqueiosController.listar);
router.post('/', verificarToken, bloqueiosController.criar);
router.put('/:id', verificarToken, bloqueiosController.atualizar);
router.delete('/:id', verificarToken, bloqueiosController.deletar);

module.exports = router;
