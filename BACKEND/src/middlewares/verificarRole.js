// middleware para verificar role/permissões do usuário

function verificarRole(rolesPermitidas) {
  return (req, res, next) => {
    // TODO: depois de integrar com banco, obter usuário do token
    // const usuarioId = req.auth.id;
    // const usuario = await usuarioService.obterPorId(usuarioId);

    // por enquanto, simular usuário admin
    const usuarioTipo = 'admin'; // req.usuario.tipo

    if (!rolesPermitidas.includes(usuarioTipo)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Você não tem permissão para acessar este recurso'
      });
    }

    next();
  };
}

// middleware para verificar se é admin
function apenasAdmin(req, res, next) {
  return verificarRole(['admin'])(req, res, next);
}

// middleware para verificar se é admin ou profissional
function apenasAdminOuProfissional(req, res, next) {
  return verificarRole(['admin', 'profissional'])(req, res, next);
}

module.exports = {
  verificarRole,
  apenasAdmin,
  apenasAdminOuProfissional
};
