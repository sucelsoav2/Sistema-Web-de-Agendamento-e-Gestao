const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  // gera token JWT
  gerarToken(usuarioId, email) {
    const token = jwt.sign(
      { id: usuarioId, email: email },
      process.env.JWT_SECRET || "sua_chave_secreta_aqui",
      { expiresIn: "24h" },
    );
    return token;
  }

  // valida se email já existe
  async validarEmailExistente(email) {
    // consultar banco de dados
    console.log("Validando email:", email);
    return false;
  }

  // criptografa senha
  async criptografarSenha(senha) {
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);
    return senhaCriptografada;
  }

  // compara senha com hash
  async compararSenha(senhaDigitada, senhaHash) {
    return await bcrypt.compare(senhaDigitada, senhaHash);
  }

  // valida formato de email
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // valida força da senha
  validarSenha(senha) {
    if (senha.length < 6) {
      return {
        valido: false,
        mensagem: "Senha deve ter no mínimo 6 caracteres",
      };
    }
    return { valido: true, mensagem: "Senha válida" };
  }
}

module.exports = new AuthService();
