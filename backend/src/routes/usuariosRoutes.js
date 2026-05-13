const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const usuariosController = require('../controllers/usuariosController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, usuariosController.listar);
router.get('/me', verificarToken, usuariosController.perfil);
router.put('/me', verificarToken, usuariosController.atualizarPerfil);
router.get('/profissionais', verificarToken, usuariosController.listarProfissionais);
router.put('/:id/cargo', verificarToken, usuariosController.atualizarCargo);

module.exports = router;
