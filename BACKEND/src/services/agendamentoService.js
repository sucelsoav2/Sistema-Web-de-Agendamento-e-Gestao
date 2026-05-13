// service de agendamentos (validações, conflitos, disponibilidade)

class AgendamentoService {
  // simula banco de dados em memória (será substituído pelo supabase)
  constructor() {
    this.agendamentos = [];
    this.bloqueios = [];
    this.proximoId = 1;
  }

  criar(agendamento) {
    // valida o agendamento
    agendamento.validar();

    // verifica conflitos
    this.verificarConflitos(agendamento);

    // verifica se está bloqueado
    this.verificarBloqueios(agendamento);

    // atribui ID e salva
    agendamento.id = this.proximoId++;
    this.agendamentos.push(agendamento);

    return agendamento;
  }

  obterPorId(id) {
    return this.agendamentos.find(a => a.id === id);
  }

  obterPorCliente(clienteId) {
    return this.agendamentos.filter(a => a.clienteId === clienteId);
  }

  obterPorUsuario(usuarioId) {
    return this.agendamentos.filter(a => a.usuarioId === usuarioId);
  }

  obterPorEspaco(espacoId) {
    return this.agendamentos.filter(a => a.espacoId === espacoId);
  }

  obterPorData(data) {
    const dataString = new Date(data).toISOString().split('T')[0];
    return this.agendamentos.filter(a => {
      const agendDataString = new Date(a.dataInicio).toISOString().split('T')[0];
      return agendDataString === dataString;
    });
  }

  listar() {
    return this.agendamentos;
  }

  atualizar(id, dados) {
    const agendamento = this.obterPorId(id);
    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    // se mudou horário ou espaço, verifica conflitos novamente
    if (dados.dataInicio || dados.dataFim || dados.espacoId) {
      const temp = { ...agendamento, ...dados };
      this.verificarConflitos(temp, id);
      this.verificarBloqueios(temp);
    }

    Object.assign(agendamento, dados);
    agendamento.atualizadoEm = new Date();

    return agendamento;
  }

  cancelar(id) {
    const agendamento = this.obterPorId(id);
    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    if (!agendamento.podeSerCancelado()) {
      throw new Error('Este agendamento não pode ser cancelado');
    }

    agendamento.status = 'cancelado';
    agendamento.atualizadoEm = new Date();

    return agendamento;
  }

  confirmar(id) {
    const agendamento = this.obterPorId(id);
    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    if (!agendamento.podeSerConfirmado()) {
      throw new Error('Este agendamento não pode ser confirmado');
    }

    agendamento.status = 'confirmado';
    agendamento.atualizadoEm = new Date();

    return agendamento;
  }

  deletar(id) {
    const index = this.agendamentos.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }

    this.agendamentos.splice(index, 1);
    return { mensagem: 'Agendamento deletado' };
  }

  // verifica se já existe agendamento no mesmo horário e espaço
  verificarConflitos(agendamento, idExcluir = null) {
    const conflito = this.agendamentos.find(a => {
      if (idExcluir && a.id === idExcluir) return false; // ignora ele mesmo

      // verifica se é no mesmo espaço
      if (a.espacoId !== agendamento.espacoId) return false;

      // verifica se os horários se sobrepõem
      const inicio1 = new Date(a.dataInicio);
      const fim1 = new Date(a.dataFim);
      const inicio2 = new Date(agendamento.dataInicio);
      const fim2 = new Date(agendamento.dataFim);

      // há sobreposição se inicio1 < fim2 AND fim1 > inicio2
      return inicio1 < fim2 && fim1 > inicio2;
    });

    if (conflito) {
      throw new Error('Já existe agendamento neste horário neste espaço');
    }
  }

  // verifica se o período está bloqueado
  verificarBloqueios(agendamento) {
    const bloqueio = this.bloqueios.find(b => {
      if (b.espacoId !== agendamento.espacoId) return false;
      return b.estaBloqueadoNoPeriodo(agendamento.dataInicio, agendamento.dataFim);
    });

    if (bloqueio) {
      throw new Error(`Período bloqueado: ${bloqueio.motivo}`);
    }
  }

  // obtém horários disponíveis em um dia para um espaço
  obterHorariosDisponiveis(espacoId, data, intervaloMinutos = 60) {
    const horarioAbertura = 8; // 8h
    const horarioFechamento = 18; // 18h
    const horariosDisponiveis = [];

    const dataObj = new Date(data);
    dataObj.setHours(horarioAbertura, 0, 0, 0);

    while (dataObj.getHours() < horarioFechamento) {
      const dataInicio = new Date(dataObj);
      const dataFim = new Date(dataObj.getTime() + intervaloMinutos * 60000);

      // verifica se está disponível
      let disponivel = true;

      // verifica agendamentos
      const temAgendamento = this.agendamentos.some(a => {
        if (a.espacoId !== espacoId) return false;
        const aInicio = new Date(a.dataInicio);
        const aFim = new Date(a.dataFim);
        return aInicio < dataFim && aFim > dataInicio;
      });

      // verifica bloqueios
      const temBloqueio = this.bloqueios.some(b => {
        if (b.espacoId !== espacoId) return false;
        return b.estaBloqueadoNoPeriodo(dataInicio, dataFim);
      });

      if (!temAgendamento && !temBloqueio) {
        horariosDisponiveis.push({
          inicio: dataInicio.toISOString(),
          fim: dataFim.toISOString()
        });
      }

      dataObj.setMinutes(dataObj.getMinutes() + intervaloMinutos);
    }

    return horariosDisponiveis;
  }

  // adiciona um bloqueio (para usar na validação)
  adicionarBloqueio(bloqueio) {
    bloqueio.validar();
    bloqueio.id = this.proximoId++;
    this.bloqueios.push(bloqueio);
    return bloqueio;
  }

  obterBloqueios() {
    return this.bloqueios;
  }

  removerBloqueio(id) {
    const index = this.bloqueios.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Bloqueio não encontrado');
    }
    this.bloqueios.splice(index, 1);
    return { mensagem: 'Bloqueio removido' };
  }
}

module.exports = new AgendamentoService();
