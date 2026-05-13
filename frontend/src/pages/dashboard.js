document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmailElement = document.getElementById("userEmail");
  const navItems = document.querySelectorAll(".sidebar li[data-view]");
  const views = document.querySelectorAll(".view");
  const sidebar = document.querySelector(".sidebar");
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const saveConfigBtn = document.getElementById("saveConfigBtn");
  const themeLight = document.getElementById("themeLight");
  const themeDark = document.getElementById("themeDark");
  const weekStart = document.getElementById("weekStart");
  const notificationToggle = document.getElementById("notificationToggle");
  const notificationStateLabel = document.getElementById("notificationStateLabel");
  const notificationsCard = document.getElementById("notificationsCard");
  const showEmptySlots = document.getElementById("showEmptySlots");
  
  const newSpaceBtn = document.getElementById("newSpaceBtn");
  const newBlockBtn = document.getElementById("newBlockBtn");
  const newReminderBtn = document.getElementById("newReminderBtn");
  const spacesTableBody = document.getElementById("spacesTableBody");
  const scheduleBlocksList = document.getElementById("scheduleBlocksList");
  const reminderList = document.getElementById("reminderList");
  const modalOverlay = document.getElementById("modalOverlay");

  const spaceModal = document.getElementById("spaceModal");
  const blockModal = document.getElementById("blockModal");
  const reminderModal = document.getElementById("reminderModal");

  const spaceForm = document.getElementById("spaceForm");
  const blockForm = document.getElementById("blockForm");
  const reminderForm = document.getElementById("reminderForm");

  const spaceName = document.getElementById("spaceName");
  const spaceCapacity = document.getElementById("spaceCapacity");
  const spaceStatus = document.getElementById("spaceStatus");
  const spaceIdInput = document.getElementById("spaceId");

  const blockDay = document.getElementById("blockDay");
  const blockStart = document.getElementById("blockStart");
  const blockEnd = document.getElementById("blockEnd");
  const blockReason = document.getElementById("blockReason");
  const blockIdInput = document.getElementById("blockId");

  const reminderTitle = document.getElementById("reminderTitle");
  const reminderTime = document.getElementById("reminderTime");
  const reminderNotes = document.getElementById("reminderNotes");
  const reminderStatus = document.getElementById("reminderStatus");
  const reminderIdInput = document.getElementById("reminderId");

  const logout = () => authService.logout();

  const token = authService.getToken();
  const user = authService.getUserFromToken(token);
  userEmailElement.textContent = user?.email || "Administrador";

  // Estado Local da UI
  let spaces = [];
  let blocks = [];
  let reminders = [];

  const openModal = (modalElement) => {
    modalOverlay.classList.remove("hidden");
    modalElement.classList.remove("hidden");
  };

  const closeModal = (modalElement) => {
    modalOverlay.classList.add("hidden");
    modalElement.classList.add("hidden");
    modalElement.querySelector("form")?.reset();
    modalElement.querySelector('input[type="hidden"]') &&
      (modalElement.querySelector('input[type="hidden"]').value = "");
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle("dark-mode", theme === "dark");
  };

  const validateBlockTimes = () => {
    if (!blockStart.value || !blockEnd.value) {
      blockEnd.setCustomValidity("");
      return true;
    }
    if (blockEnd.value <= blockStart.value) {
      blockEnd.setCustomValidity("O horário de fim deve ser maior que o horário de início.");
      blockEnd.reportValidity();
      return false;
    }
    blockEnd.setCustomValidity("");
    return true;
  };

  blockStart.addEventListener("change", validateBlockTimes);
  blockEnd.addEventListener("input", validateBlockTimes);

  const updateNotificationState = () => {
    if (!notificationToggle.checked) {
      notificationStateLabel.textContent = "Desativado";
      notificationStateLabel.style.color = "#6B7280";
    } else {
      notificationStateLabel.textContent = "Ativo";
      notificationStateLabel.style.color = "#2563EB";
    }
  };

  notificationToggle.addEventListener("change", () => {
    updateNotificationState();
    if (!notificationsCard) return;
    notificationsCard.classList.add("active");
    setTimeout(() => notificationsCard.classList.remove("active"), 900);
  });

  const carregarDadosDoBanco = async () => {
    try {
        const [resEspacos, resBloqueios, resLembretes, resConfig] = await Promise.all([
            api.request('/espacos'),
            api.request('/bloqueios'),
            api.request('/lembretes'),
            api.request('/configuracoes')
        ]);

        if (resEspacos.sucesso) spaces = resEspacos.espacos;
        if (resBloqueios.sucesso) blocks = resBloqueios.bloqueios;
        if (resLembretes.sucesso) reminders = resLembretes.lembretes;
        if (resConfig.sucesso) {
            const cfg = resConfig.configuracoes;
            applyTheme(cfg.theme || 'light');
            themeLight.checked = cfg.theme !== 'dark';
            themeDark.checked = cfg.theme === 'dark';
            weekStart.value = cfg.visualizacao_padrao === 'semanal' ? 'monday' : 'sunday';
            updateNotificationState();
        }
        updateDashboard();
    } catch (error) {
        console.error("Erro ao puxar dados do Supabase:", error);
    }
  };

  const renderDashboardMetrics = async () => {
    const cards = document.querySelectorAll(".cards .card");
    try {
      const response = await api.request('/dashboard/stats');
      if (response.sucesso && cards.length >= 4) {
        const stats = response.stats;
        cards[0].querySelector("p").textContent = `${stats.agendamentosHoje} hoje`;
        cards[0].querySelector(".card-meta").textContent = `Agendamentos do dia`;
        cards[1].querySelector("p").textContent = `${stats.totalClientes} cadastrados`;
        cards[1].querySelector(".card-meta").textContent = `Clientes na base`;
        cards[2].querySelector("p").textContent = `${stats.espacosDisponiveis} disponíveis`;
        cards[2].querySelector(".card-meta").textContent = `Espaços ativos`;
        cards[3].querySelector("p").textContent = `${stats.lembretesPendentes} pendentes`;
        cards[3].querySelector(".card-meta").textContent = stats.lembretesPendentes > 0 ? `Lembretes a enviar` : "Tudo em dia";
      }
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      if (cards.length >= 4) {
        cards[0].querySelector("p").textContent = `0 hoje`;
        cards[0].querySelector(".card-meta").textContent = ``;
        cards[1].querySelector("p").textContent = `0 cadastrados`;
        cards[1].querySelector(".card-meta").textContent = ``;
        cards[2].querySelector("p").textContent = `0 disponíveis`;
        cards[2].querySelector(".card-meta").textContent = ``;
        cards[3].querySelector("p").textContent = `0 totais`;
        cards[3].querySelector(".card-meta").textContent = ``;
      }
    }
  };

  const renderSpaces = () => {
    spacesTableBody.innerHTML = spaces.map(space => `
      <tr>
        <td>${space.name}</td>
        <td>${space.capacity} pessoas</td>
        <td><span class="status ${space.status === "Ativo" ? "status-active" : "status-disabled"}">${space.status}</span></td>
        <td>
          <button class="secondary edit-space" data-id="${space.id}">Editar</button>
          <button class="secondary delete-space" data-id="${space.id}">Excluir</button>
        </td>
      </tr>
    `).join("");

    spacesTableBody.querySelectorAll(".edit-space").forEach(button => {
      button.addEventListener("click", () => {
        const item = spaces.find(s => s.id === button.dataset.id);
        if (!item) return;
        spaceName.value = item.name;
        spaceCapacity.value = item.capacity;
        spaceStatus.value = item.status;
        spaceIdInput.value = item.id;
        spaceModal.querySelector("#spaceModalTitle").textContent = "Editar espaço";
        openModal(spaceModal);
      });
    });

    spacesTableBody.querySelectorAll(".delete-space").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        try {
            await api.request(`/espacos/${id}`, 'DELETE');
            spaces = spaces.filter(space => space.id !== id);
            renderSpaces();
            renderDashboardMetrics();
        } catch(e) { alert("Erro ao excluir espaço."); }
      });
    });
  };

  const renderScheduleBlocks = () => {
    scheduleBlocksList.innerHTML = blocks.map(block => `
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
    `).join("");

    scheduleBlocksList.querySelectorAll(".edit-block").forEach(button => {
      button.addEventListener("click", () => {
        const block = blocks.find(b => b.id === button.dataset.id);
        if (!block) return;
        blockDay.value = block.day;
        blockStart.value = block.start.substring(0,5);
        blockEnd.value = block.end.substring(0,5);
        blockReason.value = block.reason;
        blockIdInput.value = block.id;
        blockModal.querySelector("#blockModalTitle").textContent = "Editar bloqueio";
        openModal(blockModal);
      });
    });

    scheduleBlocksList.querySelectorAll(".delete-block").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        try {
            await api.request(`/bloqueios/${id}`, 'DELETE');
            blocks = blocks.filter(b => b.id !== id);
            renderScheduleBlocks();
        } catch(e) { alert("Erro ao excluir bloqueio."); }
      });
    });
  };

  const renderReminderList = () => {
    reminderList.innerHTML = reminders.map(reminder => `
      <div class="reminder-card">
        <div>
          <h3>${reminder.title}</h3>
          <p>${reminder.notes} • ${reminder.time}</p>
        </div>
        <div class="reminder-actions">
          <span class="tag ${reminder.status === "Ativo" ? "tag-info" : reminder.status === "Pendente" ? "tag-warning" : "tag-success"}">${reminder.status}</span>
          <button class="secondary edit-reminder" data-id="${reminder.id}">Editar</button>
        </div>
      </div>
    `).join("");

    reminderList.querySelectorAll(".edit-reminder").forEach(button => {
      button.addEventListener("click", () => {
        const reminder = reminders.find(r => r.id === button.dataset.id);
        if (!reminder) return;
        reminderTitle.value = reminder.title;
        reminderTime.value = reminder.time;
        reminderNotes.value = reminder.notes;
        reminderStatus.value = reminder.status;
        reminderIdInput.value = reminder.id;
        reminderModal.querySelector("#reminderModalTitle").textContent = "Editar lembrete";
        openModal(reminderModal);
      });
    });
  };

  const saveConfig = async () => {
    const selectedTheme = themeDark.checked ? "dark" : "light";
    try {
        await api.request('/configuracoes', 'PUT', {
            theme: selectedTheme,
            weekStart: weekStart.value,
            notifications: notificationToggle.checked,
            showEmptySlots: showEmptySlots.checked
        });
        applyTheme(selectedTheme);
        alert("Configurações salvas no Banco de Dados!");
    } catch(e) {
        alert("Erro ao salvar configurações");
    }
  };

  const setActiveView = (viewName) => {
    views.forEach((section) => {
      section.classList.toggle("active", section.id === `view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
    });
    navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.view === viewName);
    });
    if (window.innerWidth <= 900) sidebar.classList.remove("open");
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => setActiveView(item.dataset.view));
  });

  const handleModalClose = () => {
    [spaceModal, blockModal, reminderModal].forEach((modal) => {
      if (!modal.classList.contains("hidden")) closeModal(modal);
    });
  };

  const resetForms = () => {
    spaceForm.reset();
    blockForm.reset();
    reminderForm.reset();
    spaceIdInput.value = "";
    blockIdInput.value = "";
    reminderIdInput.value = "";
  };

  const updateDashboard = () => {
    renderDashboardMetrics();
    renderSpaces();
    renderScheduleBlocks();
    renderReminderList();
  };

  document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");
      if (modal) closeModal(modal);
    });
  });

  modalOverlay.addEventListener("click", handleModalClose);

  newSpaceBtn.addEventListener("click", () => {
    resetForms();
    spaceModal.querySelector("#spaceModalTitle").textContent = "Novo espaço";
    openModal(spaceModal);
  });

  newBlockBtn.addEventListener("click", () => {
    resetForms();
    blockModal.querySelector("#blockModalTitle").textContent = "Novo bloqueio";
    openModal(blockModal);
  });

  newReminderBtn.addEventListener("click", () => {
    resetForms();
    reminderModal.querySelector("#reminderModalTitle").textContent = "Novo lembrete";
    openModal(reminderModal);
  });

  // SUBMITS CONECTADOS À API 
  spaceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = spaceIdInput.value;
    const payload = {
      name: spaceName.value.trim(),
      capacity: Number(spaceCapacity.value),
      status: spaceStatus.value,
    };
    try {
        const res = id ? await api.request(`/espacos/${id}`, 'PUT', payload) : await api.request('/espacos', 'POST', payload);
        if (res.sucesso) {
            if (id) spaces = spaces.map(s => s.id === id ? res.espaco : s);
            else spaces.push(res.espaco);
            updateDashboard();
            closeModal(spaceModal);
        }
    } catch(e) { alert("Falha ao salvar espaço."); }
  });

  blockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateBlockTimes()) return;
    const id = blockIdInput.value;
    const payload = {
      day: blockDay.value,
      start: blockStart.value,
      end: blockEnd.value,
      reason: blockReason.value.trim(),
    };
    try {
        const res = id ? await api.request(`/bloqueios/${id}`, 'PUT', payload) : await api.request('/bloqueios', 'POST', payload);
        if (res.sucesso) {
            if (id) blocks = blocks.map(b => b.id === id ? res.bloqueio : b);
            else blocks.push(res.bloqueio);
            updateDashboard();
            closeModal(blockModal);
        }
    } catch(e) { alert("Falha ao salvar bloqueio."); }
  });

  reminderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = reminderIdInput.value;
    const payload = {
      title: reminderTitle.value.trim(),
      time: reminderTime.value,
      notes: reminderNotes.value.trim(),
      status: reminderStatus.value,
    };
    try {
        const res = id ? await api.request(`/lembretes/${id}`, 'PUT', payload) : await api.request('/lembretes', 'POST', payload);
        if (res.sucesso) {
            if (id) reminders = reminders.map(r => r.id === id ? res.lembrete : r);
            else reminders.push(res.lembrete);
            updateDashboard();
            closeModal(reminderModal);
        }
    } catch(e) { alert("Falha ao salvar lembrete."); }
  });

  saveConfigBtn.addEventListener("click", saveConfig);

  mobileNavToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 900 && sidebar.classList.contains("open")) {
      if (!sidebar.contains(event.target) && event.target !== mobileNavToggle) sidebar.classList.remove("open");
    }
  });

  logoutBtn.addEventListener("click", logout);

  // INICIALIZAÇÃO
  carregarDadosDoBanco();
});
