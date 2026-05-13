
const DEFAULT_USERS = [
    {
        email: 'admin@agendaflow.com',
        senha: 'Senha123!',
        nome: 'Administrador'
    }
];

const STORAGE_KEY_USERS = 'agendaFlowUsers';
const STORAGE_KEY_TOKEN = 'token';

const encodeBase64 = (value) => {
    const encoded = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
    });
    return btoa(encoded).replace(/=+$/, '');
};

const createToken = (payload) => {
    const header = encodeBase64(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = encodeBase64(JSON.stringify(payload));
    return `${header}.${body}.`;
};

const getStoredUsers = () => {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
        return [...DEFAULT_USERS];
    }

    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
            return [...DEFAULT_USERS];
        }
        return parsed;
    } catch (error) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
        return [...DEFAULT_USERS];
    }
};

const saveStoredUsers = (users) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const authService = {
    register({ email, senha, nome }) {
        if (!nome || !email || !senha) {
            throw new Error('Nome, email e senha são obrigatórios.');
        }

        if (!validateEmail(email)) {
            throw new Error('Insira um email válido.');
        }

        if (senha.length < 6) {
            throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }

        const users = getStoredUsers();
        const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

        if (existing) {
            throw new Error('Já existe um usuário cadastrado com este email.');
        }

        const newUser = { email, senha, nome };
        users.push(newUser);
        saveStoredUsers(users);
        return newUser;
    },

    login(email, senha) {
        if (!email || !senha) {
            throw new Error('Email e senha são obrigatórios.');
        }

        if (!validateEmail(email)) {
            throw new Error('Informe um email válido.');
        }

        if (senha.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }

        const users = getStoredUsers();
        const user = users.find((stored) => stored.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        if (user.senha !== senha) {
            throw new Error('Senha inválida.');
        }

        const token = createToken({
            email: user.email,
            nome: user.nome,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
        });

        this.saveToken(token);
        return {
            token,
            user: {
                email: user.email,
                nome: user.nome
            }
        };
    },

    saveToken(token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
    },

    getToken() {
        return localStorage.getItem(STORAGE_KEY_TOKEN);
    },

    logout() {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        window.location.href = './login.html';
    },

    isTokenExpired(token) {
        if (!token) {
            return true;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp && payload.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    },

    getUserFromToken(token) {
        if (!token) {
            token = this.getToken();
        }

        if (!token) {
            return null;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
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