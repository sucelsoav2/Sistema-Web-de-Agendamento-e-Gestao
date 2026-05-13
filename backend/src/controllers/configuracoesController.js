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
            const { theme, weekStart, notifications, showEmptySlots } = req.body;
            
            // Opcional: Você pode mapear isso para colunas reais no banco depois, mas por ora vamos armazenar como JSONB para simplificar
            const configPayload = {
                usuario_id: usuarioId,
                visualizacao_padrao: weekStart === 'monday' ? 'semanal' : 'diaria'
            };

            const { data, error } = await supabase.from('configuracoes_agenda')
                .update(configPayload)
                .eq('usuario_id', usuarioId)
                .select()
                .single();
                
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new ConfiguracoesController();
