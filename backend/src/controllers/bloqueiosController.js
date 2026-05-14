const supabase = require('../config/database');

const TIMEZONE_OFFSET = '-03:00';
const DEFAULT_SLOT_MINUTES = 30;
const BUSINESS_END = '18:00';
const NEXT_MORNING = '08:00';

const toIsoBahia = (date, time) => `${date}T${String(time).slice(0, 5)}:00${TIMEZONE_OFFSET}`;

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const addDaysToDateString = (dateString, days) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days, 12));
    return date.toISOString().slice(0, 10);
};

const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

const getDayName = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return dayNames[new Date(year, month - 1, day).getDay()];
};

const mapBloqueio = (b) => {
    const recorrente = !b.data_hora_inicio && !b.data_hora_fim;

    return {
        id: b.id,
        day: b.dia_semana,
        start: b.hora_inicio ? String(b.hora_inicio).slice(0, 5) : null,
        end: b.hora_fim ? String(b.hora_fim).slice(0, 5) : null,
        reason: b.motivo,
        data_hora_inicio: b.data_hora_inicio,
        data_hora_fim: b.data_hora_fim,
        recurring: recorrente,
        label: recorrente ? 'Sempre' : 'Período definido'
    };
};

class BloqueiosController {
    async listar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { data, error } = await supabase.from('bloqueios_horario')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('criado_em', { ascending: false });
            if (error) throw error;
            res.json({ sucesso: true, bloqueios: (data || []).map(mapBloqueio) });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async criar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const {
                date,
                start,
                duration_type,
                custom_end_date,
                custom_end_time,
                reason,
                day,
                end
            } = req.body;

            if (!reason || !String(reason).trim()) {
                return res.status(400).json({ sucesso: false, erro: 'Informe o motivo do bloqueio.' });
            }

            const payload = this.montarPayloadBloqueio({
                usuarioId,
                date,
                start,
                durationType: duration_type,
                customEndDate: custom_end_date,
                customEndTime: custom_end_time,
                reason: String(reason).trim(),
                legacyDay: day,
                legacyEnd: end
            });

            const { data, error } = await supabase.from('bloqueios_horario')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, bloqueio: mapBloqueio(data) });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { id } = req.params;
            const {
                date,
                start,
                duration_type,
                custom_end_date,
                custom_end_time,
                reason,
                day,
                end
            } = req.body;

            if (!reason || !String(reason).trim()) {
                return res.status(400).json({ sucesso: false, erro: 'Informe o motivo do bloqueio.' });
            }

            const payload = this.montarPayloadBloqueio({
                usuarioId,
                date,
                start,
                durationType: duration_type,
                customEndDate: custom_end_date,
                customEndTime: custom_end_time,
                reason: String(reason).trim(),
                legacyDay: day,
                legacyEnd: end
            });

            delete payload.usuario_id;

            const { data, error } = await supabase.from('bloqueios_horario')
                .update(payload)
                .eq('id', id)
                .eq('usuario_id', usuarioId)
                .select()
                .single();
            if (error) throw error;
            res.json({ sucesso: true, bloqueio: mapBloqueio(data) });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const usuarioId = req.auth.id;
            const { error } = await supabase.from('bloqueios_horario')
                .delete()
                .eq('id', id)
                .eq('usuario_id', usuarioId);
            if (error) throw error;
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    montarPayloadBloqueio({
        usuarioId,
        date,
        start,
        durationType,
        customEndDate,
        customEndTime,
        reason,
        legacyDay,
        legacyEnd
    }) {
        const startTime = String(start || '').slice(0, 5);
        if (!startTime) {
            throw new Error('Informe o horário inicial do bloqueio.');
        }

        if (!date && legacyDay) {
            return {
                usuario_id: usuarioId,
                dia_semana: legacyDay,
                hora_inicio: startTime,
                hora_fim: legacyEnd || this.calcularHoraFim(startTime),
                motivo: reason
            };
        }

        if (!date) {
            throw new Error('Informe a data do bloqueio.');
        }

        const normalizedType = durationType || 'hoje';
        const startDate = new Date(toIsoBahia(date, startTime));
        let endDate = addMinutes(startDate, DEFAULT_SLOT_MINUTES);

        if (normalizedType === 'fim_dia') {
            endDate = new Date(toIsoBahia(date, BUSINESS_END));
        } else if (normalizedType === 'amanha_manha') {
            endDate = new Date(toIsoBahia(addDaysToDateString(date, 1), NEXT_MORNING));
        } else if (normalizedType === 'personalizado') {
            if (!customEndDate || !customEndTime) {
                throw new Error('Informe data e horário final para bloqueio personalizado.');
            }
            endDate = new Date(toIsoBahia(customEndDate, customEndTime));
        } else if (normalizedType === 'sempre') {
            return {
                usuario_id: usuarioId,
                dia_semana: getDayName(date),
                hora_inicio: startTime,
                hora_fim: this.calcularHoraFim(startTime),
                motivo: reason,
                data_hora_inicio: null,
                data_hora_fim: null
            };
        }

        if (endDate <= startDate) {
            throw new Error('O fim do bloqueio deve ser depois do início.');
        }

        return {
            usuario_id: usuarioId,
            dia_semana: null,
            hora_inicio: startTime,
            hora_fim: endDate.toLocaleTimeString('pt-BR', {
                timeZone: 'America/Bahia',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }),
            data_hora_inicio: startDate.toISOString(),
            data_hora_fim: endDate.toISOString(),
            motivo: reason
        };
    }

    calcularHoraFim(start) {
        const [hours, minutes] = start.split(':').map(Number);
        const total = hours * 60 + minutes + DEFAULT_SLOT_MINUTES;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    }
}

module.exports = new BloqueiosController();
