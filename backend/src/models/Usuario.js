// modelo de usuário
class Usuario {
  constructor(id, nome, email, senha, roleId = 1, ativo = true, criadoEm = new Date()) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha; // será criptografada antes de salvar no BD
    this.role_id = roleId; // 1=cliente, 2=profissional, 3=admin
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
    if (![1, 2, 3].includes(Number(this.role_id))) {
      throw new Error('Role deve ser cliente, profissional ou admin');
    }
    return true;
  }
}

module.exports = Usuario;
