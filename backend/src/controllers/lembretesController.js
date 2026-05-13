const supabase = require('../config/database');

class LembretesController {
    async listar(req, res) {
        try {
            const { data, error } = await supabase.from('lembretes').select('*').order('criado_em', { ascending: false });
            if (error) throw error;
            const lembretesMapeados = data.map(l => ({
                id: l.id,
                title: l.titulo,
                time: l.data_programada ? l.data_programada.substring(11, 16) : '00:00',
                notes: l.mensagem,
                status: l.status
            }));
            res.json({ sucesso: true, lembretes: lembretesMapeados });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async criar(req, res) {
        try {
            const { title, time, notes, status } = req.body;
            // Cria uma data programada ficticia para hoje usando a hora fornecida
            const hoje = new Date().toISOString().split('T')[0];
            const dataProgramada = `${hoje}T${time}:00Z`;

            const { data, error } = await supabase.from('lembretes')
                .insert([{ titulo: title, data_programada: dataProgramada, mensagem: notes, status }])
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, lembrete: { id: data.id, title: data.titulo, time, notes: data.mensagem, status: data.status } });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { title, time, notes, status } = req.body;
            const hoje = new Date().toISOString().split('T')[0];
            const dataProgramada = `${hoje}T${time}:00Z`;

            const { data, error } = await supabase.from('lembretes')
                .update({ titulo: title, data_programada: dataProgramada, mensagem: notes, status })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, lembrete: { id: data.id, title: data.titulo, time, notes: data.mensagem, status: data.status } });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new LembretesController();
