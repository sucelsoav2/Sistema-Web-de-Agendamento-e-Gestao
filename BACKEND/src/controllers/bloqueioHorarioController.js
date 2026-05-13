// controller de bloqueios de horário (processa requisições HTTP)

const agendamentoService = require('../services/agendamentoService');
const BloqueioHorario = require('../models/BloqueioHorario');

class BloqueioHorarioController {
  // criar novo bloqueio
  async criar(req, res) {
    try {
      const { usuarioId, espacoId, dataInicio, dataFim, motivo } = req.body;

      const bloqueio = new BloqueioHorario(
        null,
        usuarioId,
        espacoId,
        dataInicio,
        dataFim,
        motivo
      );

      const criado = agendamentoService.adicionarBloqueio(bloqueio);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Bloqueio criado com sucesso',
        bloqueio: criado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar todos os bloqueios
  async listar(req, res) {
    try {
      const bloqueios = agendamentoService.obterBloqueios();

      return res.status(200).json({
        sucesso: true,
        total: bloqueios.length,
        bloqueios
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // deletar bloqueio
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = agendamentoService.removerBloqueio(parseInt(id));

      return res.status(200).json({
        sucesso: true,
        mensagem: resultado.mensagem
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}

module.exports = new BloqueioHorarioController();
