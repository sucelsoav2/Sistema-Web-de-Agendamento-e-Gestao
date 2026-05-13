// rotas de bloqueios de horário

const express = require('express');
const router = express.Router();
const bloqueioHorarioController = require('../controllers/bloqueioHorarioController');
const { apenasAdminOuProfissional } = require('../middlewares/verificarRole');

// criar novo bloqueio
router.post('/', apenasAdminOuProfissional, bloqueioHorarioController.criar);

// listar todos os bloqueios
router.get('/', bloqueioHorarioController.listar);

// deletar bloqueio
router.delete('/:id', apenasAdminOuProfissional, bloqueioHorarioController.deletar);

module.exports = router;
