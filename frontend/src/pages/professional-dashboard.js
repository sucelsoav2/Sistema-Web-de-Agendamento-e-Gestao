document.addEventListener("DOMContentLoaded", async () => {
  const token = authService.getToken();
  if (!authService.isAuthenticated()) {
    window.location.href = "./login.html";
    return;
  }

  const user = authService.getUserFromToken(token);
  document.getElementById("userEmail").textContent = user?.email || "Profissional";

  const navItems = document.querySelectorAll(".sidebar li[data-view]");
  const views = document.querySelectorAll(".view");
  const sidebar = document.querySelector(".sidebar");
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const logoutBtn = document.getElementById("logoutBtn");

  const weeklyCalendar = document.getElementById("weeklyCalendar");
  const appointmentsTableBody = document.getElementById("appointmentsTableBody");
  const reminderList = document.getElementById("reminderList");
  const checkRoomsBtn = document.getElementById("checkRoomsBtn");
  const roomAvailabilityResult = document.getElementById("roomAvailabilityResult");
  const blockForm = document.getElementById("blockForm");
  const blockDate = document.getElementById("blockDate");
  const blockStart = document.getElementById("blockStart");
  const blockDuration = document.getElementById("blockDuration");
  const customBlockEnd = document.getElementById("customBlockEnd");
  const blockCustomEndDate = document.getElementById("blockCustomEndDate");
  const blockCustomEndTime = document.getElementById("blockCustomEndTime");
  const blockReason = document.getElementById("blockReason");
  const blocksList = document.getElementById("blocksList");
  const professionalThemeLight = document.getElementById("professionalThemeLight");
  const professionalThemeDark = document.getElementById("professionalThemeDark");
  const professionalWeekStart = document.getElementById("professionalWeekStart");
  const professionalNotificationToggle = document.getElementById("professionalNotificationToggle");
  const professionalNotificationStateLabel = document.getElementById("professionalNotificationStateLabel");
  const professionalNotificationsCard = document.getElementById("professionalNotificationsCard");
  const professionalShowEmptySlots = document.getElementById("professionalShowEmptySlots");
  const saveProfessionalConfigBtn = document.getElementById("saveProfessionalConfigBtn");
  const professionalGoogleCalendarStatus = document.getElementById("professionalGoogleCalendarStatus");
  const connectProfessionalGoogleCalendarBtn = document.getElementById("connectProfessionalGoogleCalendarBtn");
  const disconnectProfessionalGoogleCalendarBtn = document.getElementById("disconnectProfessionalGoogleCalendarBtn");

  let agendamentos = [];
  let lembretes = [];
  let bloqueios = [];
  let settings = { theme: "light", weekStart: "monday", notifications: true, showEmptySlots: true };

  const getBahiaDate = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bahia",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const normalizeSettings = (config = {}) => {
    settings = {
      theme: config.tema_escuro || config.theme === "dark" ? "dark" : "light",
      weekStart: config.inicio_semana || config.weekStart || "monday",
      notifications: config.notificacoes_ativas ?? config.notifications ?? true,
      showEmptySlots: config.mostrar_horarios_vazios ?? config.showEmptySlots ?? true
    };
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle("dark-mode", theme === "dark");
  };

  const updateProfessionalNotificationState = () => {
    professionalNotificationStateLabel.textContent = professionalNotificationToggle.checked ? "Ativo" : "Desativado";
    professionalNotificationStateLabel.style.color = professionalNotificationToggle.checked ? "#2563EB" : "#6B7280";
  };

  const loadAgendaSettings = () => {
    applyTheme(settings.theme);
    professionalThemeLight.checked = settings.theme === "light";
    professionalThemeDark.checked = settings.theme === "dark";
    professionalWeekStart.value = settings.weekStart;
    professionalNotificationToggle.checked = settings.notifications;
    professionalShowEmptySlots.checked = settings.showEmptySlots;
    updateProfessionalNotificationState();
  };

  const loadGoogleCalendarStatus = async () => {
    try {
      const res = await api.get("/google-calendar/status");
      if (res.conectado) {
        professionalGoogleCalendarStatus.textContent = `Conectado: ${res.google_email || "conta Google"}`;
        connectProfessionalGoogleCalendarBtn.style.display = "none";
        disconnectProfessionalGoogleCalendarBtn.style.display = "inline-flex";
      } else {
        professionalGoogleCalendarStatus.textContent = "Não conectado. Agendamentos não serão enviados ao Google Calendar.";
        connectProfessionalGoogleCalendarBtn.style.display = "inline-flex";
        disconnectProfessionalGoogleCalendarBtn.style.display = "none";
      }
    } catch (error) {
      professionalGoogleCalendarStatus.textContent = "Não foi possível verificar a conexão com Google Calendar.";
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const res = await api.get("/google-calendar/auth-url");
      window.open(res.url, "googleCalendarAuth", "width=520,height=720");
    } catch (error) {
      alert(error.response?.erro || "Não foi possível iniciar conexão com Google Calendar.");
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!confirm("Deseja desconectar sua agenda Google?")) return;
    await api.delete("/google-calendar/disconnect");
    await loadGoogleCalendarStatus();
  };

  connectProfessionalGoogleCalendarBtn.addEventListener("click", connectGoogleCalendar);
  disconnectProfessionalGoogleCalendarBtn.addEventListener("click", disconnectGoogleCalendar);
  window.addEventListener("message", (event) => {
    if (event.data?.type === "GOOGLE_CALENDAR_CONNECTED") loadGoogleCalendarStatus();
  });

  const getClientName = (agendamento) => {
    return agendamento.cliente_usuario?.nome || agendamento.clientes?.nome || "Cliente";
  };

  const getRoomName = (agendamento) => {
    if (agendamento.formato === "hibrido") return "Não necessária";
    return agendamento.espacos?.nome || "A definir";
  };

  const setActiveView = (viewName) => {
    views.forEach((section) => {
      section.classList.toggle("active", section.id === `view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
    });
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
    if (window.innerWidth <= 900) sidebar.classList.remove("open");
  };

  navItems.forEach((item) => {
    item.addEventListener("click", () => setActiveView(item.dataset.view));
  });

  const renderMetrics = () => {
    const now = new Date();
    const futuros = agendamentos.filter((item) => new Date(item.data_hora_inicio) >= now);
    const proximo = futuros.sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio))[0];
    const pendentes = lembretes.filter((item) => item.status === "Pendente" || item.enviado === false);

    document.getElementById("appointmentsMetric").textContent = `${agendamentos.length} totais`;
    document.getElementById("nextAppointmentMetric").textContent = proximo ? `Próximo: ${formatDateTime(proximo.data_hora_inicio)}` : "Nenhum agendamento futuro";
    document.getElementById("remindersMetric").textContent = `${pendentes.length} pendentes`;
    document.getElementById("remindersTotalMetric").textContent = `${lembretes.length} totais`;
    document.getElementById("weeklySummary").textContent = `${getWeekAppointments().length} reunião(ões) nesta semana.`;
    document.getElementById("nextAppointmentBox").textContent = proximo
      ? `${getClientName(proximo)} em ${formatDateTime(proximo.data_hora_inicio)} (${proximo.formato || "presencial"})`
      : "Nenhuma reunião encontrada.";
  };

  const getWeekRange = () => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const offset = settings.weekStart === "monday" ? (today.getDay() === 0 ? 6 : today.getDay() - 1) : today.getDay();
    start.setDate(today.getDate() - offset);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  };

  const getWeekAppointments = () => {
    const { start, end } = getWeekRange();
    return agendamentos.filter((item) => {
      const date = new Date(item.data_hora_inicio);
      return date >= start && date < end;
    });
  };

  const renderWeeklyCalendar = () => {
    const { start } = getWeekRange();
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    weeklyCalendar.innerHTML = "";

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateKey = date.toISOString().slice(0, 10);
      const meetings = agendamentos.filter((item) => item.data_hora_inicio.slice(0, 10) === dateKey);

      weeklyCalendar.innerHTML += `
        <div class="calendar-card">
          <h3>${days[i]} <small>${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</small></h3>
          ${meetings.length ? meetings.map((item) => `
            <p><strong>${new Date(item.data_hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</strong> - ${getClientName(item)}</p>
            <span class="tag">${item.formato || "presencial"} • ${getRoomName(item)}</span>
          `).join("") : '<p class="card-meta">Sem reuniões</p>'}
        </div>
      `;
    }
  };

  const renderAppointments = () => {
    appointmentsTableBody.innerHTML = agendamentos.length ? agendamentos.map((item) => {
      const status = item.status || "agendado";
      const canCancel = status !== "cancelado";

      return `
        <tr>
          <td>${formatDateTime(item.data_hora_inicio)}</td>
          <td>${getClientName(item)}</td>
          <td>${item.formato || "presencial"}</td>
          <td>${getRoomName(item)}</td>
          <td><span class="status ${status === "cancelado" ? "status-disabled" : "status-active"}">${status}</span></td>
          <td>${canCancel ? `<button class="secondary cancel-appointment" data-id="${item.id}">Cancelar</button>` : "Cancelado"}</td>
        </tr>
      `;
    }).join("") : `
      <tr>
        <td colspan="6">Nenhum agendamento encontrado.</td>
      </tr>
    `;

    appointmentsTableBody.querySelectorAll(".cancel-appointment").forEach((button) => {
      button.addEventListener("click", () => cancelAppointment(button.dataset.id));
    });
  };

  const cancelAppointment = async (id) => {
    const motivo = prompt("Informe o motivo do cancelamento:");
    if (!motivo || !motivo.trim()) return;

    const confirmado = confirm("Tem certeza que deseja cancelar este agendamento? O cliente será avisado por e-mail.");
    if (!confirmado) return;

    try {
      await api.patch(`/agendamentos/${id}/cancelar`, { motivo: motivo.trim() });
      alert("Agendamento cancelado com sucesso.");
      await loadData();
    } catch (error) {
      alert(error.response?.erro || "Não foi possível cancelar o agendamento.");
    }
  };

  const renderReminders = () => {
    reminderList.innerHTML = lembretes.length ? lembretes.map((item) => `
      <div class="reminder-card">
        <div>
          <h3>${item.title || item.titulo || "Lembrete"}</h3>
          <p>${item.notes || item.mensagem || ""}</p>
        </div>
        <span class="tag ${item.status === "Pendente" ? "tag-warning" : "tag-info"}">${item.status || "Ativo"}</span>
      </div>
    `).join("") : '<div class="content-box"><p>Nenhum lembrete cadastrado.</p></div>';
  };

  const formatBlockDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("pt-BR", {
      timeZone: "America/Bahia",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const renderBlocks = () => {
    blocksList.innerHTML = bloqueios.length ? bloqueios.map((item) => {
      const periodo = item.recurring
        ? `Sempre às ${item.start} (${item.day})`
        : `${formatBlockDateTime(item.data_hora_inicio)} até ${formatBlockDateTime(item.data_hora_fim)}`;

      return `
        <div class="reminder-card">
          <div>
            <h3>${item.reason || "Bloqueio"}</h3>
            <p>${periodo}</p>
          </div>
          <div class="reminder-actions">
            <span class="tag ${item.recurring ? "tag-warning" : "tag-info"}">${item.label}</span>
            <button class="secondary delete-block" data-id="${item.id}">Excluir</button>
          </div>
        </div>
      `;
    }).join("") : '<div class="content-box"><p>Nenhum horário bloqueado.</p></div>';

    blocksList.querySelectorAll(".delete-block").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!confirm("Deseja remover este bloqueio?")) return;
        await api.delete(`/bloqueios/${button.dataset.id}`);
        await loadData();
      });
    });
  };

  const loadData = async () => {
    const [resAgendamentos, resLembretes, resBloqueios, resConfig] = await Promise.all([
      api.get("/agendamentos").catch(() => ({ agendamentos: [] })),
      api.get("/lembretes").catch(() => ({ lembretes: [] })),
      api.get("/bloqueios").catch(() => ({ bloqueios: [] })),
      api.get("/configuracoes").catch(() => ({ configuracoes: settings }))
    ]);

    agendamentos = resAgendamentos.agendamentos || [];
    lembretes = resLembretes.lembretes || [];
    bloqueios = resBloqueios.bloqueios || [];
    normalizeSettings(resConfig.configuracoes);
    loadAgendaSettings();
    loadGoogleCalendarStatus();
    renderMetrics();
    renderWeeklyCalendar();
    renderAppointments();
    renderReminders();
    renderBlocks();
  };

  checkRoomsBtn.addEventListener("click", async () => {
    const date = document.getElementById("roomDate").value;
    const time = document.getElementById("roomTime").value;
    const people = Math.max(1, Number(document.getElementById("roomPeople").value) || 1);

    if (!date || !time) {
      roomAvailabilityResult.innerHTML = '<div class="reminder-card"><p>Informe data e horário.</p></div>';
      return;
    }

    roomAvailabilityResult.innerHTML = '<div class="reminder-card"><p>Consultando...</p></div>';
    try {
      const res = await api.get(`/espacos/disponibilidade?data=${date}&horario=${time}&pessoas=${people}`);
      const salas = res.salas || [];
      roomAvailabilityResult.innerHTML = salas.length ? salas.map((sala, index) => `
        <div class="reminder-card">
          <div>
            <h3>${sala.name}</h3>
            <p>Capacidade: ${sala.capacity} pessoas</p>
          </div>
          <span class="tag ${index === 0 ? "tag-success" : "tag-info"}">${index === 0 ? "Recomendada" : "Disponível"}</span>
        </div>
      `).join("") : '<div class="reminder-card"><p>Nenhuma sala disponível para essa quantidade de pessoas.</p></div>';
    } catch (error) {
      roomAvailabilityResult.innerHTML = '<div class="reminder-card"><p>Erro ao consultar disponibilidade.</p></div>';
    }
  });

  blockDuration.addEventListener("change", () => {
    const custom = blockDuration.value === "personalizado";
    customBlockEnd.style.display = custom ? "grid" : "none";
    blockCustomEndDate.required = custom;
    blockCustomEndTime.required = custom;
  });

  professionalNotificationToggle.addEventListener("change", () => {
    updateProfessionalNotificationState();
    professionalNotificationsCard.classList.add("active");
    setTimeout(() => professionalNotificationsCard.classList.remove("active"), 900);
  });

  saveProfessionalConfigBtn.addEventListener("click", async () => {
    const selectedTheme = professionalThemeDark.checked ? "dark" : "light";

    try {
      await api.put("/configuracoes", {
        tema_escuro: selectedTheme === "dark",
        inicio_semana: professionalWeekStart.value,
        notificacoes_ativas: professionalNotificationToggle.checked,
        mostrar_horarios_vazios: professionalShowEmptySlots.checked
      });
      settings = {
        theme: selectedTheme,
        weekStart: professionalWeekStart.value,
        notifications: professionalNotificationToggle.checked,
        showEmptySlots: professionalShowEmptySlots.checked
      };
      applyTheme(settings.theme);
      renderMetrics();
      renderWeeklyCalendar();
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      alert("Erro ao salvar configurações.");
    }
  });

  blockForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      date: blockDate.value,
      start: blockStart.value,
      duration_type: blockDuration.value,
      custom_end_date: blockCustomEndDate.value,
      custom_end_time: blockCustomEndTime.value,
      reason: blockReason.value.trim()
    };

    if (!payload.reason) {
      alert("Informe o motivo do bloqueio.");
      return;
    }

    try {
      await api.post("/bloqueios", payload);
      blockForm.reset();
      blockDate.value = getBahiaDate();
      customBlockEnd.style.display = "none";
      blockCustomEndDate.required = false;
      blockCustomEndTime.required = false;
      await loadData();
      alert("Horário bloqueado com sucesso.");
    } catch (error) {
      alert(error.response?.erro || "Não foi possível salvar o bloqueio.");
    }
  });

  mobileNavToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  logoutBtn.addEventListener("click", () => authService.logout());

  blockDate.value = getBahiaDate();
  await loadData();
});
