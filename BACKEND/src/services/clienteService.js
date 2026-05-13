// service de clientes (pessoas que agendarão atendimentos)

class ClienteService {
  // simula banco de dados em memória
  constructor() {
    this.clientes = [];
    this.proximoId = 1;
  }

  criar(cliente) {
    cliente.validar();

    // verifica se email já existe
    const existe = this.clientes.find(c => c.email === cliente.email);
    if (existe) {
      throw new Error('Cliente com este email já existe');
    }

    cliente.id = this.proximoId++;
    this.clientes.push(cliente);
    return cliente;
  }

  obterPorId(id) {
    return this.clientes.find(c => c.id === id);
  }

  obterPorEmail(email) {
    return this.clientes.find(c => c.email === email);
  }

  listar() {
    return this.clientes.filter(c => c.ativo);
  }

  listarTodos() {
    return this.clientes;
  }

  atualizar(id, dados) {
    const cliente = this.obterPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // se mudou email, verifica duplicata
    if (dados.email && dados.email !== cliente.email) {
      const existe = this.clientes.find(c => c.email === dados.email);
      if (existe) {
        throw new Error('Este email já está em uso');
      }
    }

    Object.assign(cliente, dados);
    cliente.atualizadoEm = new Date();

    return cliente;
  }

  deletar(id) {
    // soft delete (marca como inativo)
    const cliente = this.obterPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    cliente.ativo = false;
    cliente.atualizadoEm = new Date();

    return { mensagem: 'Cliente deletado' };
  }

  ativar(id) {
    const cliente = this.obterPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    cliente.ativo = true;
    cliente.atualizadoEm = new Date();

    return cliente;
  }
}

module.exports = new ClienteService();
