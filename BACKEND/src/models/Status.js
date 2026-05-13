// modelo de status (agendado, confirmado, cancelado, etc)
class Status {
  static AGENDADO = 'agendado';
  static CONFIRMADO = 'confirmado';
  static PENDENTE = 'pendente';
  static CANCELADO = 'cancelado';
  static CONCLUIDO = 'concluido';
  static BLOQUEADO = 'bloqueado';

  static todos() {
    return [
      this.AGENDADO,
      this.CONFIRMADO,
      this.PENDENTE,
      this.CANCELADO,
      this.CONCLUIDO,
      this.BLOQUEADO
    ];
  }

  static validar(status) {
    return this.todos().includes(status);
  }

  static cor(status) {
    const cores = {
      agendado: '#2563EB',      
      confirmado: '#10B981',    
      pendente: '#F59E0B',      
      cancelado: '#EF4444',     
      concluido: '#1F2937',     
      bloqueado: '#9CA3AF'      
    };
    return cores[status] || '#9CA3AF';
  }
}

module.exports = Status;
