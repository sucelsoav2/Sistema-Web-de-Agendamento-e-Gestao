const supabase = require('../config/database');

class AgendamentosController {
    async listar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { data, error } = await supabase.from('agendamentos')
                .select('*, clientes(nome, email), espacos(nome)')
                .eq('usuario_id', usuarioId)
                .order('data_hora_inicio', { ascending: true });
            if (error) throw error;
            res.json({ sucesso: true, agendamentos: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async criar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { cliente_id, espaco_id, data_hora_inicio, data_hora_fim, observacoes } = req.body;
            const { data, error } = await supabase.from('agendamentos')
                .insert([{ 
                    usuario_id: usuarioId, 
                    cliente_id, 
                    espaco_id, 
                    data_hora_inicio, 
                    data_hora_fim, 
                    observacoes 
                }])
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, agendamento: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { espaco_id, data_hora_inicio, data_hora_fim, status, observacoes } = req.body;
            const { data, error } = await supabase.from('agendamentos')
                .update({ espaco_id, data_hora_inicio, data_hora_fim, status, observacoes })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, agendamento: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('agendamentos').delete().eq('id', id);
            if (error) throw error;
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async listarMeus(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { data, error } = await supabase.from('agendamentos')
                .select('*, usuario:usuario_id (nome), espaco:espaco_id (nome)')
                .eq('cliente_usuario_id', usuarioId)
                .order('data_hora_inicio', { ascending: true });
            if (error) throw error;
            res.json({ sucesso: true, agendamentos: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new AgendamentosController();
