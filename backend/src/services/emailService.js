const nodemailer = require('nodemailer');

const hasEmailConfig = () => Boolean(
    process.env.EMAIL_HOST
    && process.env.EMAIL_PORT
    && process.env.EMAIL_USER
    && process.env.EMAIL_PASS
);

const createTransporter = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ to, subject, text, html }) => {
    if (!to) {
        return { sent: false, reason: 'missing_recipient' };
    }

    if (!hasEmailConfig()) {
        console.warn('[emailService] Configuração SMTP ausente. E-mail não enviado.');
        return { sent: false, reason: 'missing_config' };
    }

    const transporter = createTransporter();
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    });

    return { sent: true };
};

module.exports = { sendEmail };
