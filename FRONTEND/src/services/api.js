// Comunicação com o backend

const API_BASE_URL = 'http://localhost:3000';

const api = {
    async request(path, options = {}) {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });

        const body = await response.json().catch(() => null);
        if (!response.ok) {
            const error = new Error(body?.message || 'Erro na requisição');
            error.response = body;
            throw error;
        }

        return body;
    },

    get(path, options = {}) {
        return this.request(path, { method: 'GET', ...options });
    },

    post(path, body, options = {}) {
        return this.request(path, { method: 'POST', body: JSON.stringify(body), ...options });
    },

    put(path, body, options = {}) {
        return this.request(path, { method: 'PUT', body: JSON.stringify(body), ...options });
    },

    delete(path, options = {}) {
        return this.request(path, { method: 'DELETE', ...options });
    }
};

window.api = api;