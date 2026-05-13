// middleware para validação e sanitização de entrada

function validarEntrada(req, res, next) {
  // sanitiza strings (remove espaços extras)
  const sanitizarObjeto = (obj) => {
    for (let chave in obj) {
      if (typeof obj[chave] === 'string') {
        obj[chave] = obj[chave].trim();
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    sanitizarObjeto(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    sanitizarObjeto(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    sanitizarObjeto(req.params);
  }

  next();
}

module.exports = validarEntrada;
