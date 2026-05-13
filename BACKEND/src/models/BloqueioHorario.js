// modelo de bloqueio de horário (períodos indisponíveis)
class BloqueioHorario {
  constructor(
    id,
    usuarioId,
    espacoId,
    dataInicio,
    dataFim,
    motivo = 'Indisponível',
    criadoEm = new Date()
  ) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.espacoId = espacoId;
    this.dataInicio = dataInicio;
    this.dataFim = dataFim;
    this.motivo = motivo; // férias, reunião, manutenção, etc
    this.criadoEm = criadoEm;
    this.atualizadoEm = new Date();
  }

  validar() {
    if (!this.usuarioId) {
      throw new Error('Usuário é obrigatório');
    }
    if (!this.espacoId) {
      throw new Error('Espaço é obrigatório');
    }
    if (!this.dataInicio || !this.dataFim) {
      throw new Error('Datas são obrigatórias');
    }

    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);

    if (inicio >= fim) {
      throw new Error('Data de início deve ser antes da data de fim');
    }

    return true;
  }

  estaBloqueadoNoPeriodo(dataInicio, dataFim) {
    const bloqueioInicio = new Date(this.dataInicio);
    const bloqueioFim = new Date(this.dataFim);
    const periodoInicio = new Date(dataInicio);
    const periodoFim = new Date(dataFim);

    // verifica se há sobreposição entre o período e o bloqueio
    return bloqueioInicio < periodoFim && bloqueioFim > periodoInicio;
  }
}

module.exports = BloqueioHorario;
