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
    const notificationStateLabel = document.getElementById('notificationStateLabel');
    const notificationsCard = document.getElementById('notificationsCard');
    const showEmptySlots = document.getElementById('showEmptySlots');
    const newSpaceBtn = document.getElementById('newSpaceBtn');
    const newBlockBtn = document.getElementById('newBlockBtn');
    const newReminderBtn = document.getElementById('newReminderBtn');
    const spacesTableBody = document.getElementById('spacesTableBody');
    const scheduleBlocksList = document.getElementById('scheduleBlocksList');
    const reminderList = document.getElementById('reminderList');
    const modalOverlay = document.getElementById('modalOverlay');

    const spaceModal = document.getElementById('spaceModal');
    const blockModal = document.getElementById('blockModal');
    const reminderModal = document.getElementById('reminderModal');

    const spaceForm = document.getElementById('spaceForm');
    const blockForm = document.getElementById('blockForm');
    const reminderForm = document.getElementById('reminderForm');

    const spaceName = document.getElementById('spaceName');
    const spaceCapacity = document.getElementById('spaceCapacity');
    const spaceStatus = document.getElementById('spaceStatus');
    const spaceIdInput = document.getElementById('spaceId');

    const blockDay = document.getElementById('blockDay');
    const blockStart = document.getElementById('blockStart');
    const blockEnd = document.getElementById('blockEnd');
    const blockReason = document.getElementById('blockReason');
    const blockIdInput = document.getElementById('blockId');

    const reminderTitle = document.getElementById('reminderTitle');
    const reminderTime = document.getElementById('reminderTime');
    const reminderNotes = document.getElementById('reminderNotes');
    const reminderStatus = document.getElementById('reminderStatus');
    const reminderIdInput = document.getElementById('reminderId');

    const logout = () => authService.logout();

    const token = authService.getToken();
    const user = authService.getUserFromToken(token);
    userEmailElement.textContent = user?.email || 'Administrador';

    const SETTINGS_STORAGE_KEY = 'agendaFlowSettings';
    const SPACES_STORAGE_KEY = 'agendaFlowSpaces';
    const BLOCKS_STORAGE_KEY = 'agendaFlowBlocks';
    const REMINDERS_STORAGE_KEY = 'agendaFlowReminders';

    const defaultSettings = {
        theme: 'light',
        weekStart: 'monday',
        notifications: true,
        showEmptySlots: true
    };

    const defaultSpaces = [
        { id: 'space-1', name: 'Sala Azul', capacity: 12, status: 'Ativo' },
        { id: 'space-2', name: 'Auditório', capacity: 40, status: 'Reservado' },
        { id: 'space-3', name: 'Salão Verde', capacity: 20, status: 'Ativo' }
    ];

    const defaultBlocks = [
        { id: 'block-1', day: 'Segunda', start: '09:00', end: '11:00', reason: 'Manutenção' },
        { id: 'block-2', day: 'Terça', start: '14:00', end: '16:00', reason: 'Evento interno' },
        { id: 'block-3', day: 'Quarta', start: '08:00', end: '10:00', reason: 'Reunião geral' }
    ];

    const defaultReminders = [
        { id: 'reminder-1', title: 'Reunião com cliente', time: '09:30', notes: 'Enviar link da reunião', status: 'Ativo' },
        { id: 'reminder-2', title: 'Verificar agenda do dia', time: '08:00', notes: 'Revisar compromissos', status: 'Pendente' },
        { id: 'reminder-3', title: 'Confirmação de espaço', time: '10:00', notes: 'Confirmar disponibilidade', status: 'Concluído' }
    ];

    const getStored = (key, defaultValue) => {
        const raw = localStorage.getItem(key);
        if (!raw) {
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue.slice ? [...defaultValue] : { ...defaultValue };
        }
        try {
            return JSON.parse(raw);
        } catch {
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue.slice ? [...defaultValue] : { ...defaultValue };
        }
    };

    const saveStored = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const getSettings = () => getStored(SETTINGS_STORAGE_KEY, defaultSettings);
    const getSpaces = () => getStored(SPACES_STORAGE_KEY, defaultSpaces);
    const getBlocks = () => getStored(BLOCKS_STORAGE_KEY, defaultBlocks);
    const getReminders = () => getStored(REMINDERS_STORAGE_KEY, defaultReminders);

    let spaces = getSpaces();
    let blocks = getBlocks();
    let reminders = getReminders();

    const openModal = (modalElement) => {
        modalOverlay.classList.remove('hidden');
        modalElement.classList.remove('hidden');
    };

    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
    };

    const validateBlockTimes = () => {
        if (!blockStart.value || !blockEnd.value) {
            blockEnd.setCustomValidity('');
            return true;
        }

        if (blockEnd.value <= blockStart.value) {
            blockEnd.setCustomValidity('O horário de fim deve ser maior que o horário de início.');
            blockEnd.reportValidity();
            return false;
        }

        blockEnd.setCustomValidity('');
        return true;
    };

    blockStart.addEventListener('change', validateBlockTimes);
    blockEnd.addEventListener('input', validateBlockTimes);

    const updateNotificationState = () => {
        if (!notificationToggle.checked) {
            notificationStateLabel.textContent = 'Desativado';
            notificationStateLabel.style.color = '#6B7280';
        } else {
            notificationStateLabel.textContent = 'Ativo';
            notificationStateLabel.style.color = '#2563EB';
        }
    };

    notificationToggle.addEventListener('change', () => {
        updateNotificationState();
        if (!notificationsCard) return;
        notificationsCard.classList.add('active');
        setTimeout(() => notificationsCard.classList.remove('active'), 900);
    });

    updateNotificationState();

    const closeModal = (modalElement) => {
        modalOverlay.classList.add('hidden');
        modalElement.classList.add('hidden');
        modalElement.querySelector('form')?.reset();
        modalElement.querySelector('input[type="hidden"]') && (modalElement.querySelector('input[type="hidden"]').value = '');
    };

    const renderDashboardMetrics = () => {
        const cards = document.querySelectorAll('.cards .card');
        const activeSpaces = spaces.filter(item => item.status === 'Ativo').length;
        const pendingReminders = reminders.filter(item => item.status === 'Pendente').length;

        if (cards.length >= 4) {
            cards[0].querySelector('p').textContent = `${Math.max(15, blocks.length + 9)} hoje`;
            cards[0].querySelector('.card-meta').textContent = `Próximo bloqueio em ${blocks.length ? blocks[0].start : 'sem horário'}`;
            cards[1].querySelector('p').textContent = `${Math.max(100, 80 + reminders.length)} cadastrados`;
            cards[1].querySelector('.card-meta').textContent = `${pendingReminders} novos lembretes`;
            cards[2].querySelector('p').textContent = `${activeSpaces} disponíveis`;
            cards[2].querySelector('.card-meta').textContent = `${spaces.length - activeSpaces} reservados`;
            cards[3].querySelector('p').textContent = `${reminders.length} totais`;
            cards[3].querySelector('.card-meta').textContent = pendingReminders ? `${pendingReminders} pendentes` : 'Tudo em dia';
        }
    };

    const renderSpaces = () => {
        spacesTableBody.innerHTML = spaces.map((space) => `
            <tr>
                <td>${space.name}</td>
                <td>${space.capacity} pessoas</td>
                <td><span class="status ${space.status === 'Ativo' ? 'status-active' : 'status-disabled'}">${space.status}</span></td>
                <td>
                    <button class="secondary edit-space" data-id="${space.id}">Editar</button>
                    <button class="secondary delete-space" data-id="${space.id}">Excluir</button>
                </td>
            </tr>
        `).join('');

        spacesTableBody.querySelectorAll('.edit-space').forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const item = spaces.find(space => space.id === id);
                if (!item) return;
                spaceName.value = item.name;
                spaceCapacity.value = item.capacity;
                spaceStatus.value = item.status;
                spaceIdInput.value = item.id;
                spaceModal.querySelector('#spaceModalTitle').textContent = 'Editar espaço';
                openModal(spaceModal);
            });
        });

        spacesTableBody.querySelectorAll('.delete-space').forEach((button) => {
            button.addEventListener('click', () => {
                spaces = spaces.filter(space => space.id !== button.dataset.id);
                saveStored(SPACES_STORAGE_KEY, spaces);
                renderSpaces();
                renderDashboardMetrics();
            });
        });
    };

    const renderScheduleBlocks = () => {
        scheduleBlocksList.innerHTML = blocks.map((block) => `
            <div class="calendar-card">
                <div>
                    <h3>${block.day}</h3>
                    <p>${block.start} - ${block.end}</p>
                    <span class="tag">${block.reason}</span>
                </div>
                <div class="card-actions">
                    <button class="secondary edit-block" data-id="${block.id}">Editar</button>
                    <button class="secondary delete-block" data-id="${block.id}">Excluir</button>
                </div>
            </div>
        `).join('');

        scheduleBlocksList.querySelectorAll('.edit-block').forEach((button) => {
            button.addEventListener('click', () => {
                const block = blocks.find(item => item.id === button.dataset.id);
                if (!block) return;
                blockDay.value = block.day;
                blockStart.value = block.start;
                blockEnd.value = block.end;
                blockReason.value = block.reason;
                blockIdInput.value = block.id;
                blockModal.querySelector('#blockModalTitle').textContent = 'Editar bloqueio';
                openModal(blockModal);
            });
        });

        scheduleBlocksList.querySelectorAll('.delete-block').forEach((button) => {
            button.addEventListener('click', () => {
                blocks = blocks.filter(item => item.id !== button.dataset.id);
                saveStored(BLOCKS_STORAGE_KEY, blocks);
                renderScheduleBlocks();
                renderDashboardMetrics();
            });
        });
    };

    const renderReminderList = () => {
        reminderList.innerHTML = reminders.map((reminder) => `
            <div class="reminder-card">
                <div>
                    <h3>${reminder.title}</h3>
                    <p>${reminder.notes} • ${reminder.time}</p>
                </div>
                <div class="reminder-actions">
                    <span class="tag ${reminder.status === 'Ativo' ? 'tag-info' : reminder.status === 'Pendente' ? 'tag-warning' : 'tag-success'}">${reminder.status}</span>
                    <button class="secondary edit-reminder" data-id="${reminder.id}">Editar</button>
                </div>
            </div>
        `).join('');

        reminderList.querySelectorAll('.edit-reminder').forEach((button) => {
            button.addEventListener('click', () => {
                const reminder = reminders.find(item => item.id === button.dataset.id);
                if (!reminder) return;
                reminderTitle.value = reminder.title;
                reminderTime.value = reminder.time;
                reminderNotes.value = reminder.notes;
                reminderStatus.value = reminder.status;
                reminderIdInput.value = reminder.id;
                reminderModal.querySelector('#reminderModalTitle').textContent = 'Editar lembrete';
                openModal(reminderModal);
            });
        });
    };

    const loadSettings = () => {
        const settings = getSettings();
        applyTheme(settings.theme);
        themeLight.checked = settings.theme === 'light';
        themeDark.checked = settings.theme === 'dark';
        weekStart.value = settings.weekStart;
        notificationToggle.checked = settings.notifications;
        showEmptySlots.checked = settings.showEmptySlots;
        updateNotificationState();
    };

    const saveConfig = () => {
        const selectedTheme = themeDark.checked ? 'dark' : 'light';
        const settings = {
            theme: selectedTheme,
            weekStart: weekStart.value,
            notifications: notificationToggle.checked,
            showEmptySlots: showEmptySlots.checked
        };

        saveStored(SETTINGS_STORAGE_KEY, settings);
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

    const handleModalClose = () => {
        [spaceModal, blockModal, reminderModal].forEach((modal) => {
            if (!modal.classList.contains('hidden')) {
                closeModal(modal);
            }
        });
    };

    const resetForms = () => {
        spaceForm.reset();
        blockForm.reset();
        reminderForm.reset();
        spaceIdInput.value = '';
        blockIdInput.value = '';
        reminderIdInput.value = '';
    };

    const updateDashboard = () => {
        renderDashboardMetrics();
        renderSpaces();
        renderScheduleBlocks();
        renderReminderList();
    };

    document.querySelectorAll('.close-modal').forEach((button) => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) closeModal(modal);
        });
    });

    modalOverlay.addEventListener('click', handleModalClose);

    newSpaceBtn.addEventListener('click', () => {
        resetForms();
        spaceModal.querySelector('#spaceModalTitle').textContent = 'Novo espaço';
        openModal(spaceModal);
    });

    newBlockBtn.addEventListener('click', () => {
        resetForms();
        blockModal.querySelector('#blockModalTitle').textContent = 'Novo bloqueio';
        openModal(blockModal);
    });

    newReminderBtn.addEventListener('click', () => {
        resetForms();
        reminderModal.querySelector('#reminderModalTitle').textContent = 'Novo lembrete';
        openModal(reminderModal);
    });

    spaceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = spaceIdInput.value || `space-${Date.now()}`;
        const updatedSpace = {
            id,
            name: spaceName.value.trim(),
            capacity: Number(spaceCapacity.value),
            status: spaceStatus.value
        };

        spaces = spaces.filter(item => item.id !== id);
        spaces.push(updatedSpace);
        saveStored(SPACES_STORAGE_KEY, spaces);
        updateDashboard();
        closeModal(spaceModal);
    });

    blockForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validateBlockTimes()) return;

        const id = blockIdInput.value || `block-${Date.now()}`;
        const updatedBlock = {
            id,
            day: blockDay.value,
            start: blockStart.value,
            end: blockEnd.value,
            reason: blockReason.value.trim()
        };

        blocks = blocks.filter(item => item.id !== id);
        blocks.push(updatedBlock);
        saveStored(BLOCKS_STORAGE_KEY, blocks);
        updateDashboard();
        closeModal(blockModal);
    });

    reminderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = reminderIdInput.value || `reminder-${Date.now()}`;
        const updatedReminder = {
            id,
            title: reminderTitle.value.trim(),
            time: reminderTime.value,
            notes: reminderNotes.value.trim(),
            status: reminderStatus.value
        };

        reminders = reminders.filter(item => item.id !== id);
        reminders.push(updatedReminder);
        saveStored(REMINDERS_STORAGE_KEY, reminders);
        updateDashboard();
        closeModal(reminderModal);
    });

    saveConfigBtn.addEventListener('click', saveConfig);

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

    logoutBtn.addEventListener('click', logout);

    loadSettings();
    updateDashboard();
});