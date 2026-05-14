const STORAGE_KEY_TOKEN = 'token';
const API_URL = 'http://localhost:3000/auth';

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

const validateBrazilianMobile = (phone) => {
    let digits = normalizePhone(phone);
    if (digits.startsWith('55') && digits.length === 13) digits = digits.slice(2);
    if (digits.length !== 11) return false;
    const ddd = Number(digits.slice(0, 2));
    return ddd >= 11 && ddd <= 99 && digits[2] === '9';
};

const calculateAge = (dateValue) => {
    if (!dateValue || dateValue.length !== 10) return null;
    const birth = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
};

const authService = {
    async register({ email, senha, nome, telefone, data_nascimento, foto_perfil }) {
        if (!nome || !email || !senha) throw new Error('Nome, email e senha são obrigatórios.');
        if (!validateEmail(email)) throw new Error('Insira um email válido.');
        if (!validateBrazilianMobile(telefone)) throw new Error('Insira um número de celular válido.');
        const idade = calculateAge(data_nascimento);
        if (idade === null || idade > 100) throw new Error('Data inválida');
        if (idade < 18) throw new Error('Plataforma valida apenas para maiores de 18 anos!');
        if (senha.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');

        const response = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, telefone, data_nascimento, foto_perfil })
        });

        const data = await response.json();
        if (!response.ok || !data.sucesso) throw new Error(data.mensagem || 'Erro ao registrar.');

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
