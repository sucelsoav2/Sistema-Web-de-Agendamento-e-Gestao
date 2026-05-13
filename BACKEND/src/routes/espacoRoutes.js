// rotas de espaços

const express = require('express');
const router = express.Router();
const espacoController = require('../controllers/espacoController');
const { apenasAdmin } = require('../middlewares/verificarRole');

// criar novo espaço (admin only)
router.post('/', apenasAdmin, espacoController.criar);

// listar espaços ativos
router.get('/', espacoController.listar);

// listar todos os espaços (incluindo inativos) - admin only
router.get('/todos', apenasAdmin, espacoController.listarTodos);

// obter espaço específico
router.get('/:id', espacoController.obterPorId);

// atualizar espaço (admin only)
router.put('/:id', apenasAdmin, espacoController.atualizar);

// deletar espaço (admin only)
router.delete('/:id', apenasAdmin, espacoController.deletar);

// ativar espaço (admin only)
router.patch('/:id/ativar', apenasAdmin, espacoController.ativar);

module.exports = router;
