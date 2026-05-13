const token = localStorage.getItem('token');

const isTokenExpired = (tokenValue) => {
    if (!tokenValue) {
        return true;
    }

    try {
        const payload = JSON.parse(atob(tokenValue.split('.')[1]));
        return payload.exp && payload.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    window.location.href = './login.html';
}