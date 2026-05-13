const express = require("express");
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const authController = require("../controllers/authController");

// configuração do express-jwt
const verificarToken = jwt({
  secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui",
  algorithms: ["HS256"],
  requestProperty: "auth", // token decodificado fica em req.auth
});

// rotas públicas
// criar novo usuário
router.post("/registrar", authController.registrar);

// autenticar usuário
router.post("/login", authController.login);

// rotas protegidas 
router.get("/perfil", verificarToken, authController.obterPerfil);

module.exports = router;
