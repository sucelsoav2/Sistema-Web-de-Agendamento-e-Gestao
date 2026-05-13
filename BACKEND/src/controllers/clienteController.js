// controller de clientes (processa requisições HTTP)

const clienteService = require('../services/clienteService');
const Cliente = require('../models/Cliente');

class ClienteController {
  // criar novo cliente
  async criar(req, res) {
    try {
      const { nome, email, telefone } = req.body;

      const cliente = new Cliente(null, nome, email, telefone);
      const criado = clienteService.criar(cliente);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Cliente criado com sucesso',
        cliente: criado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // obter cliente por ID
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const cliente = clienteService.obterPorId(parseInt(id));

      if (!cliente) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Cliente não encontrado'
        });
      }

      return res.status(200).json({
        sucesso: true,
        cliente
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // obter cliente por email
  async obterPorEmail(req, res) {
    try {
      const { email } = req.params;
      const cliente = clienteService.obterPorEmail(email);

      if (!cliente) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Cliente não encontrado'
        });
      }

      return res.status(200).json({
        sucesso: true,
        cliente
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar clientes ativos
  async listar(req, res) {
    try {
      const clientes = clienteService.listar();

      return res.status(200).json({
        sucesso: true,
        total: clientes.length,
        clientes
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar todos os clientes (incluindo inativos)
  async listarTodos(req, res) {
    try {
      const clientes = clienteService.listarTodos();

      return res.status(200).json({
        sucesso: true,
        total: clientes.length,
        clientes
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // atualizar cliente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const atualizado = clienteService.atualizar(parseInt(id), dados);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Cliente atualizado com sucesso',
        cliente: atualizado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // deletar cliente (soft delete)
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = clienteService.deletar(parseInt(id));

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

  // ativar cliente
  async ativar(req, res) {
    try {
      const { id } = req.params;

      const ativado = clienteService.ativar(parseInt(id));

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Cliente ativado',
        cliente: ativado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}

module.exports = new ClienteController();
