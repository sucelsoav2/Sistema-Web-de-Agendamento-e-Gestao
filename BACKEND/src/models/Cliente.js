// modelo de cliente (pessoa que agenda atendimento)
class Cliente {
  constructor(id, nome, email, telefone, ativo = true, criadoEm = new Date()) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.ativo = ativo;
    this.criadoEm = criadoEm;
    this.atualizadoEm = new Date();
  }

  validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('Nome é obrigatório');
    }
    if (!this.email || this.email.trim() === '') {
      throw new Error('Email é obrigatório');
    }
    if (!this.telefone || this.telefone.trim() === '') {
      throw new Error('Telefone é obrigatório');
    }
    return true;
  }
}

module.exports = Cliente;
