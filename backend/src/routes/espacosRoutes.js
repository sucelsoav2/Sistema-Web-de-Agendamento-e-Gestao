const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require("express-jwt");
const espacosController = require('../controllers/espacosController');
const supabase = require('../config/database');

const verificarToken = jwt({ secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui", algorithms: ["HS256"], requestProperty: "auth" });

const apenasAdmin = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from('usuarios')
            .select('role_id')
            .eq('id', req.auth.id)
            .single();

        if (error || !data || data.role_id !== 3) {
            return res.status(403).json({ sucesso: false, erro: 'Apenas administradores podem alterar salas.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: error.message });
    }
};

router.get('/', verificarToken, espacosController.listar);
router.get('/disponibilidade', verificarToken, espacosController.disponibilidade);
router.post('/', verificarToken, apenasAdmin, espacosController.criar);
router.put('/:id', verificarToken, apenasAdmin, espacosController.atualizar);
router.delete('/:id', verificarToken, apenasAdmin, espacosController.deletar);

module.exports = router;
