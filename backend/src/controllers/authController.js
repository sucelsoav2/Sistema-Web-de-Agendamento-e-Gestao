// autenticação do sistema. valida usuário/login

const authService = require("../services/authService");

class AuthController {
  // criar novo usuário
  async registrar(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;

      // validações básicas
      if (!nome || !email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome, email e senha são obrigatórios",
        });
      }

      // valida formato do email
      if (!authService.validarEmail(email)) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Email inválido",
        });
      }

      // valida força da senha
      const validacaoSenha = authService.validarSenha(senha);
      if (!validacaoSenha.valido) {
        return res.status(400).json({
          sucesso: false,
          mensagem: validacaoSenha.mensagem,
        });
      }

      // verifica se email já existe
      const emailExiste = await authService.validarEmailExistente(email);
      if (emailExiste) {
        return res.status(409).json({
          sucesso: false,
          mensagem: "Email já cadastrado",
        });
      }

      // criptografa a senha
      const senhaCriptografada = await authService.criptografarSenha(senha);

      // salvar usuário no banco de dados
      // const novoUsuario = await Usuario.create({
      //   nome,
      //   email,
      //   senha: senhaCriptografada,
      //   tipo: tipo || 'cliente'
      // });

      // gera token JWT
      const token = authService.gerarToken(1, email); // ID será do banco depois

      return res.status(201).json({
        sucesso: true,
        mensagem: "Usuário registrado com sucesso",
        token: token,
        usuario: {
          nome,
          email,
          tipo: tipo || "cliente",
        },
      });
    } catch (erro) {
      console.error("Erro ao registrar:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  }

  // autenticar usuário
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // validações básicas
      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Email e senha são obrigatórios",
        });
      }

      // buscar usuário no banco de dados
      // const usuario = await Usuario.findOne({ email });
      // if (!usuario) {
      //   return res.status(401).json({
      //     sucesso: false,
      //     mensagem: 'Usuário ou senha inválidos'
      //   });
      // }

      // comparar senha
      // const senhaValida = await authService.compararSenha(senha, usuario.senha);
      // if (!senhaValida) {
      //   return res.status(401).json({
      //     sucesso: false,
      //     mensagem: 'Usuário ou senha inválidos'
      //   });
      // }

      // gera token JWT
      const token = authService.gerarToken(1, email); // ID será do banco depois

      return res.status(200).json({
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        token: token,
        usuario: {
          email,
          tipo: "admin", // Vem do banco depois
        },
      });
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  }

  // obter dados do usuário autenticado
  // token vem automaticamente decodificado em req.auth
  async obterPerfil(req, res) {
    try {
      // os dados do usuário estão em req.auth
      const usuarioToken = req.auth;

      return res.status(200).json({
        sucesso: true,
        mensagem: "Perfil obtido com sucesso",
        usuario: {
          id: usuarioToken.id,
          email: usuarioToken.email,
          // buscar mais dados do banco de dados
        },
      });
    } catch (erro) {
      console.error("Erro ao obter perfil:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  }

  // fazer logout
  async logout(req, res) {
    try {
      const usuarioToken = req.auth;

      return res.status(200).json({
        sucesso: true,
        mensagem: "Logout realizado com sucesso",
      });
    } catch (erro) {
      console.error("Erro ao fazer logout:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  }

  // atualizar dados do usuário
  async atualizarPerfil(req, res) {
    try {
      const { nome, telefone } = req.body;
      const usuarioToken = req.auth;

      // validações básicas
      if (!nome && !telefone) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Forneça ao menos um campo para atualizar",
        });
      }

      // atualizar usuário no banco de dados
      // const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      //   usuarioToken.id,
      //   { nome, telefone },
      //   { new: true }
      // );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Perfil atualizado com sucesso",
        usuario: {
          id: usuarioToken.id,
          email: usuarioToken.email,
          nome,
          telefone,
        },
      });
    } catch (erro) {
      console.error("Erro ao atualizar perfil:", erro);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  }
}

module.exports = new AuthController();
