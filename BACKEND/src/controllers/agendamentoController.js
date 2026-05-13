// controller de agendamentos (processa requisições HTTP)

const agendamentoService = require('../services/agendamentoService');
const Agendamento = require('../models/Agendamento');
const lembreteService = require('../services/lembreteService');

class AgendamentoController {
  // criar novo agendamento
  async criar(req, res) {
    try {
      const { clienteId, usuarioId, espacoId, dataInicio, dataFim, descricao } = req.body;

      const agendamento = new Agendamento(
        null,
        clienteId,
        usuarioId,
        espacoId,
        dataInicio,
        dataFim,
        descricao
      );

      const criado = agendamentoService.criar(agendamento);

      // cria lembretes automaticamente
      // TODO: buscar cliente do banco para criar lembretes
      // lembreteService.criarLembretesAutomaticos(criado, cliente);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Agendamento criado com sucesso',
        agendamento: criado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // obter agendamento por ID
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const agendamento = agendamentoService.obterPorId(parseInt(id));

      if (!agendamento) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Agendamento não encontrado'
        });
      }

      return res.status(200).json({
        sucesso: true,
        agendamento
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar todos os agendamentos
  async listar(req, res) {
    try {
      const agendamentos = agendamentoService.listar();

      return res.status(200).json({
        sucesso: true,
        total: agendamentos.length,
        agendamentos
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar agendamentos de um cliente
  async listarPorCliente(req, res) {
    try {
      const { clienteId } = req.params;
      const agendamentos = agendamentoService.obterPorCliente(parseInt(clienteId));

      return res.status(200).json({
        sucesso: true,
        total: agendamentos.length,
        agendamentos
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar agendamentos de um usuário (profissional)
  async listarPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const agendamentos = agendamentoService.obterPorUsuario(parseInt(usuarioId));

      return res.status(200).json({
        sucesso: true,
        total: agendamentos.length,
        agendamentos
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar agendamentos de um espaço
  async listarPorEspaco(req, res) {
    try {
      const { espacoId } = req.params;
      const agendamentos = agendamentoService.obterPorEspaco(parseInt(espacoId));

      return res.status(200).json({
        sucesso: true,
        total: agendamentos.length,
        agendamentos
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar agendamentos de um dia
  async listarPorData(req, res) {
    try {
      const { data } = req.params;
      const agendamentos = agendamentoService.obterPorData(data);

      return res.status(200).json({
        sucesso: true,
        data,
        total: agendamentos.length,
        agendamentos
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // atualizar agendamento
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const atualizado = agendamentoService.atualizar(parseInt(id), dados);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Agendamento atualizado com sucesso',
        agendamento: atualizado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // confirmar agendamento
  async confirmar(req, res) {
    try {
      const { id } = req.params;

      const confirmado = agendamentoService.confirmar(parseInt(id));

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Agendamento confirmado',
        agendamento: confirmado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // cancelar agendamento
  async cancelar(req, res) {
    try {
      const { id } = req.params;

      const cancelado = agendamentoService.cancelar(parseInt(id));

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Agendamento cancelado',
        agendamento: cancelado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // deletar agendamento
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = agendamentoService.deletar(parseInt(id));

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

  // obter horários disponíveis em um dia para um espaço
  async obterHorariosDisponiveis(req, res) {
    try {
      const { espacoId, data } = req.query;

      if (!espacoId || !data) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'espacoId e data são obrigatórios'
        });
      }

      const horarios = agendamentoService.obterHorariosDisponiveis(
        parseInt(espacoId),
        data
      );

      return res.status(200).json({
        sucesso: true,
        espacoId: parseInt(espacoId),
        data,
        total: horarios.length,
        horarios
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}

module.exports = new AgendamentoController();
