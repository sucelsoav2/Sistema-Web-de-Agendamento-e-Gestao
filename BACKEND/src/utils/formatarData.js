// utilitários para formatação de datas e horários

function formatarData(data) {
  if (!data) return '';

  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(data) {
  if (!data) return '';

  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();
  const horas = String(dataObj.getHours()).padStart(2, '0');
  const minutos = String(dataObj.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function formatarHora(data) {
  if (!data) return '';

  const dataObj = new Date(data);
  const horas = String(dataObj.getHours()).padStart(2, '0');
  const minutos = String(dataObj.getMinutes()).padStart(2, '0');

  return `${horas}:${minutos}`;
}

function obterDiaDaSemana(data) {
  const diasDaSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const dataObj = new Date(data);
  return diasDaSemana[dataObj.getDay()];
}

function obterNomeMes(mes) {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return meses[mes - 1] || '';
}

function ehDataPassada(data) {
  const agora = new Date();
  const dataObj = new Date(data);
  return dataObj < agora;
}

function ehHoje(data) {
  const agora = new Date();
  const dataObj = new Date(data);

  return (
    dataObj.getDate() === agora.getDate() &&
    dataObj.getMonth() === agora.getMonth() &&
    dataObj.getFullYear() === agora.getFullYear()
  );
}

function diferenciaEmHoras(dataInicio, dataFim) {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diferenca = fim - inicio;
  return Math.floor(diferenca / (1000 * 60 * 60)); // converte para horas
}

function diferenciaEmMinutos(dataInicio, dataFim) {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diferenca = fim - inicio;
  return Math.floor(diferenca / (1000 * 60)); // converte para minutos
}

function adicionarHoras(data, horas) {
  const resultado = new Date(data);
  resultado.setHours(resultado.getHours() + horas);
  return resultado;
}

function adicionarDias(data, dias) {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

function adicionarMinutos(data, minutos) {
  const resultado = new Date(data);
  resultado.setMinutes(resultado.getMinutes() + minutos);
  return resultado;
}

function obterInicioDoMes(data) {
  const dataObj = new Date(data);
  return new Date(dataObj.getFullYear(), dataObj.getMonth(), 1);
}

function obterFimDoMes(data) {
  const dataObj = new Date(data);
  return new Date(dataObj.getFullYear(), dataObj.getMonth() + 1, 0);
}

module.exports = {
  formatarData,
  formatarDataHora,
  formatarHora,
  obterDiaDaSemana,
  obterNomeMes,
  ehDataPassada,
  ehHoje,
  diferenciaEmHoras,
  diferenciaEmMinutos,
  adicionarHoras,
  adicionarDias,
  adicionarMinutos,
  obterInicioDoMes,
  obterFimDoMes
};
