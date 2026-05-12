document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorElement = document.getElementById('erro');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const submitButton = form.querySelector('button[type="submit"]');

    const isEmailValid = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (authService.isAuthenticated()) {
        window.location.href = './dashboard.html';
        return;
    }

    const showError = (message) => {
        errorElement.textContent = message;
        emailInput.classList.toggle('error-input', Boolean(message));
        senhaInput.classList.toggle('error-input', Boolean(message));
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        showError('');
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            showError('Por favor, preencha email e senha.');
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
            return;
        }

        if (!isEmailValid(email)) {
            showError('Por favor, informe um email válido.');
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
            return;
        }

        if (senha.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres.');
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
            return;
        }

        try {
            authService.login(email, senha);
            window.location.href = './dashboard.html';
        } catch (error) {
            showError(error.message || 'Erro ao autenticar');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });
});