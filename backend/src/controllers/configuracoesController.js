const supabase = require('../config/database');

class ConfiguracoesController {
    async obter(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { data, error } = await supabase.from('configuracoes_agenda').select('*').eq('usuario_id', usuarioId).single();
            if (error && error.code !== 'PGRST116') throw error; // Ignora se não encontrar
            
            res.json({ 
                sucesso: true, 
                configuracoes: data || { theme: 'light', weekStart: 'monday', notifications: true, showEmptySlots: true } 
            });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const usuarioId = req.auth.id;
            
            const configPayload = {
                usuario_id: usuarioId,
                tema_escuro: req.body.tema_escuro || false,
                inicio_semana: req.body.inicio_semana || 'monday',
                notificacoes_ativas: req.body.notificacoes_ativas ?? true,
                mostrar_horarios_vazios: req.body.mostrar_horarios_vazios ?? true
            };

            const { data, error } = await supabase.from('configuracoes_agenda')
                .upsert(configPayload, { onConflict: 'usuario_id' })
                .select()
                .single();
            if (error) throw error;
                
            res.json({ sucesso: true, configuracao: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new ConfiguracoesController();
