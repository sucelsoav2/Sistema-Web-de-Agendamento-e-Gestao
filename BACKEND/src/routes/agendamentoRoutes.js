// rotas de agendamentos

const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const { apenasAdminOuProfissional } = require('../middlewares/verificarRole');

// criar novo agendamento
router.post('/', agendamentoController.criar);

// obter horários disponíveis em um dia
router.get('/horarios-disponiveis', agendamentoController.obterHorariosDisponiveis);

// listar todos os agendamentos
router.get('/', agendamentoController.listar);

// listar agendamentos de um dia
router.get('/data/:data', agendamentoController.listarPorData);

// listar agendamentos de um cliente
router.get('/cliente/:clienteId', agendamentoController.listarPorCliente);

// listar agendamentos de um usuário (profissional)
router.get('/usuario/:usuarioId', agendamentoController.listarPorUsuario);

// listar agendamentos de um espaço
router.get('/espaco/:espacoId', agendamentoController.listarPorEspaco);

// obter agendamento específico
router.get('/:id', agendamentoController.obterPorId);

// atualizar agendamento
router.put('/:id', agendamentoController.atualizar);

// confirmar agendamento
router.patch('/:id/confirmar', agendamentoController.confirmar);

// cancelar agendamento
router.patch('/:id/cancelar', agendamentoController.cancelar);

// deletar agendamento (hard delete)
router.delete('/:id', agendamentoController.deletar);

module.exports = router;
