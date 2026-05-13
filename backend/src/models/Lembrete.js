// modelo de lembrete (notificações enviadas aos clientes)
class Lembrete {
  constructor(
    id,
    agendamentoId,
    clienteId,
    dataEnvio,
    tipo = 'email', // email, sms, notificacao
    enviado = false,
    criadoEm = new Date()
  ) {
    this.id = id;
    this.agendamentoId = agendamentoId;
    this.clienteId = clienteId;
    this.dataEnvio = dataEnvio;
    this.tipo = tipo;
    this.enviado = enviado;
    this.dataEnviadoEm = null;
    this.criadoEm = criadoEm;
  }

  validar() {
    if (!this.agendamentoId) {
      throw new Error('Agendamento é obrigatório');
    }
    if (!this.clienteId) {
      throw new Error('Cliente é obrigatório');
    }
    if (!this.dataEnvio) {
      throw new Error('Data de envio é obrigatória');
    }
    if (!['email', 'sms', 'notificacao'].includes(this.tipo)) {
      throw new Error('Tipo deve ser email, sms ou notificacao');
    }
    return true;
  }

  marcarComoEnviado() {
    this.enviado = true;
    this.dataEnviadoEm = new Date();
  }

  precisaSerEnviado() {
    return !this.enviado && new Date() >= new Date(this.dataEnvio);
  }
}

module.exports = Lembrete;
