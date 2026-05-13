const supabase = require('../config/database');

class DashboardController {
    async getStats(req, res) {
        try {
            const usuarioId = req.auth.id;

            // Busca os agendamentos de hoje do usuário logado
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);

            const { count: agendamentosHoje, error: errAgend } = await supabase
                .from('agendamentos')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', usuarioId)
                .gte('data_hora_inicio', hoje.toISOString())
                .lt('data_hora_inicio', amanha.toISOString());

            // Total de clientes cadastrados
            const { count: totalClientes, error: errCli } = await supabase
                .from('clientes')
                .select('*', { count: 'exact', head: true });

            // Espaços disponíveis (Ativos)
            const { count: espacosDisponiveis, error: errEspacos } = await supabase
                .from('espacos')
                .select('*', { count: 'exact', head: true })
                .eq('ativo', true);

            // Lembretes totais pendentes
            const { count: lembretesPendentes, error: errLemb } = await supabase
                .from('lembretes')
                .select('id, agendamentos!inner(usuario_id)', { count: 'exact', head: true })
                .eq('enviado', false)
                .eq('agendamentos.usuario_id', usuarioId);

            res.status(200).json({
                sucesso: true,
                stats: {
                    agendamentosHoje: agendamentosHoje || 0,
                    totalClientes: totalClientes || 0,
                    espacosDisponiveis: espacosDisponiveis || 0,
                    lembretesPendentes: lembretesPendentes || 0
                }
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar o painel' });
        }
    }
}

module.exports = new DashboardController();
