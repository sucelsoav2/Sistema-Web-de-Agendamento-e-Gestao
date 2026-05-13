// controller de usuários (processa requisições HTTP)

const usuarioService = require('../services/usuarioService');
const Usuario = require('../models/Usuario');

class UsuarioController {
  // criar novo usuário (admin only)
  async criar(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;

      // TODO: verificar se usuário autenticado é admin

      const usuario = new Usuario(null, nome, email, senha, tipo);
      const criado = usuarioService.criar(usuario);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário criado com sucesso',
        usuario: {
          id: criado.id,
          nome: criado.nome,
          email: criado.email,
          tipo: criado.tipo
        }
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // obter usuário por ID
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = usuarioService.obterPorId(parseInt(id));

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      return res.status(200).json({
        sucesso: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          ativo: usuario.ativo
        }
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar usuários ativos
  async listar(req, res) {
    try {
      const usuarios = usuarioService.listar();

      return res.status(200).json({
        sucesso: true,
        total: usuarios.length,
        usuarios: usuarios.map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          tipo: u.tipo
        }))
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // listar todos os usuários (incluindo inativos)
  async listarTodos(req, res) {
    try {
      const usuarios = usuarioService.listarTodos();

      return res.status(200).json({
        sucesso: true,
        total: usuarios.length,
        usuarios: usuarios.map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          tipo: u.tipo,
          ativo: u.ativo
        }))
      });
    } catch (erro) {
      return res.status(500).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // atualizar usuário
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      // impede alteração de senha por aqui (fazer por rota específica)
      delete dados.senha;

      const atualizado = usuarioService.atualizar(parseInt(id), dados);

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Usuário atualizado com sucesso',
        usuario: {
          id: atualizado.id,
          nome: atualizado.nome,
          email: atualizado.email,
          tipo: atualizado.tipo
        }
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  // deletar usuário (soft delete)
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const resultado = usuarioService.deletar(parseInt(id));

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

  // ativar usuário
  async ativar(req, res) {
    try {
      const { id } = req.params;

      const ativado = usuarioService.ativar(parseInt(id));

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Usuário ativado',
        usuario: {
          id: ativado.id,
          nome: ativado.nome,
          email: ativado.email,
          tipo: ativado.tipo
        }
      });
    } catch (erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}

module.exports = new UsuarioController();
