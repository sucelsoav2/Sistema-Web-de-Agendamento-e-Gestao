// rotas de usuários

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { apenasAdmin } = require('../middlewares/verificarRole');

// criar novo usuário (admin only)
router.post('/', apenasAdmin, usuarioController.criar);

// listar usuários ativos (admin only)
router.get('/', apenasAdmin, usuarioController.listar);

// listar todos os usuários (incluindo inativos) - admin only
router.get('/todos', apenasAdmin, usuarioController.listarTodos);

// obter usuário específico
router.get('/:id', usuarioController.obterPorId);

// atualizar usuário (admin only)
router.put('/:id', apenasAdmin, usuarioController.atualizar);

// deletar usuário (admin only)
router.delete('/:id', apenasAdmin, usuarioController.deletar);

// ativar usuário (admin only)
router.patch('/:id/ativar', apenasAdmin, usuarioController.ativar);

module.exports = router;
