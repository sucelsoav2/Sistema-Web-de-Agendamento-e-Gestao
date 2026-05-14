const supabase = require('../config/database');
const { sendEmail } = require('../services/emailService');

const HORARIO_INICIO = '08:00';
const HORARIO_FIM = '18:00';
const INTERVALO_MINUTOS = 30;
const TIMEZONE_OFFSET = '-03:00';

const toMinutes = (time) => {
    const [hours, minutes] = String(time).slice(0, 5).split(':').map(Number);
    return hours * 60 + minutes;
};

const toTime = (minutes) => {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
};

const toIsoLocal = (date, time) => `${date}T${time}:00${TIMEZONE_OFFSET}`;

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const overlaps = (startA, endA, startB, endB) => startA < endB && endA > startB;

const getBahiaNow = () => new Date();

const getBahiaToday = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bahia',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
};

const normalizeDay = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

const getDayName = (date) => {
    const [year, month, day] = date.split('-').map(Number);
    return dayNames[new Date(year, month - 1, day).getDay()];
};

class AgendamentosController {
    async listar(req, res) {
        try {
            const usuarioId = req.auth.id;

            const { data: usuario, error: usuarioError } = await supabase.from('usuarios')
                .select('role_id')
                .eq('id', usuarioId)
                .single();
            if (usuarioError) throw usuarioError;

            let query = supabase.from('agendamentos')
                .select('*, clientes(nome, email), espacos(nome, capacidade), cliente_usuario:cliente_usuario_id(nome, email), usuario:usuario_id(nome, email)')
                .order('data_hora_inicio', { ascending: true });

            if (Number(usuario.role_id) !== 3) {
                query = query.eq('usuario_id', usuarioId);
            }

            const { data, error } = await query;
            if (error) throw error;
            res.json({ sucesso: true, agendamentos: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async criar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { cliente_id, espaco_id, data_hora_inicio, data_hora_fim, observacoes, formato, cliente_usuario_id } = req.body;
            const { data, error } = await supabase.from('agendamentos')
                .insert([{
                    usuario_id: usuarioId,
                    cliente_id,
                    cliente_usuario_id,
                    espaco_id,
                    data_hora_inicio,
                    data_hora_fim,
                    observacoes,
                    formato
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
            const { espaco_id, data_hora_inicio, data_hora_fim, status, observacoes, formato } = req.body;
            const { data, error } = await supabase.from('agendamentos')
                .update({ espaco_id, data_hora_inicio, data_hora_fim, status, observacoes, formato })
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

    async cancelar(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { id } = req.params;
            const motivo = String(req.body.motivo || '').trim();

            if (!motivo) {
                return res.status(400).json({ sucesso: false, erro: 'Informe o motivo do cancelamento.' });
            }

            const { data: usuario, error: usuarioError } = await supabase.from('usuarios')
                .select('id, nome, email, role_id')
                .eq('id', usuarioId)
                .single();
            if (usuarioError) throw usuarioError;

            const { data: agendamento, error: agendamentoError } = await supabase.from('agendamentos')
                .select('*, clientes(nome, email), espacos(nome), cliente_usuario:cliente_usuario_id(id, nome, email), usuario:usuario_id(id, nome, email)')
                .eq('id', id)
                .single();
            if (agendamentoError) throw agendamentoError;

            if (agendamento.status === 'cancelado') {
                return res.status(409).json({ sucesso: false, erro: 'Este agendamento já está cancelado.' });
            }

            const isCliente = Number(usuario.role_id) === 1 && agendamento.cliente_usuario_id === usuarioId;
            const isProfissional = Number(usuario.role_id) === 2 && agendamento.usuario_id === usuarioId;
            const isAdmin = Number(usuario.role_id) === 3;

            if (!isCliente && !isProfissional && !isAdmin) {
                return res.status(403).json({ sucesso: false, erro: 'Você não tem permissão para cancelar este agendamento.' });
            }

            const origem = isCliente ? 'cliente' : isProfissional ? 'profissional' : 'administrador';
            const observacoesAtuais = agendamento.observacoes ? `${agendamento.observacoes}\n` : '';
            const observacoes = `${observacoesAtuais}Cancelado por ${origem}: ${motivo}`;

            const { data: cancelado, error: updateError } = await supabase.from('agendamentos')
                .update({ status: 'cancelado', observacoes })
                .eq('id', id)
                .select('*, clientes(nome, email), espacos(nome), cliente_usuario:cliente_usuario_id(id, nome, email), usuario:usuario_id(id, nome, email)')
                .single();
            if (updateError) throw updateError;

            let emailResult = { sent: false, reason: null };
            try {
                emailResult = await this.enviarEmailCancelamento(cancelado, origem, motivo, usuario);
            } catch (emailError) {
                console.error('Erro ao enviar e-mail de cancelamento:', emailError.message);
                emailResult = { sent: false, reason: 'send_error' };
            }

            res.json({
                sucesso: true,
                agendamento: cancelado,
                emailEnviado: emailResult.sent,
                emailMotivo: emailResult.reason || null
            });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async listarMeus(req, res) {
        try {
            const usuarioId = req.auth.id;
            const { data, error } = await supabase.from('agendamentos')
                .select('*, usuario:usuario_id (nome), espaco:espaco_id (nome, capacidade)')
                .eq('cliente_usuario_id', usuarioId)
                .order('data_hora_inicio', { ascending: true });
            if (error) throw error;
            res.json({ sucesso: true, agendamentos: data });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async disponibilidade(req, res) {
        try {
            const { profissional_id, data, pessoas = 1, duracao_minutos = INTERVALO_MINUTOS } = req.query;
            if (!profissional_id || !data) {
                return res.status(400).json({ sucesso: false, erro: 'Profissional e data são obrigatórios.' });
            }

            const duracao = Number(duracao_minutos) || INTERVALO_MINUTOS;
            if (duracao > 60) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'O agendamento pode ter no máximo 1 hora de duração, ou seja, dois horários seguidos.'
                });
            }

            if (duracao < INTERVALO_MINUTOS || duracao % INTERVALO_MINUTOS !== 0) {
                return res.status(400).json({ sucesso: false, erro: 'Duração inválida para o agendamento.' });
            }

            const slots = await this.calcularSlotsDisponiveis(profissional_id, data, Number(pessoas) || 1, duracao);
            res.json({ sucesso: true, slots });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async datasDisponiveis(req, res) {
        try {
            const { profissional_id, ano, mes, pessoas = 1 } = req.query;
            if (!profissional_id || !ano || !mes) {
                return res.status(400).json({ sucesso: false, erro: 'Profissional, ano e mês são obrigatórios.' });
            }

            const year = Number(ano);
            const month = Number(mes);
            const daysInMonth = new Date(year, month, 0).getDate();
            const today = getBahiaToday();
            const monthStart = new Date(toIsoLocal(`${year}-${String(month).padStart(2, '0')}-01`, '00:00'));
            const monthEnd = new Date(toIsoLocal(`${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`, '23:59'));
            const datas = [];

            const { data: agendamentos, error: agError } = await supabase.from('agendamentos')
                .select('id, usuario_id, data_hora_inicio, data_hora_fim, status')
                .eq('usuario_id', profissional_id)
                .gte('data_hora_inicio', monthStart.toISOString())
                .lte('data_hora_inicio', monthEnd.toISOString())
                .neq('status', 'cancelado');
            if (agError) throw agError;

            const { data: bloqueios, error: blockError } = await supabase.from('bloqueios_horario')
                .select('*')
                .eq('usuario_id', profissional_id);
            if (blockError) throw blockError;

            for (let day = 1; day <= daysInMonth; day += 1) {
                const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (date < today) continue;

                const dayOfWeek = getDayName(date);
                if (dayOfWeek === 'domingo' || dayOfWeek === 'sabado') continue;

                const possuiHorarioLivre = this.possuiHorarioLivreNoDia(profissional_id, date, agendamentos || [], bloqueios || []);
                if (possuiHorarioLivre) {
                    datas.push(date);
                }
            }

            res.json({ sucesso: true, datas });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    possuiHorarioLivreNoDia(profissionalId, date, agendamentos, bloqueios) {
        for (let minutes = toMinutes(HORARIO_INICIO); minutes < toMinutes(HORARIO_FIM); minutes += INTERVALO_MINUTOS) {
            const time = toTime(minutes);
            const start = new Date(toIsoLocal(date, time));
            const end = addMinutes(start, INTERVALO_MINUTOS);
            if (start <= getBahiaNow()) continue;

            if (this.profissionalLivreNoSlot(profissionalId, start, end, date, agendamentos, bloqueios)) {
                return true;
            }
        }

        return false;
    }

    async marcarComoCliente(req, res) {
        try {
            const clienteUsuarioId = req.auth.id;
            const { profissional_id, data, horario, formato, quantidade_pessoas, duracao_minutos = INTERVALO_MINUTOS } = req.body;
            const pessoas = Number(quantidade_pessoas) || 1;
            const duracao = Number(duracao_minutos) || INTERVALO_MINUTOS;

            if (!profissional_id || !data || !horario || !formato) {
                return res.status(400).json({ sucesso: false, erro: 'Profissional, data, horário e formato são obrigatórios.' });
            }

            if (!['hibrido', 'presencial'].includes(formato)) {
                return res.status(400).json({ sucesso: false, erro: 'Formato inválido.' });
            }

            if (duracao > 60) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'O agendamento pode ter no máximo 1 hora de duração, ou seja, dois horários seguidos.'
                });
            }

            if (duracao < INTERVALO_MINUTOS || duracao % INTERVALO_MINUTOS !== 0) {
                return res.status(400).json({ sucesso: false, erro: 'Duração inválida para o agendamento.' });
            }

            const start = new Date(toIsoLocal(data, horario));
            if (start <= getBahiaNow()) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Não é possível marcar reunião em data ou horário anterior ao momento atual.'
                });
            }

            const end = addMinutes(start, duracao);
            const sala = formato === 'presencial'
                ? await this.encontrarSalaDisponivel(start, end, pessoas)
                : null;

            if (formato === 'presencial' && !sala) {
                return res.status(409).json({ sucesso: false, erro: 'Nenhuma sala presencial disponível para esse horário e quantidade de pessoas.' });
            }

            const profissionalLivre = await this.profissionalDisponivel(profissional_id, start, end);
            if (!profissionalLivre) {
                return res.status(409).json({ sucesso: false, erro: 'O profissional não está disponível nesse horário.' });
            }

            const { count: conflitoCliente, error: conflitoError } = await supabase.from('agendamentos')
                .select('id', { count: 'exact', head: true })
                .eq('cliente_usuario_id', clienteUsuarioId)
                .neq('status', 'cancelado')
                .lt('data_hora_inicio', end.toISOString())
                .gt('data_hora_fim', start.toISOString());
            if (conflitoError) throw conflitoError;

            if (conflitoCliente > 0) {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Você já possui uma reunião marcada nesse dia e horário.'
                });
            }

            const cliente = await this.obterOuCriarCliente(clienteUsuarioId);
            const observacoes = `Quantidade de pessoas: ${pessoas}. Duração: ${duracao} minutos`;

            const { data: agendamento, error } = await supabase.from('agendamentos')
                .insert([{
                    cliente_id: cliente.id,
                    cliente_usuario_id: clienteUsuarioId,
                    usuario_id: profissional_id,
                    espaco_id: sala ? sala.id : null,
                    data_hora_inicio: start.toISOString(),
                    data_hora_fim: end.toISOString(),
                    formato,
                    observacoes,
                    status: 'agendado'
                }])
                .select('*, usuario:usuario_id(nome), espaco:espaco_id(nome, capacidade)')
                .single();

            if (error) throw error;
            res.status(201).json({ sucesso: true, agendamento });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async calcularSlotsDisponiveis(profissionalId, date, pessoas, duracao = INTERVALO_MINUTOS) {
        const slots = [];
        const startDay = new Date(toIsoLocal(date, '00:00'));
        const endDay = new Date(toIsoLocal(date, '23:59'));

        const { data: agendamentos, error: agError } = await supabase.from('agendamentos')
            .select('id, usuario_id, espaco_id, data_hora_inicio, data_hora_fim, status')
            .or(`usuario_id.eq.${profissionalId},espaco_id.not.is.null`)
            .gte('data_hora_inicio', startDay.toISOString())
            .lte('data_hora_inicio', endDay.toISOString())
            .neq('status', 'cancelado');
        if (agError) throw agError;

        const { data: bloqueios, error: blockError } = await supabase.from('bloqueios_horario')
            .select('*')
            .or(`usuario_id.eq.${profissionalId},espaco_id.not.is.null`);
        if (blockError) throw blockError;

        for (let minutes = toMinutes(HORARIO_INICIO); minutes < toMinutes(HORARIO_FIM); minutes += INTERVALO_MINUTOS) {
            const time = toTime(minutes);
            const start = new Date(toIsoLocal(date, time));
            const end = addMinutes(start, duracao);
            const isPast = start <= getBahiaNow();
            const endsAfterBusinessHours = minutes + duracao > toMinutes(HORARIO_FIM);
            const profissionalLivre = this.profissionalLivreNoSlot(profissionalId, start, end, date, agendamentos || [], bloqueios || []);
            const sala = await this.encontrarSalaDisponivel(start, end, pessoas, agendamentos || [], bloqueios || []);

            slots.push({
                horario: time,
                disponivel: !isPast && !endsAfterBusinessHours && profissionalLivre,
                presencialDisponivel: !isPast && !endsAfterBusinessHours && profissionalLivre && Boolean(sala),
                sala: sala ? { id: sala.id, nome: sala.nome, capacidade: sala.capacidade } : null
            });
        }

        return slots;
    }

    async profissionalDisponivel(profissionalId, start, end) {
        const date = start.toISOString().slice(0, 10);
        const { data: agendamentos, error: agError } = await supabase.from('agendamentos')
            .select('id, data_hora_inicio, data_hora_fim, status')
            .eq('usuario_id', profissionalId)
            .neq('status', 'cancelado')
            .lt('data_hora_inicio', end.toISOString())
            .gt('data_hora_fim', start.toISOString());
        if (agError) throw agError;

        const { data: bloqueios, error: blockError } = await supabase.from('bloqueios_horario')
            .select('*')
            .eq('usuario_id', profissionalId);
        if (blockError) throw blockError;

        return this.profissionalLivreNoSlot(profissionalId, start, end, date, agendamentos || [], bloqueios || []);
    }

    profissionalLivreNoSlot(profissionalId, start, end, date, agendamentos, bloqueios) {
        const ocupado = agendamentos.some((item) => item.usuario_id === profissionalId
            && overlaps(start, end, new Date(item.data_hora_inicio), new Date(item.data_hora_fim)));
        if (ocupado) return false;

        const dayName = getDayName(date);
        const slotStart = toTime(start.getUTCHours() * 60 + start.getUTCMinutes() - 180);
        const slotEnd = toTime(end.getUTCHours() * 60 + end.getUTCMinutes() - 180);

        return !bloqueios.some((block) => {
            if (block.usuario_id !== profissionalId) return false;
            if (block.data_hora_inicio && block.data_hora_fim) {
                return overlaps(start, end, new Date(block.data_hora_inicio), new Date(block.data_hora_fim));
            }

            return normalizeDay(block.dia_semana) === dayName
                && block.hora_inicio
                && block.hora_fim
                && toMinutes(slotStart) < toMinutes(block.hora_fim)
                && toMinutes(slotEnd) > toMinutes(block.hora_inicio);
        });
    }

    async encontrarSalaDisponivel(start, end, pessoas, agendamentosCache = null, bloqueiosCache = null) {
        const { data: salas, error: salasError } = await supabase.from('espacos')
            .select('*')
            .eq('ativo', true)
            .gte('capacidade', pessoas)
            .order('capacidade', { ascending: true });
        if (salasError) throw salasError;

        const agendamentos = agendamentosCache || (await supabase.from('agendamentos')
            .select('id, espaco_id, data_hora_inicio, data_hora_fim, status')
            .not('espaco_id', 'is', null)
            .neq('status', 'cancelado')
            .lt('data_hora_inicio', end.toISOString())
            .gt('data_hora_fim', start.toISOString())).data || [];

        const bloqueios = bloqueiosCache || (await supabase.from('bloqueios_horario')
            .select('*')
            .not('espaco_id', 'is', null)).data || [];

        for (const sala of salas || []) {
            const salaOcupada = agendamentos.some((item) => item.espaco_id === sala.id
                && overlaps(start, end, new Date(item.data_hora_inicio), new Date(item.data_hora_fim)));
            if (salaOcupada) continue;

            const salaBloqueada = bloqueios.some((block) => {
                if (block.espaco_id !== sala.id) return false;
                if (block.data_hora_inicio && block.data_hora_fim) {
                    return overlaps(start, end, new Date(block.data_hora_inicio), new Date(block.data_hora_fim));
                }
                return false;
            });
            if (!salaBloqueada) return sala;
        }

        return null;
    }

    async obterOuCriarCliente(usuarioId) {
        const { data: usuario, error: usuarioError } = await supabase.from('usuarios')
            .select('nome, email, telefone')
            .eq('id', usuarioId)
            .single();
        if (usuarioError) throw usuarioError;

        const { data: existente, error: findError } = await supabase.from('clientes')
            .select('*')
            .eq('email', usuario.email)
            .maybeSingle();
        if (findError) throw findError;
        if (existente) return existente;

        const { data: criado, error: createError } = await supabase.from('clientes')
            .insert([{
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                ativo: true
            }])
            .select()
            .single();
        if (createError) throw createError;
        return criado;
    }

    async enviarEmailCancelamento(agendamento, origem, motivo, usuarioCancelou) {
        if (origem === 'administrador') {
            return { sent: false, reason: 'admin_cancellation' };
        }

        const destino = origem === 'cliente'
            ? agendamento.usuario
            : (agendamento.cliente_usuario || agendamento.clientes);

        const data = new Date(agendamento.data_hora_inicio).toLocaleString('pt-BR', {
            timeZone: 'America/Bahia',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const quemCancelou = origem === 'cliente' ? 'cliente' : 'profissional';
        const subject = `Agendamento cancelado pelo ${quemCancelou}`;
        const text = [
            `Olá, ${destino?.nome || ''}.`,
            '',
            `O agendamento de ${data} foi cancelado pelo ${quemCancelou} ${usuarioCancelou.nome || ''}.`,
            `Motivo: ${motivo}`,
            '',
            'Esta é uma mensagem automática do AgendaFlow.'
        ].join('\n');

        return sendEmail({
            to: destino?.email,
            subject,
            text,
            html: text.replace(/\n/g, '<br>')
        });
    }
}

module.exports = new AgendamentosController();
