const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const bloqueiosController = require('../controllers/bloqueiosController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, bloqueiosController.listar.bind(bloqueiosController));
router.post('/', verificarToken, bloqueiosController.criar.bind(bloqueiosController));
router.put('/:id', verificarToken, bloqueiosController.atualizar.bind(bloqueiosController));
router.delete('/:id', verificarToken, bloqueiosController.deletar.bind(bloqueiosController));

module.exports = router;
