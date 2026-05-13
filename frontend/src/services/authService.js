const STORAGE_KEY_TOKEN = 'token';
const API_URL = 'http://localhost:3000/auth';

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const authService = {
    async register({ email, senha, nome, telefone, data_nascimento, foto_perfil }) {
        if (!nome || !email || !senha) throw new Error('Nome, email e senha são obrigatórios.');
        if (!validateEmail(email)) throw new Error('Insira um email válido.');
        if (senha.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');

        const response = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, telefone, data_nascimento, foto_perfil })
        });

        const data = await response.json();
        if (!response.ok || !data.sucesso) throw new Error(data.mensagem || 'Erro ao registrar.');

        this.saveToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        return data;
    },

    async login(email, senha) {
        if (!email || !senha) throw new Error('Email e senha são obrigatórios.');
        if (!validateEmail(email)) throw new Error('Informe um email válido.');
        if (senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        if (!response.ok || !data.sucesso) throw new Error(data.mensagem || 'Credenciais inválidas.');

        this.saveToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        return data;
    },

    saveToken(token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
    },

    getToken() {
        return localStorage.getItem(STORAGE_KEY_TOKEN);
    },

    logout() {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem('user');
        window.location.href = './login.html';
    },

    isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp && payload.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    },

    getUserFromToken(token) {
        if (!token) token = this.getToken();
        if (!token) return null;
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
            return null;
        }
    },

    isAuthenticated() {
        const token = this.getToken();
        return Boolean(token) && !this.isTokenExpired(token);
    }
};

window.authService = authService;