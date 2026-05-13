document.addEventListener("DOMContentLoaded", async () => {
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

  const token = authService.getToken();
  if (!authService.isAuthenticated()) {
      window.location.href = "./login.html";
      return;
  }

  const user = authService.getUserFromToken(token);
  userEmailElement.textContent = user?.email || "Usuário";

  const logout = () => authService.logout();

  let spaces = [];
  let blocks = [];
  let reminders = [];
  let clientes = [];
  let agendamentos = [];
  let usuarios = [];
  let settings = { theme: "light", weekStart: "monday", notifications: true, showEmptySlots: true };

  const carregarDadosDoBanco = async () => {
      try {
          const [resEspacos, resBloqueios, resLembretes, resConfig, resClientes, resAgendamentos, resUsuarios] = await Promise.all([
              api.get('/espacos').catch(() => ({ espacos: [] })),
              api.get('/bloqueios').catch(() => ({ bloqueios: [] })),
              api.get('/lembretes').catch(() => ({ lembretes: [] })),
              api.get('/configuracoes').catch(() => ({ configuracoes: settings })),
              api.get('/clientes').catch(() => ({ clientes: [] })),
              api.get('/agendamentos').catch(() => ({ agendamentos: [] })),
              api.get('/usuarios').catch(() => ({ usuarios: [] }))
          ]);

          spaces = resEspacos.espacos || [];
          blocks = resBloqueios.bloqueios || [];
          reminders = resLembretes.lembretes || [];
          clientes = resClientes.clientes || [];
          agendamentos = resAgendamentos.agendamentos || [];
          usuarios = resUsuarios.usuarios || [];
          if (resConfig.configuracoes && resConfig.configuracoes.id) {
              settings = {
                  id: resConfig.configuracoes.id,
                  theme: resConfig.configuracoes.tema_escuro ? 'dark' : 'light',
                  weekStart: resConfig.configuracoes.inicio_semana || 'monday',
                  notifications: resConfig.configuracoes.notificacoes_ativas ?? true,
                  showEmptySlots: resConfig.configuracoes.mostrar_horarios_vazios ?? true
              };
          }
          loadSettings();
          updateDashboard();
      } catch (error) {
          console.error("Erro ao carregar dados do Supabase", error);
      }
  };

  const openModal = (modalElement) => {
    modalOverlay.classList.remove("hidden");
    modalElement.classList.remove("hidden");
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

  const closeModal = (modalElement) => {
    modalOverlay.classList.add("hidden");
    modalElement.classList.add("hidden");
    modalElement.querySelector("form")?.reset();
    modalElement.querySelector('input[type="hidden"]') && (modalElement.querySelector('input[type="hidden"]').value = "");
  };

  const renderDashboardMetrics = () => {
    const cards = document.querySelectorAll(".cards .card");
    const activeSpaces = spaces.filter((item) => item.status === "Ativo").length;
    const pendingReminders = reminders.filter((item) => item.status === "Pendente").length;

    if (cards.length >= 4) {
      // 0 = Agendamentos
      cards[0].querySelector("p").textContent = `${agendamentos.length} totais`;
      cards[0].querySelector(".card-meta").textContent = agendamentos.length ? `Visualizar painel completo` : "Nenhum agendamento";
      
      // 1 = Clientes
      cards[1].querySelector("p").textContent = `${clientes.length} cadastrados`;
      cards[1].querySelector(".card-meta").textContent = "Base atualizada";
      
      // 2 = Espaços
      cards[2].querySelector("p").textContent = `${activeSpaces} disponíveis`;
      cards[2].querySelector(".card-meta").textContent = `${spaces.length - activeSpaces} inativos / reservados`;
      
      // 3 = Lembretes
      cards[3].querySelector("p").textContent = `${pendingReminders} pendentes`;
      cards[3].querySelector(".card-meta").textContent = `${reminders.length} totais`;
    }
  };

  const renderSpaces = () => {
    spacesTableBody.innerHTML = spaces.map((space) => `
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

    spacesTableBody.querySelectorAll(".edit-space").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const item = spaces.find((space) => String(space.id) === String(id));
        if (!item) return;
        spaceName.value = item.name;
        spaceCapacity.value = item.capacity;
        spaceStatus.value = item.status;
        spaceIdInput.value = item.id;
        spaceModal.querySelector("#spaceModalTitle").textContent = "Editar espaço";
        openModal(spaceModal);
      });
    });

    spacesTableBody.querySelectorAll(".delete-space").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        if(confirm("Deseja realmente excluir o espaço?")) {
            await api.delete(`/espacos/${id}`);
            await carregarDadosDoBanco();
        }
      });
    });
  };

  const renderScheduleBlocks = () => {
    scheduleBlocksList.innerHTML = blocks.map((block) => `
        <div class="calendar-card">
            <div>
                <h3>${block.day || 'Sem dia'}</h3>
                <p>${block.start || '00:00'} - ${block.end || '00:00'}</p>
                <span class="tag">${block.reason || 'Manutenção'}</span>
            </div>
            <div class="card-actions">
                <button class="secondary edit-block" data-id="${block.id}">Editar</button>
                <button class="secondary delete-block" data-id="${block.id}">Excluir</button>
            </div>
        </div>
    `).join("");

    scheduleBlocksList.querySelectorAll(".edit-block").forEach((button) => {
      button.addEventListener("click", () => {
        const block = blocks.find((item) => String(item.id) === String(button.dataset.id));
        if (!block) return;
        blockDay.value = block.day;
        blockStart.value = block.start;
        blockEnd.value = block.end;
        blockReason.value = block.reason;
        blockIdInput.value = block.id;
        blockModal.querySelector("#blockModalTitle").textContent = "Editar bloqueio";
        openModal(blockModal);
      });
    });

    scheduleBlocksList.querySelectorAll(".delete-block").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        if(confirm("Deseja excluir o bloqueio?")) {
            await api.delete(`/bloqueios/${id}`);
            await carregarDadosDoBanco();
        }
      });
    });
  };

  const renderReminderList = () => {
    reminderList.innerHTML = reminders.map((reminder) => `
        <div class="reminder-card">
            <div>
                <h3>${reminder.title}</h3>
                <p>${reminder.notes || ''} • ${reminder.time}</p>
            </div>
            <div class="reminder-actions">
                <span class="tag ${reminder.status === "Ativo" ? "tag-info" : reminder.status === "Pendente" ? "tag-warning" : "tag-success"}">${reminder.status}</span>
                <button class="secondary edit-reminder" data-id="${reminder.id}">Editar</button>
                <button class="secondary delete-reminder" data-id="${reminder.id}">Excluir</button>
            </div>
        </div>
    `).join("");

    reminderList.querySelectorAll(".edit-reminder").forEach((button) => {
      button.addEventListener("click", () => {
        const reminder = reminders.find((item) => String(item.id) === String(button.dataset.id));
        if (!reminder) return;
        reminderTitle.value = reminder.title;
        reminderTime.value = reminder.time;
        reminderNotes.value = reminder.notes || '';
        reminderStatus.value = reminder.status || 'Pendente';
        reminderIdInput.value = reminder.id;
        reminderModal.querySelector("#reminderModalTitle").textContent = "Editar lembrete";
        openModal(reminderModal);
      });
    });

    reminderList.querySelectorAll(".delete-reminder").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        if(confirm("Excluir lembrete?")) {
            await api.delete(`/lembretes/${id}`);
            await carregarDadosDoBanco();
        }
      });
    });
  };

  const usuariosTableBody = document.getElementById("usuariosTableBody");
  const userFilter = document.getElementById("userFilter");

  const renderUsuarios = () => {
    if (!usuariosTableBody) return;
    const filter = userFilter ? userFilter.value : 'todos';
    
    const filtrados = usuarios.filter(u => filter === 'todos' || String(u.role_id) === filter);

    usuariosTableBody.innerHTML = filtrados.map((u) => `
        <tr>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td><span class="tag ${u.role_id === 3 ? 'tag-warning' : u.role_id === 2 ? 'tag-info' : 'tag-success'}">${u.role_name}</span></td>
            <td><span class="status ${u.ativo ? "status-active" : "status-disabled"}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
            <td>
                <select class="change-role" data-id="${u.id}" style="padding:4px; font-size:12px;">
                    <option value="1" ${u.role_id === 1 ? 'selected' : ''}>Cliente</option>
                    <option value="2" ${u.role_id === 2 ? 'selected' : ''}>Profissional</option>
                    <option value="3" ${u.role_id === 3 ? 'selected' : ''}>Admin</option>
                </select>
            </td>
        </tr>
    `).join("");

    usuariosTableBody.querySelectorAll(".change-role").forEach((select) => {
        select.addEventListener("change", async (e) => {
            const id = e.target.dataset.id;
            const newRole = e.target.value;
            try {
                const res = await api.put(`/usuarios/${id}/cargo`, { role_id: parseInt(newRole) });
                if(res.sucesso === false) {
                  alert(res.erro || "Erro ao alterar cargo");
                }
                await carregarDadosDoBanco();
            } catch(error) {
                alert("Acesso negado ou erro interno.");
                await carregarDadosDoBanco();
            }
        });
    });
  };

  if (userFilter) {
    userFilter.addEventListener("change", renderUsuarios);
  }

  const loadSettings = () => {
    applyTheme(settings.theme);
    themeLight.checked = settings.theme === "light";
    themeDark.checked = settings.theme === "dark";
    weekStart.value = settings.weekStart;
    notificationToggle.checked = settings.notifications;
    showEmptySlots.checked = settings.showEmptySlots;
    updateNotificationState();
  };

  const saveConfig = async () => {
    try {
        const selectedTheme = themeDark.checked ? "dark" : "light";
        const payload = {
            tema_escuro: selectedTheme === "dark",
            inicio_semana: weekStart.value,
            notificacoes_ativas: notificationToggle.checked,
            mostrar_horarios_vazios: showEmptySlots.checked
        };
        await api.put('/configuracoes', payload);
        alert("Configurações salvas no Supabase!");
        await carregarDadosDoBanco();
    } catch(e) {
        alert("Erro ao salvar configs.");
    }
  };

  const setActiveView = (viewName) => {
    views.forEach((section) => {
      section.classList.toggle("active", section.id === `view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
    });
    navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.view === viewName);
    });
    if (window.innerWidth <= 900) {
      sidebar.classList.remove("open");
    }
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      setActiveView(item.dataset.view);
    });
  });

  const handleModalClose = () => {
    [spaceModal, blockModal, reminderModal].forEach((modal) => {
      if (!modal.classList.contains("hidden")) {
        closeModal(modal);
      }
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
    renderUsuarios();
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

  spaceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = spaceIdInput.value;
    const payload = {
        name: spaceName.value.trim(),
        capacity: Number(spaceCapacity.value),
        status: spaceStatus.value
    };

    try {
        if(id) await api.put(`/espacos/${id}`, payload);
        else await api.post('/espacos', payload);
        await carregarDadosDoBanco();
        closeModal(spaceModal);
    } catch(e) {
        alert("Erro ao salvar espaço");
    }
  });

  blockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateBlockTimes()) return;

    const id = blockIdInput.value;
    const payload = {
        day: blockDay.value,
        start: blockStart.value,
        end: blockEnd.value,
        reason: blockReason.value.trim()
    };

    try {
        if(id) await api.put(`/bloqueios/${id}`, payload);
        else await api.post('/bloqueios', payload);
        await carregarDadosDoBanco();
        closeModal(blockModal);
    } catch(e) {
        alert("Erro ao salvar bloqueio.");
    }
  });

  reminderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = reminderIdInput.value;
    const payload = {
        title: reminderTitle.value.trim(),
        time: reminderTime.value,
        notes: reminderNotes.value.trim(),
        status: reminderStatus.value
    };

    try {
        if(id) await api.put(`/lembretes/${id}`, payload);
        else await api.post('/lembretes', payload);
        await carregarDadosDoBanco();
        closeModal(reminderModal);
    } catch(e) {
        alert("Erro ao salvar lembrete");
    }
  });

  saveConfigBtn.addEventListener("click", saveConfig);
  mobileNavToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 900 && sidebar.classList.contains("open")) {
      if (!sidebar.contains(event.target) && event.target !== mobileNavToggle) sidebar.classList.remove("open");
    }
  });

  logoutBtn.addEventListener("click", logout);

  await carregarDadosDoBanco();
});
