const supabase = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
  async registrar(req, res) {
    try {
      const { nome, email, senha, tipo, telefone, data_nascimento, foto_perfil } = req.body;

      if (!nome || !email || !senha || !telefone || !data_nascimento || !foto_perfil) {
        return res.status(400).json({ sucesso: false, mensagem: "Todos os campos (incluindo foto e telefone) são obrigatórios" });
      }

      console.log("--- TENTATIVA DE CADASTRO ---");
      console.log("Campos recebidos:", { nome, email, telefone, data_nascimento, foto_tamanho: foto_perfil ? foto_perfil.length : 0 });

      const senhaHash = await bcrypt.hash(senha, 10);

      const { data, error } = await supabase.from('usuarios').insert([{
        nome,
        email,
        senha_hash: senhaHash,
        tipo: tipo || 'profissional',
        telefone,
        data_nascimento,
        foto_perfil
      }]).select().single();

      if (error) {
        console.error("ERRO SUPABASE NO REGISTRO:", error);
        if (error.code === '23505') return res.status(409).json({ sucesso: false, mensagem: "Email já cadastrado" });
        throw error;
      }

      console.log("USUÁRIO CADASTRADO COM SUCESSO!");
      const token = jwt.sign({ id: data.id, email: data.email, tipo: data.tipo }, process.env.JWT_SECRET || 'sua_chave_secreta_aqui', { expiresIn: '24h' });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Usuário registrado com sucesso",
        token: token,
        usuario: { id: data.id, nome, email, tipo: data.tipo, role_id: data.role_id },
      });
    } catch (erro) {
      console.error("ERRO CRÍTICO NO REGISTRO:", erro.message);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor: " + erro.message });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ sucesso: false, mensagem: "Email e senha são obrigatórios" });
      }

      const { data: usuario, error } = await supabase.from('usuarios').select('*').eq('email', email).single();

      if (error || !usuario) {
        return res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

      if (!senhaValida) {
        return res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos' });
      }

      const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, process.env.JWT_SECRET || 'sua_chave_secreta_aqui', { expiresIn: '24h' });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        token: token,
        usuario: { id: usuario.id, nome: usuario.nome, email, tipo: usuario.tipo, role_id: usuario.role_id },
      });
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async obterPerfil(req, res) {
    try {
      const usuarioToken = req.auth;
      const { data, error } = await supabase.from('usuarios').select('id, nome, email, telefone, tipo').eq('id', usuarioToken.id).single();

      if (error || !data) return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado" });

      return res.status(200).json({ sucesso: true, usuario: data });
    } catch (erro) {
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }
}

module.exports = new AuthController();
