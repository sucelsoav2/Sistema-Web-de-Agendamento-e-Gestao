const supabase = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizarTelefone = (telefone) => String(telefone || '').replace(/\D/g, '');

const telefoneCelularValido = (telefone) => {
  let digits = normalizarTelefone(telefone);
  if (digits.startsWith('55') && digits.length === 13) digits = digits.slice(2);
  if (digits.length !== 11) return false;

  const ddd = Number(digits.slice(0, 2));
  return ddd >= 11 && ddd <= 99 && digits[2] === '9';
};

const calcularIdade = (dataNascimento) => {
  const nascimento = new Date(`${dataNascimento}T00:00:00-03:00`);
  if (Number.isNaN(nascimento.getTime())) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade -= 1;
  return idade;
};

class AuthController {
  async registrar(req, res) {
    try {
      const { nome, email, senha, tipo, telefone, data_nascimento, foto_perfil } = req.body;

      if (!nome || !email || !senha || !telefone || !data_nascimento || !foto_perfil) {
        return res.status(400).json({ sucesso: false, mensagem: "Todos os campos (incluindo foto e telefone) são obrigatórios" });
      }

      if (!emailRegex.test(email)) {
        return res.status(400).json({ sucesso: false, mensagem: "Insira um email válido." });
      }

      if (!telefoneCelularValido(telefone)) {
        return res.status(400).json({ sucesso: false, mensagem: "Insira um número de celular válido." });
      }

      const idade = calcularIdade(data_nascimento);
      if (idade === null || idade > 100) {
        return res.status(400).json({ sucesso: false, mensagem: "Data inválida" });
      }

      if (idade < 18) {
        return res.status(400).json({ sucesso: false, mensagem: "Plataforma valida apenas para maiores de 18 anos!" });
      }

      const { data: usuarioExistente } = await supabase.from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (usuarioExistente) {
        return res.status(409).json({ sucesso: false, mensagem: "Email já cadastrado" });
      }

      console.log("--- TENTATIVA DE CADASTRO ---");
      console.log("Campos recebidos:", { nome, email, telefone, data_nascimento, foto_tamanho: foto_perfil ? foto_perfil.length : 0 });

      const { error: authError } = await supabase.auth.signUp({
        email,
        password: senha
      });

      if (authError) {
        console.error("ERRO SUPABASE AUTH NO REGISTRO:", authError);
        return res.status(400).json({ sucesso: false, mensagem: authError.message || "Email inválido no autenticador do Supabase" });
      }

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
      return res.status(201).json({
        sucesso: true,
        mensagem: "Usuário registrado com sucesso. Confirme seu email antes de fazer login.",
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

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        const mensagemSupabase = String(authError.message || '').toLowerCase();
        const emailNaoConfirmado = mensagemSupabase.includes('email not confirmed')
          || mensagemSupabase.includes('not confirmed')
          || mensagemSupabase.includes('confirm');

        if (emailNaoConfirmado) {
          return res.status(403).json({
            sucesso: false,
            mensagem: 'Confirme seu email pelo Supabase antes de fazer login.'
          });
        }

        return res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos' });
      }

      await supabase.auth.signOut().catch(() => null);

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
