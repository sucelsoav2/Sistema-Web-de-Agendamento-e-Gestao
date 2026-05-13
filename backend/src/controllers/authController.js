const authService = require("../services/authService");
const supabase = require("../config/database");

class AuthController {
  async registrar(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ sucesso: false, mensagem: "Nome, email e senha são obrigatórios" });
      }

      if (!authService.validarEmail(email)) {
        return res.status(400).json({ sucesso: false, mensagem: "Email inválido" });
      }

      const validacaoSenha = authService.validarSenha(senha);
      if (!validacaoSenha.valido) {
        return res.status(400).json({ sucesso: false, mensagem: validacaoSenha.mensagem });
      }

      // Verifica se o email já existe no Supabase
      const { data: usuarioExistente, error: errExistente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();

      if (usuarioExistente) {
        return res.status(409).json({ sucesso: false, mensagem: "Email já cadastrado" });
      }

      const senhaCriptografada = await authService.criptografarSenha(senha);

      // Inserir novo usuário no Supabase
      const { data: novoUsuario, error: erroInsert } = await supabase
        .from('usuarios')
        .insert([{ 
          nome, 
          email, 
          senha_hash: senhaCriptografada, 
          tipo: tipo || 'profissional' 
        }])
        .select()
        .single();

      if (erroInsert) {
        throw erroInsert;
      }

      // Cria a configuração padrão de agenda para este novo profissional
      if (novoUsuario.tipo === 'profissional') {
          await supabase.from('configuracoes_agenda').insert([{ usuario_id: novoUsuario.id }]);
      }

      const token = authService.gerarToken(novoUsuario.id, email);

      return res.status(201).json({
        sucesso: true,
        mensagem: "Usuário registrado com sucesso",
        token: token,
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          tipo: novoUsuario.tipo,
        },
      });
    } catch (erro) {
      console.error("Erro ao registrar:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ sucesso: false, mensagem: "Email e senha são obrigatórios" });
      }

      // Buscar usuário no Supabase
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !usuario) {
        return res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos' });
      }

      // Comparar senha
      const senhaValida = await authService.compararSenha(senha, usuario.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos' });
      }

      const token = authService.gerarToken(usuario.id, email);

      return res.status(200).json({
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        token: token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
        },
      });
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async obterPerfil(req, res) {
    try {
      const usuarioToken = req.auth;

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, telefone, tipo')
        .eq('id', usuarioToken.id)
        .single();

      if (error || !usuario) {
          return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado" });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: "Perfil obtido com sucesso",
        usuario,
      });
    } catch (erro) {
      console.error("Erro ao obter perfil:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async logout(req, res) {
    // Logout em JWT statless é apenas no client.
    return res.status(200).json({
      sucesso: true,
      mensagem: "Logout realizado com sucesso",
    });
  }

  async atualizarPerfil(req, res) {
    try {
      const { nome, telefone } = req.body;
      const usuarioToken = req.auth;

      if (!nome && !telefone) {
        return res.status(400).json({ sucesso: false, mensagem: "Forneça ao menos um campo para atualizar" });
      }

      const updateData = {};
      if (nome) updateData.nome = nome;
      if (telefone !== undefined) updateData.telefone = telefone;

      const { data: usuarioAtualizado, error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuarioToken.id)
        .select('id, nome, email, telefone, tipo')
        .single();

      if (error) throw error;

      return res.status(200).json({
        sucesso: true,
        mensagem: "Perfil atualizado com sucesso",
        usuario: usuarioAtualizado,
      });
    } catch (erro) {
      console.error("Erro ao atualizar perfil:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }
}

module.exports = new AuthController();
