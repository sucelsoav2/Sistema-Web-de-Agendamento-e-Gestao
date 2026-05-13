// service de lembretes (notificações para clientes)

class LembreteService {
  // simula banco de dados em memória
  constructor() {
    this.lembretes = [];
    this.proximoId = 1;
  }

  criar(lembrete) {
    lembrete.validar();
    lembrete.id = this.proximoId++;
    this.lembretes.push(lembrete);
    return lembrete;
  }

  obterPorId(id) {
    return this.lembretes.find(l => l.id === id);
  }

  obterPorAgendamento(agendamentoId) {
    return this.lembretes.filter(l => l.agendamentoId === agendamentoId);
  }

  obterPorCliente(clienteId) {
    return this.lembretes.filter(l => l.clienteId === clienteId);
  }

  obterNaoEnviados() {
    return this.lembretes.filter(l => !l.enviado);
  }

  obterPendentes() {
    // lembretes que precisam ser enviados agora
    return this.lembretes.filter(l => l.precisaSerEnviado());
  }

  listar() {
    return this.lembretes;
  }

  marcarComoEnviado(id) {
    const lembrete = this.obterPorId(id);
    if (!lembrete) {
      throw new Error('Lembrete não encontrado');
    }

    lembrete.marcarComoEnviado();
    return lembrete;
  }

  deletar(id) {
    const index = this.lembretes.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lembrete não encontrado');
    }

    this.lembretes.splice(index, 1);
    return { mensagem: 'Lembrete deletado' };
  }

  // cria lembretes automaticamente para um agendamento
  criarLembretesAutomaticos(agendamento, cliente) {
    const lembretes = [];

    // lembrete 24h antes
    const data24h = new Date(agendamento.dataInicio);
    data24h.setHours(data24h.getHours() - 24);

    const Lembrete = require('../models/Lembrete');

    const lembrete24h = new Lembrete(
      null,
      agendamento.id,
      cliente.id,
      data24h,
      'email'
    );
    lembretes.push(this.criar(lembrete24h));

    // lembrete 2h antes
    const data2h = new Date(agendamento.dataInicio);
    data2h.setHours(data2h.getHours() - 2);

    const lembrete2h = new Lembrete(
      null,
      agendamento.id,
      cliente.id,
      data2h,
      'email'
    );
    lembretes.push(this.criar(lembrete2h));

    return lembretes;
  }

  // processa lembretes pendentes (implementar envio depois)
  processarLembretesPendentes() {
    const pendentes = this.obterPendentes();

    pendentes.forEach(lembrete => {
      // aqui depois adicionar lógica de envio (email, sms, etc)
      console.log(`enviando lembrete ${lembrete.id} por ${lembrete.tipo}`);
      
      // por enquanto apenas marca como enviado
      this.marcarComoEnviado(lembrete.id);
    });

    return { enviados: pendentes.length };
  }
}

module.exports = new LembreteService();
