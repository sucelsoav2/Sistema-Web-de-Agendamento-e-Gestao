// rotas de clientes

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { apenasAdmin, apenasAdminOuProfissional } = require('../middlewares/verificarRole');

// criar novo cliente
router.post('/', clienteController.criar);

// listar clientes ativos
router.get('/', apenasAdminOuProfissional, clienteController.listar);

// listar todos os clientes (incluindo inativos) - admin only
router.get('/todos', apenasAdmin, clienteController.listarTodos);

// obter cliente por email
router.get('/email/:email', clienteController.obterPorEmail);

// obter cliente específico
router.get('/:id', clienteController.obterPorId);

// atualizar cliente
router.put('/:id', clienteController.atualizar);

// deletar cliente (admin only)
router.delete('/:id', apenasAdmin, clienteController.deletar);

// ativar cliente (admin only)
router.patch('/:id/ativar', apenasAdmin, clienteController.ativar);

module.exports = router;
