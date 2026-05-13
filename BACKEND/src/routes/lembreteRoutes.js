// rotas de lembretes

const express = require('express');
const router = express.Router();
const lembreteController = require('../controllers/lembreteController');
const { apenasAdminOuProfissional } = require('../middlewares/verificarRole');

// criar novo lembrete
router.post('/', lembreteController.criar);

// listar todos os lembretes
router.get('/', apenasAdminOuProfissional, lembreteController.listar);

// listar lembretes não enviados
router.get('/nao-enviados', apenasAdminOuProfissional, lembreteController.listarNaoEnviados);

// listar lembretes pendentes (que devem ser enviados agora)
router.get('/pendentes', apenasAdminOuProfissional, lembreteController.listarPendentes);

// listar lembretes de um agendamento
router.get('/agendamento/:agendamentoId', lembreteController.listarPorAgendamento);

// listar lembretes de um cliente
router.get('/cliente/:clienteId', lembreteController.listarPorCliente);

// obter lembrete específico
router.get('/:id', lembreteController.obterPorId);

// marcar lembrete como enviado
router.patch('/:id/enviado', lembreteController.marcarComoEnviado);

// processar lembretes pendentes (enviar agora)
router.post('/processar/pendentes', apenasAdminOuProfissional, lembreteController.processarPendentes);

// deletar lembrete
router.delete('/:id', lembreteController.deletar);

module.exports = router;
