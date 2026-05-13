const supabase = require('../config/database');

class BloqueiosController {
    async listar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { data, error } = await supabase.from('bloqueios_horario').select('*').eq('usuario_id', usuarioId);
            if (error) throw error;
            const bloqueiosMapeados = data.map(b => ({
                id: b.id,
                day: b.dia_semana,
                start: b.hora_inicio,
                end: b.hora_fim,
                reason: b.motivo
            }));
            res.json({ sucesso: true, bloqueios: bloqueiosMapeados });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async criar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { day, start, end, reason } = req.body;
            const { data, error } = await supabase.from('bloqueios_horario')
                .insert([{ usuario_id: usuarioId, dia_semana: day, hora_inicio: start, hora_fim: end, motivo: reason }])
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, bloqueio: { id: data.id, day: data.dia_semana, start: data.hora_inicio, end: data.hora_fim, reason: data.motivo } });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { day, start, end, reason } = req.body;
            const { data, error } = await supabase.from('bloqueios_horario')
                .update({ dia_semana: day, hora_inicio: start, hora_fim: end, motivo: reason })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, bloqueio: { id: data.id, day: data.dia_semana, start: data.hora_inicio, end: data.hora_fim, reason: data.motivo } });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('bloqueios_horario').delete().eq('id', id);
            if (error) throw error;
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new BloqueiosController();
