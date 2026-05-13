const Status = require('./Status');

// modelo de agendamento (compromisso marcado)
class Agendamento {
  constructor(
    id,
    clienteId,
    usuarioId,
    espacoId,
    dataInicio,
    dataFim,
    descricao = '',
    status = Status.AGENDADO,
    criadoEm = new Date()
  ) {
    this.id = id;
    this.clienteId = clienteId;
    this.usuarioId = usuarioId;
    this.espacoId = espacoId;
    this.dataInicio = dataInicio; // ISO string ou Date
    this.dataFim = dataFim; // ISO string ou Date
    this.descricao = descricao;
    this.status = status;
    this.criadoEm = criadoEm;
    this.atualizadoEm = new Date();
  }

  validar() {
    if (!this.clienteId) {
      throw new Error('Cliente é obrigatório');
    }
    if (!this.usuarioId) {
      throw new Error('Usuário é obrigatório');
    }
    if (!this.espacoId) {
      throw new Error('Espaço é obrigatório');
    }
    if (!this.dataInicio || !this.dataFim) {
      throw new Error('Data de início e fim são obrigatórias');
    }

    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);

    if (inicio >= fim) {
      throw new Error('Data de início deve ser antes da data de fim');
    }

    if (!Status.validar(this.status)) {
      throw new Error('Status inválido');
    }

    return true;
  }

  podeSerCancelado() {
    return this.status !== Status.CONCLUIDO && this.status !== Status.CANCELADO;
  }

  podeSerConfirmado() {
    return this.status === Status.AGENDADO || this.status === Status.PENDENTE;
  }

  getTempoRestante() {
    const agora = new Date();
    const inicio = new Date(this.dataInicio);
    return Math.floor((inicio - agora) / 1000 / 60); // em minutos
  }

  estaProximo(minutos = 24 * 60) {
    return this.getTempoRestante() <= minutos && this.getTempoRestante() > 0;
  }
}

module.exports = Agendamento;
