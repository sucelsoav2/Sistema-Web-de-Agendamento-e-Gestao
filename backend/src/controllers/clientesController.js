const supabase = require('../config/database');

class ClientesController {
    async listar(req, res) {
        try {
            const { data, error } = await supabase.from('clientes').select('*').order('nome');
            if (error) throw error;
            res.json({ sucesso: true, clientes: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async criar(req, res) {
        try {
            const { nome, email, telefone, observacoes, ativo } = req.body;
            const { data, error } = await supabase.from('clientes')
                .insert([{ nome, email, telefone, observacoes, ativo }])
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, cliente: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, telefone, observacoes, ativo } = req.body;
            const { data, error } = await supabase.from('clientes')
                .update({ nome, email, telefone, observacoes, ativo })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, cliente: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('clientes').delete().eq('id', id);
            if (error) throw error;
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new ClientesController();
