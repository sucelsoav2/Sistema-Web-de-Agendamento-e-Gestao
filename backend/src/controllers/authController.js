const supabase = require('../config/database');
const { createClient } = require('@supabase/supabase-js');
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

const getAppUrl = (req) => {
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const requestOrigin = req?.headers?.origin || '';
  const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0];
  const requestHost = req?.headers?.host
    ? `${forwardedProto || req.protocol || 'https'}://${req.headers.host}`
    : '';

  return (process.env.APP_URL || vercelUrl || requestOrigin || requestHost || 'http://localhost:3000').replace(/\/$/, '');
};

const getLoginRedirectUrl = (req) => `${getAppUrl(req)}/src/pages/login.html`;

const emailFoiConfirmado = (authUser) => Boolean(
  authUser?.email_confirmed_at
  || authUser?.confirmed_at
);

const criarSupabaseComSessao = async (accessToken, refreshToken) => {
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  if (error) throw error;
  return client;
};

class AuthController {
  async registrar(req, res) {
    try {
      const { nome, email, senha, role_id, telefone, data_nascimento, foto_perfil } = req.body;

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
        password: senha,
        options: {
          emailRedirectTo: getLoginRedirectUrl(req)
        }
      });

      if (authError) {
        console.error("ERRO SUPABASE AUTH NO REGISTRO:", authError);
        const authMessage = String(authError.message || '');
        if (/rate limit/i.test(authMessage)) {
          return res.status(429).json({
            sucesso: false,
            codigo: 'EMAIL_RATE_LIMIT',
            mensagem: "O Supabase bloqueou temporariamente o envio de emails de confirmação por excesso de tentativas. Aguarde alguns minutos antes de criar outra conta ou ajuste o SMTP/rate limit no Supabase."
          });
        }
        return res.status(400).json({ sucesso: false, mensagem: authError.message || "Email inválido no autenticador do Supabase" });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const { data, error } = await supabase.from('usuarios').insert([{
        nome,
        email,
        senha_hash: senhaHash,
        role_id: Number(role_id) || 1,
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
        usuario: { id: data.id, nome, email, role_id: data.role_id },
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

      if (usuario.ativo === false) {
        return res.status(403).json({ sucesso: false, mensagem: 'Esta conta foi desativada. Entre em contato com o administrador.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

      if (!senhaValida) {
        return res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos' });
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        const mensagemSupabase = String(authError.message || '').toLowerCase();
        const emailNaoConfirmado = mensagemSupabase.includes('email not confirmed')
          || mensagemSupabase.includes('not confirmed')
          || mensagemSupabase.includes('confirm');

        console.warn("LOGIN BLOQUEADO PELO SUPABASE AUTH:", {
          email,
          erro: authError.message
        });

        if (emailNaoConfirmado) {
          return res.status(403).json({
            sucesso: false,
            codigo: 'EMAIL_NAO_CONFIRMADO',
            mensagem: 'O Supabase ainda não reconheceu a confirmação deste email. Verifique se você clicou no link mais recente enviado para seu email ou solicite um novo link de confirmação.'
          });
        }

        return res.status(403).json({
          sucesso: false,
          codigo: 'CONTA_NAO_AUTENTICADA_SUPABASE',
          mensagem: 'Esta conta ainda não foi autenticada pelo Supabase. Confirme o email enviado no cadastro antes de fazer login.'
        });
      }

      if (!emailFoiConfirmado(authData?.user)) {
        console.warn("LOGIN BLOQUEADO: email não confirmado no Supabase Auth:", {
          email,
          userId: authData?.user?.id
        });

        await supabase.auth.signOut().catch(() => null);

        return res.status(403).json({
          sucesso: false,
          codigo: 'EMAIL_NAO_CONFIRMADO',
          mensagem: 'Confirme seu email pelo link enviado antes de fazer login. Se não recebeu, solicite um novo link de confirmação.'
        });
      }

      await supabase.auth.signOut().catch(() => null);

      const token = jwt.sign({ id: usuario.id, email: usuario.email, role_id: usuario.role_id }, process.env.JWT_SECRET || 'sua_chave_secreta_aqui', { expiresIn: '24h' });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Login realizado com sucesso",
        token: token,
        usuario: { id: usuario.id, nome: usuario.nome, email, role_id: usuario.role_id },
      });
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async reenviarConfirmacao(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ sucesso: false, mensagem: "Email é obrigatório" });
      }

      if (!emailRegex.test(email)) {
        return res.status(400).json({ sucesso: false, mensagem: "Insira um email válido." });
      }

      const { data: usuario } = await supabase.from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (!usuario) {
        return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado" });
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getLoginRedirectUrl(req)
        }
      });

      if (error) {
        console.error("ERRO AO REENVIAR CONFIRMAÇÃO:", error);
        return res.status(400).json({ sucesso: false, mensagem: error.message || "Não foi possível reenviar a confirmação." });
      }

      return res.json({
        sucesso: true,
        mensagem: "Enviamos um novo link de confirmação para seu email."
      });
    } catch (erro) {
      console.error("Erro ao reenviar confirmação:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async solicitarRedefinicaoSenha(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ sucesso: false, mensagem: "Email é obrigatório" });
      }

      if (!emailRegex.test(email)) {
        return res.status(400).json({ sucesso: false, mensagem: "Insira um email válido." });
      }

      const { data: usuario } = await supabase.from('usuarios')
        .select('id, ativo')
        .eq('email', email)
        .maybeSingle();

      if (!usuario || usuario.ativo === false) {
        console.warn("REDEFINIÇÃO DE SENHA IGNORADA: usuário inexistente ou inativo.", { email });
        return res.json({
          sucesso: true,
          mensagem: "Se este email estiver cadastrado e ativo, enviaremos um link de redefinição de senha."
        });
      }

      const redirectTo = `${getAppUrl(req)}/src/pages/reset-password.html`;
      let { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error && /redirect|uri|url|not allowed/i.test(String(error.message || ''))) {
        console.warn("REDEFINIÇÃO COM REDIRECT RECUSADA, TENTANDO SEM REDIRECT:", {
          redirectTo,
          erro: error.message
        });
        const fallback = await supabase.auth.resetPasswordForEmail(email);
        error = fallback.error;
      }

      if (error) {
        console.error("ERRO AO SOLICITAR REDEFINIÇÃO:", error);
        return res.json({
          sucesso: false,
          avisoInterno: 'SUPABASE_RESET_RECUSADO',
          mensagem: `O Supabase recusou o envio do email de recuperação: ${error.message || 'erro desconhecido'}. Verifique as configurações de recuperação de senha no Supabase.`
        });
      }

      return res.json({
        sucesso: true,
        mensagem: "Enviamos um link de redefinição de senha para seu email."
      });
    } catch (erro) {
      console.error("Erro ao solicitar redefinição de senha:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async redefinirSenha(req, res) {
    try {
      const { access_token, refresh_token, nova_senha } = req.body;

      if (!access_token || !refresh_token || !nova_senha) {
        return res.status(400).json({ sucesso: false, mensagem: "Token de recuperação e nova senha são obrigatórios." });
      }

      if (String(nova_senha).length < 6) {
        return res.status(400).json({ sucesso: false, mensagem: "A senha deve ter pelo menos 6 caracteres." });
      }

      const recoveryClient = await criarSupabaseComSessao(access_token, refresh_token);
      const { data: authData, error: userError } = await recoveryClient.auth.getUser();
      if (userError || !authData?.user?.email) {
        return res.status(401).json({ sucesso: false, mensagem: "Link de redefinição inválido ou expirado." });
      }

      const { error: updateAuthError } = await recoveryClient.auth.updateUser({
        password: nova_senha
      });
      if (updateAuthError) {
        return res.status(400).json({ sucesso: false, mensagem: updateAuthError.message || "Não foi possível atualizar a senha." });
      }

      const senhaHash = await bcrypt.hash(nova_senha, 10);
      const { error: updateLocalError } = await supabase.from('usuarios')
        .update({ senha_hash: senhaHash })
        .eq('email', authData.user.email);
      if (updateLocalError) throw updateLocalError;

      await recoveryClient.auth.signOut().catch(() => null);

      return res.json({
        sucesso: true,
        mensagem: "Senha redefinida com sucesso. Faça login com sua nova senha."
      });
    } catch (erro) {
      console.error("Erro ao redefinir senha:", erro);
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }

  async obterPerfil(req, res) {
    try {
      const usuarioToken = req.auth;
      const { data, error } = await supabase.from('usuarios').select('id, nome, email, telefone, role_id').eq('id', usuarioToken.id).single();

      if (error || !data) return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado" });

      return res.status(200).json({ sucesso: true, usuario: data });
    } catch (erro) {
      return res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor" });
    }
  }
}

module.exports = new AuthController();
