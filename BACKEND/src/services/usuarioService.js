// service de usuários (admins/profissionais do sistema)

class UsuarioService {
  // simula banco de dados em memória
  constructor() {
    this.usuarios = [];
    this.proximoId = 1;
  }

  criar(usuario) {
    usuario.validar();

    // verifica se email já existe
    const existe = this.usuarios.find(u => u.email === usuario.email);
    if (existe) {
      throw new Error('Usuário com este email já existe');
    }

    usuario.id = this.proximoId++;
    this.usuarios.push(usuario);
    return usuario;
  }

  obterPorId(id) {
    return this.usuarios.find(u => u.id === id);
  }

  obterPorEmail(email) {
    return this.usuarios.find(u => u.email === email);
  }

  listar() {
    return this.usuarios.filter(u => u.ativo);
  }

  listarTodos() {
    return this.usuarios;
  }

  atualizar(id, dados) {
    const usuario = this.obterPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // se mudou email, verifica duplicata
    if (dados.email && dados.email !== usuario.email) {
      const existe = this.usuarios.find(u => u.email === dados.email);
      if (existe) {
        throw new Error('Este email já está em uso');
      }
    }

    // não permite mudar tipo diretamente (seria feito por admin)
    if (dados.tipo && dados.tipo !== usuario.tipo) {
      throw new Error('Tipo de usuário não pode ser alterado');
    }

    Object.assign(usuario, dados);
    usuario.atualizadoEm = new Date();

    return usuario;
  }

  deletar(id) {
    // soft delete (marca como inativo)
    const usuario = this.obterPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    usuario.ativo = false;
    usuario.atualizadoEm = new Date();

    return { mensagem: 'Usuário deletado' };
  }

  ativar(id) {
    const usuario = this.obterPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    usuario.ativo = true;
    usuario.atualizadoEm = new Date();

    return usuario;
  }

  ehAdmin(id) {
    const usuario = this.obterPorId(id);
    return usuario && usuario.tipo === 'admin';
  }

  ehProfissional(id) {
    const usuario = this.obterPorId(id);
    return usuario && usuario.tipo === 'profissional';
  }
}

module.exports = new UsuarioService();
