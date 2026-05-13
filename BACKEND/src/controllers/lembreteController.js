// controller de lembretes (processa requisições HTTP)

const lembreteService = require('../services/lembreteService');
const Lembrete = require('../models/Lembrete');

class LembreteController {
  // criar novo lembrete
  async criar(req, res) {
    try {
      const { agendamentoId, clienteId, dataEnvio, tipo } = req.body;

      const lembrete = new Lembrete(null, agendamentoId, clienteId, dataEnvio, tipo);
      const criado = lembreteService.criar(lembrete);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Lembrete criado com sucesso',
        lembrete: criado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // obter lembrete por ID
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const lembrete = lembreteService.obterPorId(parseInt(id));

      if (!lembrete) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Lembrete não encontrado'
        });
      }

      return res.status(200).json({
        sucesso: true,
        lembrete
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar lembretes de um agendamento
  async listarPorAgendamento(req, res) {
    try {
      const { agendamentoId } = req.params;
      const lembretes = lembreteService.obterPorAgendamento(parseInt(agendamentoId));

      return res.status(200).json({
        sucesso: true,
        total: lembretes.length,
        lembretes
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar lembretes de um cliente
  async listarPorCliente(req, res) {
    try {
      const { clienteId } = req.params;
      const lembretes = lembreteService.obterPorCliente(parseInt(clienteId));

      return res.status(200).json({
        sucesso: true,
        total: lembretes.length,
        lembretes
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar todos os lembretes
  async listar(req, res) {
    try {
      const lembretes = lembreteService.listar();

      return res.status(200).json({
        sucesso: true,
        total: lembretes.length,
        lembretes
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar lembretes não enviados
  async listarNaoEnviados(req, res) {
    try {
      const lembretes = lembreteService.obterNaoEnviados();

      return res.status(200).json({
        sucesso: true,
        total: lembretes.length,
        lembretes
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar lembretes pendentes (que precisam ser enviados agora)
  async listarPendentes(req, res) {
    try {
      const lembretes = lembreteService.obterPendentes();

      return res.status(200).json({
        sucesso: true,
        total: lembretes.length,
        lembretes
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // marcar lembrete como enviado
  async marcarComoEnviado(req, res) {
    try {
      const { id } = req.params;

      const lembrete = lembreteService.marcarComoEnviado(parseInt(id));

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Lembrete marcado como enviado',
        lembrete
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // deletar lembrete
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = lembreteService.deletar(parseInt(id));

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

  // processar lembretes pendentes (enviar agora)
  async processarPendentes(req, res) {
    try {
      const resultado = lembreteService.processarLembretesPendentes();

      return res.status(200).json({
        sucesso: true,
        mensagem: `${resultado.enviados} lembretes processados`,
        resultado
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}

module.exports = new LembreteController();
