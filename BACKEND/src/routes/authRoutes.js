const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
  res.status(200).json({ mensagem: "Home da autenticação" });
});
module.exports = router;
