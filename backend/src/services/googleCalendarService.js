const { google } = require('googleapis');
const supabase = require('../config/database');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const getAppUrl = () => (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

const hasGoogleConfig = () => Boolean(
    process.env.GOOGLE_CLIENT_ID
    && process.env.GOOGLE_CLIENT_SECRET
    && process.env.GOOGLE_REDIRECT_URI
);

const createOAuthClient = () => new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const ensureConfigured = () => {
    if (!hasGoogleConfig()) {
        throw new Error('Google Calendar não configurado. Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI.');
    }
};

const buildEvent = (agendamento) => {
    const clienteNome = agendamento.cliente_usuario?.nome || agendamento.clientes?.nome || 'Cliente';
    const profissionalNome = agendamento.usuario?.nome || 'Profissional';
    const sala = agendamento.espacos?.nome || agendamento.espaco?.nome || 'Sem sala';

    return {
        summary: `AgendaFlow: ${clienteNome} com ${profissionalNome}`,
        description: [
            `Cliente: ${clienteNome}`,
            `Profissional: ${profissionalNome}`,
            `Formato: ${agendamento.formato || 'presencial'}`,
            `Sala: ${agendamento.formato === 'hibrido' ? 'Não necessária' : sala}`,
            agendamento.observacoes ? `Observações: ${agendamento.observacoes}` : null
        ].filter(Boolean).join('\n'),
        location: agendamento.formato === 'hibrido' ? undefined : sala,
        start: {
            dateTime: agendamento.data_hora_inicio,
            timeZone: 'America/Bahia'
        },
        end: {
            dateTime: agendamento.data_hora_fim,
            timeZone: 'America/Bahia'
        }
    };
};

const getTokenRow = async (usuarioId) => {
    const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

    if (error) {
        if (error.code === '42P01') {
            console.warn('Tabela google_calendar_tokens não existe.');
            return null;
        }
        throw error;
    }

    return data;
};

const getAuthorizedClient = async (usuarioId) => {
    ensureConfigured();
    const tokenRow = await getTokenRow(usuarioId);
    if (!tokenRow) return null;

    const auth = createOAuthClient();
    auth.setCredentials({
        access_token: tokenRow.access_token,
        refresh_token: tokenRow.refresh_token,
        scope: tokenRow.scope,
        token_type: tokenRow.token_type,
        expiry_date: tokenRow.expiry_date
    });

    auth.on('tokens', async (tokens) => {
        const update = {
            atualizado_em: new Date().toISOString()
        };
        if (tokens.access_token) update.access_token = tokens.access_token;
        if (tokens.refresh_token) update.refresh_token = tokens.refresh_token;
        if (tokens.expiry_date) update.expiry_date = tokens.expiry_date;
        await supabase.from('google_calendar_tokens').update(update).eq('usuario_id', usuarioId);
    });

    return auth;
};

const saveTokens = async (usuarioId, tokens) => {
    const auth = createOAuthClient();
    auth.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const { data: profile } = await oauth2.userinfo.get().catch(() => ({ data: {} }));

    const payload = {
        usuario_id: usuarioId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
        google_email: profile.email || null,
        atualizado_em: new Date().toISOString()
    };

    const { error } = await supabase
        .from('google_calendar_tokens')
        .upsert(payload, { onConflict: 'usuario_id' });

    if (error) throw error;
};

const createAuthUrl = (usuarioId) => {
    ensureConfigured();
    const auth = createOAuthClient();
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [...SCOPES, 'https://www.googleapis.com/auth/userinfo.email'],
        state: usuarioId
    });
};

const exchangeCode = async (code, usuarioId) => {
    ensureConfigured();
    const auth = createOAuthClient();
    const { tokens } = await auth.getToken(code);
    if (!tokens.refresh_token) {
        throw new Error('O Google não retornou refresh token. Revogue o acesso anterior e tente conectar novamente.');
    }
    await saveTokens(usuarioId, tokens);
};

const createEventForUser = async (usuarioId, agendamento) => {
    const auth = await getAuthorizedClient(usuarioId);
    if (!auth) return { synced: false, reason: 'not_connected' };

    const calendar = google.calendar({ version: 'v3', auth });
    const event = buildEvent(agendamento);
    const { data } = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
    });

    return { synced: true, eventId: data.id, htmlLink: data.htmlLink };
};

const syncAppointment = async (agendamento) => {
    const targets = [...new Set([
        agendamento.cliente_usuario_id,
        agendamento.usuario_id
    ].filter(Boolean))];

    const results = [];
    for (const usuarioId of targets) {
        try {
            const result = await createEventForUser(usuarioId, agendamento);
            results.push({ usuarioId, ...result });
        } catch (error) {
            console.error('Erro ao sincronizar Google Calendar:', { usuarioId, erro: error.message });
            results.push({ usuarioId, synced: false, reason: error.message });
        }
    }

    return results;
};

const disconnect = async (usuarioId) => {
    const token = await getTokenRow(usuarioId);
    if (token?.refresh_token && hasGoogleConfig()) {
        const auth = createOAuthClient();
        await auth.revokeToken(token.refresh_token).catch(() => null);
    }

    const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('usuario_id', usuarioId);
    if (error && error.code !== '42P01') throw error;
};

module.exports = {
    createAuthUrl,
    exchangeCode,
    getTokenRow,
    syncAppointment,
    disconnect,
    getAppUrl
};
