const supabase = require('../config/database');

const TIMEZONE_OFFSET = '-03:00';
const INTERVALO_MINUTOS = 30;

const toIsoLocal = (date, time) => `${date}T${time}:00${TIMEZONE_OFFSET}`;
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);
const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

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

    async disponibilidade(req, res) {
        try {
            const { data, horario, pessoas = 1 } = req.query;
            if (!data || !horario) {
                return res.status(400).json({ sucesso: false, erro: 'Data e horário são obrigatórios.' });
            }

            const quantidade = Number(pessoas) || 1;
            const inicio = new Date(toIsoLocal(data, horario));
            const fim = addMinutes(inicio, INTERVALO_MINUTOS);

            const { data: salas, error: salasError } = await supabase.from('espacos')
                .select('*')
                .eq('ativo', true)
                .gte('capacidade', quantidade)
                .order('capacidade', { ascending: true });
            if (salasError) throw salasError;

            const { data: agendamentos, error: agError } = await supabase.from('agendamentos')
                .select('id, espaco_id, data_hora_inicio, data_hora_fim, status')
                .not('espaco_id', 'is', null)
                .neq('status', 'cancelado')
                .lt('data_hora_inicio', fim.toISOString())
                .gt('data_hora_fim', inicio.toISOString());
            if (agError) throw agError;

            const salasDisponiveis = (salas || []).filter((sala) => {
                return !(agendamentos || []).some((item) => item.espaco_id === sala.id
                    && overlaps(inicio, fim, new Date(item.data_hora_inicio), new Date(item.data_hora_fim)));
            }).map((sala) => ({
                id: sala.id,
                name: sala.nome,
                capacity: sala.capacidade,
                status: 'Ativo'
            }));

            res.json({
                sucesso: true,
                salas: salasDisponiveis,
                salaRecomendada: salasDisponiveis[0] || null
            });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}
module.exports = new EspacosController();
