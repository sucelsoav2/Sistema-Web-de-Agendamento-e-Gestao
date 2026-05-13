const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const espacosController = require('../controllers/espacosController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, espacosController.listar);
router.post('/', verificarToken, espacosController.criar);
router.put('/:id', verificarToken, espacosController.atualizar);
router.delete('/:id', verificarToken, espacosController.deletar);

module.exports = router;
