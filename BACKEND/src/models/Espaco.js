// modelo de espaço (sala, consultório, laboratório, etc)
class Espaco {
  constructor(id, nome, descricao, capacidade, ativo = true, criadoEm = new Date()) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.capacidade = capacidade; // quantas pessoas cabem
    this.ativo = ativo;
    this.criadoEm = criadoEm;
    this.atualizadoEm = new Date();
  }

  validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('Nome é obrigatório');
    }
    if (this.capacidade <= 0) {
      throw new Error('Capacidade deve ser maior que 0');
    }
    return true;
  }
}

module.exports = Espaco;
