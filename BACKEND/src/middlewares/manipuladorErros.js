// middleware para tratamento de erros global

function manipuladorErrosGlobal(erro, req, res, next) {
  console.error('erro:', erro.message);
  console.error('stack:', erro.stack);

  // erro de validação
  if (erro.message && erro.message.includes('validação')) {
    return res.status(400).json({
      sucesso: false,
      mensagem: erro.message,
      tipo: 'validacao'
    });
  }

  // erro de conflito (não encontrado, já existe, etc)
  if (erro.message && erro.message.includes('não encontrado')) {
    return res.status(404).json({
      sucesso: false,
      mensagem: erro.message,
      tipo: 'nao_encontrado'
    });
  }

  // erro de não autorizado
  if (erro.status === 401) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Não autorizado',
      tipo: 'nao_autorizado'
    });
  }

  // erro de proibido
  if (erro.status === 403) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso proibido',
      tipo: 'proibido'
    });
  }

  // erro genérico do servidor
  return res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'development' ? erro.message : 'erro desconhecido'
  });
}

module.exports = manipuladorErrosGlobal;
