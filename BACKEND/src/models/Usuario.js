// modelo de usuário (admin/profissional)
class Usuario {
  constructor(id, nome, email, senha, tipo, ativo = true, criadoEm = new Date()) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha; // será criptografada antes de salvar no BD
    this.tipo = tipo; // 'admin' ou 'profissional'
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
    if (!this.tipo || !['admin', 'profissional'].includes(this.tipo)) {
      throw new Error('Tipo deve ser admin ou profissional');
    }
    return true;
  }
}

module.exports = Usuario;
