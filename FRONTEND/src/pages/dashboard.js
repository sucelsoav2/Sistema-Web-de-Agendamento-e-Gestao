document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailElement = document.getElementById('userEmail');
    const navItems = document.querySelectorAll('.sidebar li[data-view]');
    const views = document.querySelectorAll('.view');
    const sidebar = document.querySelector('.sidebar');
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const themeLight = document.getElementById('themeLight');
    const themeDark = document.getElementById('themeDark');
    const weekStart = document.getElementById('weekStart');
    const notificationToggle = document.getElementById('notificationToggle');
    const showEmptySlots = document.getElementById('showEmptySlots');

    const token = authService.getToken();
    const user = authService.getUserFromToken(token);

    userEmailElement.textContent = user?.email || 'Administrador';

    const SETTINGS_STORAGE_KEY = 'agendaFlowSettings';

    const defaultSettings = {
        theme: 'light',
        weekStart: 'monday',
        notifications: true,
        showEmptySlots: true
    };

    const getSettings = () => {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
            return defaultSettings;
        }

        try {
            return JSON.parse(stored);
        } catch (error) {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
            return defaultSettings;
        }
    };

    const saveSettings = (settings) => {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    };

    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
    };

    const loadSettings = () => {
        const settings = getSettings();
        applyTheme(settings.theme);
        themeLight.checked = settings.theme === 'light';
        themeDark.checked = settings.theme === 'dark';
        weekStart.value = settings.weekStart;
        notificationToggle.checked = settings.notifications;
        showEmptySlots.checked = settings.showEmptySlots;
    };

    const saveConfig = () => {
        const selectedTheme = themeDark.checked ? 'dark' : 'light';
        const settings = {
            theme: selectedTheme,
            weekStart: weekStart.value,
            notifications: notificationToggle.checked,
            showEmptySlots: showEmptySlots.checked
        };
        saveSettings(settings);
        applyTheme(settings.theme);
        alert('Configurações salvas!');
    };

    const setActiveView = (viewName) => {
        views.forEach((section) => {
            section.classList.toggle('active', section.id === `view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
        });
        navItems.forEach((item) => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
        if (window.innerWidth <= 900) {
            sidebar.classList.remove('open');
        }
    };

    navItems.forEach((item) => {
        item.addEventListener('click', () => {
            setActiveView(item.dataset.view);
        });
    });

    saveConfigBtn.addEventListener('click', () => {
        saveConfig();
    });

    mobileNavToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 900 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== mobileNavToggle) {
                sidebar.classList.remove('open');
            }
        }
    });

    logoutBtn.addEventListener('click', () => {
        authService.logout();
    });

    loadSettings();
});