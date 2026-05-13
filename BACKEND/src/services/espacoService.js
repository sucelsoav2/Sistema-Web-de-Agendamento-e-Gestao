// service de espaços (gestão de salas, consultórios, etc)

class EspacoService {
  // simula banco de dados em memória
  constructor() {
    this.espacos = [];
    this.proximoId = 1;
  }

  criar(espaco) {
    espaco.validar();
    espaco.id = this.proximoId++;
    this.espacos.push(espaco);
    return espaco;
  }

  obterPorId(id) {
    return this.espacos.find(e => e.id === id);
  }

  listar() {
    return this.espacos.filter(e => e.ativo);
  }

  listarTodos() {
    return this.espacos;
  }

  atualizar(id, dados) {
    const espaco = this.obterPorId(id);
    if (!espaco) {
      throw new Error('Espaço não encontrado');
    }

    Object.assign(espaco, dados);
    espaco.atualizadoEm = new Date();

    return espaco;
  }

  deletar(id) {
    // soft delete (apenas marca como inativo)
    const espaco = this.obterPorId(id);
    if (!espaco) {
      throw new Error('Espaço não encontrado');
    }

    espaco.ativo = false;
    espaco.atualizadoEm = new Date();

    return { mensagem: 'Espaço deletado' };
  }

  ativar(id) {
    const espaco = this.obterPorId(id);
    if (!espaco) {
      throw new Error('Espaço não encontrado');
    }

    espaco.ativo = true;
    espaco.atualizadoEm = new Date();

    return espaco;
  }
}

module.exports = new EspacoService();
