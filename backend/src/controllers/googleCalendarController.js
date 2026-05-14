const googleCalendarService = require('../services/googleCalendarService');

class GoogleCalendarController {
    async authUrl(req, res) {
        try {
            const url = googleCalendarService.createAuthUrl(req.auth.id);
            res.json({ sucesso: true, url });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async callback(req, res) {
        try {
            const { code, state } = req.query;
            if (!code || !state) {
                return res.status(400).send('Código de autorização inválido.');
            }

            await googleCalendarService.exchangeCode(code, state);
            res.send(`
                <!doctype html>
                <html lang="pt-BR">
                  <body style="font-family: Arial, sans-serif; padding: 32px;">
                    <h2>Google Calendar conectado com sucesso.</h2>
                    <p>Você já pode fechar esta aba e voltar para o AgendaFlow.</p>
                    <script>
                      if (window.opener) window.opener.postMessage({ type: 'GOOGLE_CALENDAR_CONNECTED' }, '*');
                      setTimeout(() => window.close(), 1200);
                    </script>
                  </body>
                </html>
            `);
        } catch (error) {
            res.status(500).send(`Erro ao conectar Google Calendar: ${error.message}`);
        }
    }

    async status(req, res) {
        try {
            const token = await googleCalendarService.getTokenRow(req.auth.id);
            res.json({
                sucesso: true,
                conectado: Boolean(token),
                google_email: token?.google_email || null
            });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }

    async disconnect(req, res) {
        try {
            await googleCalendarService.disconnect(req.auth.id);
            res.json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: error.message });
        }
    }
}

module.exports = new GoogleCalendarController();
