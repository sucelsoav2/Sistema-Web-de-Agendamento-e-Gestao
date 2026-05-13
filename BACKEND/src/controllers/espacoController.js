// controller de espaços (processa requisições HTTP)

const espacoService = require('../services/espacoService');
const Espaco = require('../models/Espaco');

class EspacoController {
  // criar novo espaço
  async criar(req, res) {
    try {
      const { nome, descricao, capacidade } = req.body;

      const espaco = new Espaco(null, nome, descricao, capacidade);
      const criado = espacoService.criar(espaco);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Espaço criado com sucesso',
        espaco: criado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // obter espaço por ID
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const espaco = espacoService.obterPorId(parseInt(id));

      if (!espaco) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Espaço não encontrado'
        });
      }

      return res.status(200).json({
        sucesso: true,
        espaco
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar espaços ativos
  async listar(req, res) {
    try {
      const espacos = espacoService.listar();

      return res.status(200).json({
        sucesso: true,
        total: espacos.length,
        espacos
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar todos os espaços (incluindo inativos)
  async listarTodos(req, res) {
    try {
      const espacos = espacoService.listarTodos();

      return res.status(200).json({
        sucesso: true,
        total: espacos.length,
        espacos
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // atualizar espaço
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      const atualizado = espacoService.atualizar(parseInt(id), dados);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Espaço atualizado com sucesso',
        espaco: atualizado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // deletar espaço (soft delete)
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = espacoService.deletar(parseInt(id));

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

  // ativar espaço
  async ativar(req, res) {
    try {
      const { id } = req.params;

      const ativado = espacoService.ativar(parseInt(id));

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Espaço ativado',
        espaco: ativado
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}

module.exports = new EspacoController();
