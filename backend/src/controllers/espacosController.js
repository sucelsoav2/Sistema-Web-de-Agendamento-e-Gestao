const supabase = require('../config/database');

class EspacosController {
    async listar(req, res) {
        try {
            const { data, error } = await supabase.from('espacos').select('*').order('nome');
            if (error) throw error;
            // O frontend espera 'Ativo' ou 'Reservado', e id, name, capacity, status
            const espacosMapeados = data.map(e => ({
                id: e.id,
                name: e.nome,
                capacity: e.capacidade,
                status: e.ativo ? 'Ativo' : 'Reservado'
            }));
            res.json({ sucesso: true, espacos: espacosMapeados });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async criar(req, res) {
        try {
            const { name, capacity, status } = req.body;
            const ativo = status === 'Ativo';
            const { data, error } = await supabase.from('espacos')
                .insert([{ nome: name, capacidade: capacity, ativo }])
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, espaco: { id: data.id, name: data.nome, capacity: data.capacidade, status: data.ativo ? 'Ativo' : 'Reservado' } });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { name, capacity, status } = req.body;
            const ativo = status === 'Ativo';
            const { data, error } = await supabase.from('espacos')
                .update({ nome: name, capacidade: capacity, ativo })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, espaco: { id: data.id, name: data.nome, capacity: data.capacidade, status: data.ativo ? 'Ativo' : 'Reservado' } });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('espacos').delete().eq('id', id);
            if (error) throw error;
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new EspacosController();
