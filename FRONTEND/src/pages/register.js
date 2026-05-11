document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmSenhaInput = document.getElementById('confirmSenha');
    const themeToggle = document.getElementById('themeToggle');
    const errorElement = document.getElementById('registerError');
    const body = document.body;

    const updateTheme = (dark) => {
        body.classList.toggle('dark-mode', dark);
        body.setAttribute('data-theme', dark ? 'dark' : 'light');
    };

    const isEmailValid = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    themeToggle.addEventListener('change', (event) => {
        updateTheme(event.target.checked);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        errorElement.textContent = '';

        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();
        const confirmSenha = confirmSenhaInput.value.trim();

        if (!nome || !email || !senha || !confirmSenha) {
            errorElement.textContent = 'Todos os campos são obrigatórios.';
            return;
        }

        if (!isEmailValid(email)) {
            errorElement.textContent = 'Informe um email válido.';
            return;
        }

        if (senha.length < 6) {
            errorElement.textContent = 'A senha deve ter pelo menos 6 caracteres.';
            return;
        }

        if (senha !== confirmSenha) {
            errorElement.textContent = 'As senhas não coincidem.';
            return;
        }

        try {
            authService.register({ nome, email, senha });
            window.location.href = './login.html';
        } catch (error) {
            errorElement.textContent = error.message || 'Erro ao cadastrar usuário.';
        }
    });
});