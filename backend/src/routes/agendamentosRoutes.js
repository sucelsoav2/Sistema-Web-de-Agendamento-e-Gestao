const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const agendamentosController = require('../controllers/agendamentosController');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

router.get('/', verificarToken, agendamentosController.listar);
router.get('/meus', verificarToken, agendamentosController.listarMeus);
router.get('/disponibilidade', verificarToken, agendamentosController.disponibilidade.bind(agendamentosController));
router.get('/datas-disponiveis', verificarToken, agendamentosController.datasDisponiveis.bind(agendamentosController));
router.post('/marcar', verificarToken, agendamentosController.marcarComoCliente.bind(agendamentosController));
router.post('/', verificarToken, agendamentosController.criar);
router.patch('/:id/cancelar', verificarToken, agendamentosController.cancelar.bind(agendamentosController));
router.put('/:id', verificarToken, agendamentosController.atualizar);
router.delete('/:id', verificarToken, agendamentosController.deletar);

module.exports = router;
