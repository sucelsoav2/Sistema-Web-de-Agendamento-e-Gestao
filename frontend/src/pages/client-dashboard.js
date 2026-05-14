document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    let currentUser = null;
    let profissionais = [];
    let meusAgendamentos = [];
    let settings = { theme: "light", weekStart: "monday", notifications: true, showEmptySlots: true };

    // Navigation Logic
    const menuItems = document.querySelectorAll("#menuList li");
    const views = document.querySelectorAll(".view");

    menuItems.forEach((item) => {
        item.addEventListener("click", () => {
            menuItems.forEach((li) => li.classList.remove("active"));
            item.classList.add("active");

            const targetView = item.dataset.view;
            views.forEach((view) => {
                view.classList.add("hidden");
                view.classList.remove("active");
                if (view.id === `view${targetView.charAt(0).toUpperCase() + targetView.slice(1)}`) {
                    view.classList.remove("hidden");
                    view.classList.add("active");
                }
            });
        });
    });

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });

    // Fetch Initial Data
    const loadData = async () => {
        try {
            const [resMe, resProf, resAgend, resConfig] = await Promise.all([
                api.get('/usuarios/me'),
                api.get('/usuarios/profissionais').catch(() => ({ profissionais: [] })),
                api.get('/agendamentos/meus').catch(() => ({ agendamentos: [] })),
                api.get('/configuracoes').catch(() => ({ configuracoes: settings }))
            ]);

            currentUser = resMe.usuario;
            profissionais = resProf.profissionais || [];
            meusAgendamentos = resAgend.agendamentos || [];
            normalizeSettings(resConfig.configuracoes);

            updateProfileUI();
            loadAgendaSettings();
            loadGoogleCalendarStatus();
            populateProfissionaisDropdown();
            renderWeeklyCalendar();
            renderMyAppointments();
            renderMonthlyCalendar();
        } catch (error) {
            alert("Erro ao carregar os dados. Faça login novamente.");
            window.location.href = "login.html";
        }
    };

    const normalizeSettings = (config = {}) => {
        settings = {
            theme: config.tema_escuro || config.theme === 'dark' ? 'dark' : 'light',
            weekStart: config.inicio_semana || config.weekStart || 'monday',
            notifications: config.notificacoes_ativas ?? config.notifications ?? true,
            showEmptySlots: config.mostrar_horarios_vazios ?? config.showEmptySlots ?? true
        };
    };

    const clientThemeLight = document.getElementById("clientThemeLight");
    const clientThemeDark = document.getElementById("clientThemeDark");
    const clientWeekStart = document.getElementById("clientWeekStart");
    const clientNotificationToggle = document.getElementById("clientNotificationToggle");
    const clientNotificationStateLabel = document.getElementById("clientNotificationStateLabel");
    const clientNotificationsCard = document.getElementById("clientNotificationsCard");
    const clientShowEmptySlots = document.getElementById("clientShowEmptySlots");
    const saveClientConfigBtn = document.getElementById("saveClientConfigBtn");
    const clientGoogleCalendarStatus = document.getElementById("clientGoogleCalendarStatus");
    const connectClientGoogleCalendarBtn = document.getElementById("connectClientGoogleCalendarBtn");
    const disconnectClientGoogleCalendarBtn = document.getElementById("disconnectClientGoogleCalendarBtn");

    const applyTheme = (theme) => {
        document.body.classList.toggle("dark-mode", theme === "dark");
    };

    const updateClientNotificationState = () => {
        clientNotificationStateLabel.textContent = clientNotificationToggle.checked ? "Ativo" : "Desativado";
        clientNotificationStateLabel.style.color = clientNotificationToggle.checked ? "#2563EB" : "#6B7280";
    };

    const loadAgendaSettings = () => {
        applyTheme(settings.theme);
        clientThemeLight.checked = settings.theme === "light";
        clientThemeDark.checked = settings.theme === "dark";
        clientWeekStart.value = settings.weekStart;
        clientNotificationToggle.checked = settings.notifications;
        clientShowEmptySlots.checked = settings.showEmptySlots;
        updateClientNotificationState();
    };

    const loadGoogleCalendarStatus = async () => {
        try {
            const res = await api.get("/google-calendar/status");
            if (res.conectado) {
                clientGoogleCalendarStatus.textContent = `Conectado: ${res.google_email || "conta Google"}`;
                connectClientGoogleCalendarBtn.style.display = "none";
                disconnectClientGoogleCalendarBtn.style.display = "inline-flex";
            } else {
                clientGoogleCalendarStatus.textContent = "Não conectado. Agendamentos não serão enviados ao Google Calendar.";
                connectClientGoogleCalendarBtn.style.display = "inline-flex";
                disconnectClientGoogleCalendarBtn.style.display = "none";
            }
        } catch (error) {
            clientGoogleCalendarStatus.textContent = "Não foi possível verificar a conexão com Google Calendar.";
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

    connectClientGoogleCalendarBtn.addEventListener("click", connectGoogleCalendar);
    disconnectClientGoogleCalendarBtn.addEventListener("click", disconnectGoogleCalendar);
    window.addEventListener("message", (event) => {
        if (event.data?.type === "GOOGLE_CALENDAR_CONNECTED") loadGoogleCalendarStatus();
    });

    clientNotificationToggle.addEventListener("change", () => {
        updateClientNotificationState();
        clientNotificationsCard.classList.add("active");
        setTimeout(() => clientNotificationsCard.classList.remove("active"), 900);
    });

    saveClientConfigBtn.addEventListener("click", async () => {
        const selectedTheme = clientThemeDark.checked ? "dark" : "light";
        try {
            await api.put('/configuracoes', {
                tema_escuro: selectedTheme === "dark",
                inicio_semana: clientWeekStart.value,
                notificacoes_ativas: clientNotificationToggle.checked,
                mostrar_horarios_vazios: clientShowEmptySlots.checked
            });
            settings = {
                theme: selectedTheme,
                weekStart: clientWeekStart.value,
                notifications: clientNotificationToggle.checked,
                showEmptySlots: clientShowEmptySlots.checked
            };
            applyTheme(settings.theme);
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            alert("Erro ao salvar configurações.");
        }
    });

    // --- VIEW: PERFIL ---
    const updateProfileUI = () => {
        document.getElementById("userNameDisplay").textContent = currentUser.nome;
        document.getElementById("perfilNome").value = currentUser.nome || '';
        document.getElementById("perfilEmail").value = currentUser.email || '';
        document.getElementById("perfilTelefone").value = currentUser.telefone || '';
        document.getElementById("perfilNascimento").value = currentUser.data_nascimento || '';
        document.getElementById("perfilFoto").value = currentUser.foto_perfil || '';

        if (currentUser.foto_perfil) {
            document.getElementById("headerAvatar").src = currentUser.foto_perfil;
            document.getElementById("profilePicPreview").src = currentUser.foto_perfil;
        }


    };

    document.getElementById("perfilFotoInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 300;
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                document.getElementById("profilePicPreview").src = dataUrl;
                document.getElementById("perfilFoto").value = dataUrl;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById("perfilForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            nome: document.getElementById("perfilNome").value,
            data_nascimento: document.getElementById("perfilNascimento").value,
            foto_perfil: document.getElementById("perfilFoto").value,
            telefone: document.getElementById("perfilTelefone").value
        };
        try {
            await api.put('/usuarios/me', payload);
            alert("Perfil atualizado com sucesso!");
            loadData();
        } catch (err) {
            alert("Erro ao atualizar perfil.");
        }
    });

    // --- VIEW: DASHBOARD (SEMANA) ---
    const renderWeeklyCalendar = () => {
        const grid = document.getElementById("weeklyCalendar");
        grid.innerHTML = '';

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const weekOffset = settings.weekStart === "monday" ? (today.getDay() === 0 ? 6 : today.getDay() - 1) : today.getDay();
        const startDate = new Date(currentYear, currentMonth, today.getDate() - weekOffset);

        const days = settings.weekStart === "monday"
            ? ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
            : ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            // Filtrar agendamentos desse dia
            const dayMeetings = meusAgendamentos.filter(ag => ag.data_hora_inicio.startsWith(dateStr));

            let html = `<div class="calendar-day">
                <h4>${days[i]}<br/><small>${d.getDate()}/${d.getMonth() + 1}</small></h4>
            `;

            dayMeetings.forEach(ag => {
                const time = ag.data_hora_inicio.split('T')[1].substring(0, 5);
                const prof = ag.usuario ? ag.usuario.nome : 'Profissional';
                const local = ag.formato === 'virtual' ? `<a href="${ag.link_reuniao || '#'}" target="_blank">Link da Reunião</a>` : (ag.espaco ? ag.espaco.nome : 'Local a definir');

                html += `
                    <div class="meeting-card">
                        <strong>${time}</strong> - ${prof}<br/>
                        <small>Formato: ${ag.formato}</small><br/>
                        <small>${local}</small>
                    </div>
                `;
            });

            html += `</div>`;
            grid.innerHTML += html;
        }
    };

    const renderMyAppointments = () => {
        const tableBody = document.getElementById("myAppointmentsTableBody");
        if (!tableBody) return;

        tableBody.innerHTML = meusAgendamentos.length ? meusAgendamentos.map((ag) => {
            const date = new Date(ag.data_hora_inicio).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            const profissional = ag.usuario ? ag.usuario.nome : "Profissional";
            const sala = ag.formato === "hibrido" ? "Não necessária" : (ag.espaco ? ag.espaco.nome : "A definir");
            const status = ag.status || "agendado";
            const canCancel = status !== "cancelado";

            return `
                <tr>
                    <td>${date}</td>
                    <td>${profissional}</td>
                    <td>${ag.formato || "presencial"}</td>
                    <td>${sala}</td>
                    <td><span class="status ${status === "cancelado" ? "status-disabled" : "status-active"}">${status}</span></td>
                    <td>${canCancel ? `<button class="secondary cancel-appointment" data-id="${ag.id}">Cancelar</button>` : "Cancelado"}</td>
                </tr>
            `;
        }).join("") : `
            <tr>
                <td colspan="6">Nenhum agendamento marcado.</td>
            </tr>
        `;

        tableBody.querySelectorAll(".cancel-appointment").forEach((button) => {
            button.addEventListener("click", () => cancelAppointment(button.dataset.id));
        });
    };

    const cancelAppointment = async (id) => {
        const motivo = prompt("Informe o motivo do cancelamento:");
        if (!motivo || !motivo.trim()) return;

        const confirmado = confirm("Tem certeza que deseja cancelar este agendamento? O profissional será avisado por e-mail.");
        if (!confirmado) return;

        try {
            await api.patch(`/agendamentos/${id}/cancelar`, { motivo: motivo.trim() });
            alert("Agendamento cancelado com sucesso.");
            await loadData();
        } catch (error) {
            alert(error.response?.erro || "Não foi possível cancelar o agendamento.");
        }
    };

    // --- VIEW: AGENDAR (MENSAL) ---
    const selectProf = document.getElementById("selectProfissional");
    const selectDia = document.getElementById("selectDiaSemana");
    const quantidadePessoas = document.getElementById("quantidadePessoas");
    const bookingPanel = document.getElementById("bookingPanel");
    const selectedDateTitle = document.getElementById("selectedDateTitle");
    const slotList = document.getElementById("slotList");
    const meetingFormat = document.getElementById("meetingFormat");
    const meetingDuration = document.getElementById("meetingDuration");
    const selectedRoom = document.getElementById("selectedRoom");
    const confirmBookingBtn = document.getElementById("confirmBookingBtn");
    const availabilityStatus = document.getElementById("availabilityStatus");
    const bookingNotice = document.getElementById("bookingNotice");
    let bookingNoticeTimeout = null;

    const showBookingNotice = (message) => {
        if (!bookingNotice) return;
        bookingNotice.textContent = message;
        bookingNotice.classList.remove("hidden");
        clearTimeout(bookingNoticeTimeout);
        bookingNoticeTimeout = setTimeout(() => {
            bookingNotice.classList.add("hidden");
            bookingNotice.textContent = "";
        }, 5000);
    };
    const getBahiaParts = () => {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Bahia",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).formatToParts(new Date());
        return Object.fromEntries(parts.map((part) => [part.type, part.value]));
    };
    const getBahiaToday = () => {
        const now = getBahiaParts();
        return `${now.year}-${now.month}-${now.day}`;
    };
    const getBahiaCurrentTime = () => {
        const now = getBahiaParts();
        return `${now.hour}:${now.minute}`;
    };
    const todayForCalendarParts = getBahiaParts();
    let currentDisplayMonth = new Date(Number(todayForCalendarParts.year), Number(todayForCalendarParts.month) - 1, 1);
    let availableDates = new Set();
    let selectedDate = null;
    let selectedSlot = null;
    let currentSlots = [];

    const populateProfissionaisDropdown = () => {
        selectProf.innerHTML = '<option value="">Selecione um Profissional</option>';
        profissionais.forEach(p => {
            selectProf.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
        });
        if (!profissionais.length) {
            availabilityStatus.textContent = "Nenhum profissional ativo foi encontrado para agendamento.";
        }
    };

    const loadAvailableDates = async () => {
        const profSelecionado = selectProf.value;
        const diaSelecionado = selectDia.value;
        availableDates = new Set();
        bookingPanel.style.display = "none";

        if (!profSelecionado || !diaSelecionado) {
            availabilityStatus.textContent = "Selecione um profissional e um dia da semana para ver as datas disponíveis.";
            renderMonthlyCalendar();
            return;
        }

        const year = currentDisplayMonth.getFullYear();
        const month = currentDisplayMonth.getMonth() + 1;
        const pessoas = Math.max(1, Number(quantidadePessoas.value) || 1);

        try {
            availabilityStatus.textContent = "Buscando datas disponíveis...";
            const res = await api.get(`/agendamentos/datas-disponiveis?profissional_id=${profSelecionado}&ano=${year}&mes=${month}&pessoas=${pessoas}`);
            availableDates = new Set(res.datas || []);
            availabilityStatus.textContent = availableDates.size
                ? "Clique em uma data destacada para escolher o horário."
                : "Nenhuma data disponível nesse mês para essa combinação.";
        } catch (error) {
            availableDates = new Set();
            availabilityStatus.textContent = "Não foi possível carregar as datas disponíveis. Tente novamente.";
        }

        renderMonthlyCalendar();
    };

    const renderMonthlyCalendar = () => {
        const grid = document.getElementById("monthlyCalendar");
        const monthTitle = document.getElementById("monthTitle");

        const year = currentDisplayMonth.getFullYear();
        const month = currentDisplayMonth.getMonth();
        const today = getBahiaToday();

        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        monthTitle.textContent = `${monthNames[month]} ${year}`;

        grid.innerHTML = `
            <div style="font-weight:bold;text-align:center;">Dom</div>
            <div style="font-weight:bold;text-align:center;">Seg</div>
            <div style="font-weight:bold;text-align:center;">Ter</div>
            <div style="font-weight:bold;text-align:center;">Qua</div>
            <div style="font-weight:bold;text-align:center;">Qui</div>
            <div style="font-weight:bold;text-align:center;">Sex</div>
            <div style="font-weight:bold;text-align:center;">Sáb</div>
        `;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const profSelecionado = selectProf.value;
        const diaSelecionado = selectDia.value; // 1=Seg, 5=Sex, etc

        for (let i = 0; i < firstDay; i++) {
            grid.innerHTML += `<div></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dayOfWeek = dateObj.getDay();

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPastDate = dateStr < today;
            let isAvailable = false;

            // Lógica: se ele selecionou o profissional e o dia da semana bate, é available
            if (!isPastDate && profSelecionado && diaSelecionado && parseInt(diaSelecionado) === dayOfWeek && availableDates.has(dateStr)) {
                isAvailable = true;
            }

            // Exemplo visual: bloqueia fds
            if (dayOfWeek === 0 || dayOfWeek === 6) isAvailable = false;

            grid.innerHTML += `
                <div class="calendar-day ${isAvailable ? 'available' : 'disabled'}" data-date="${dateStr}" style="min-height:80px; display:flex; align-items:center; justify-content:center; ${isAvailable ? 'cursor:pointer;' : ''}">
                    ${day}
                </div>
            `;
        }

        grid.querySelectorAll(".calendar-day.available").forEach((dayEl) => {
            dayEl.addEventListener("click", () => loadSlots(dayEl.dataset.date));
        });

        const currentMonthKey = `${currentDisplayMonth.getFullYear()}-${String(currentDisplayMonth.getMonth() + 1).padStart(2, '0')}`;
        const todayMonthKey = today.slice(0, 7);
        document.getElementById("btnPrevMonth").disabled = currentMonthKey <= todayMonthKey;
    };

    const loadSlots = async (date) => {
        selectedDate = date;
        selectedSlot = null;
        confirmBookingBtn.disabled = true;
        selectedRoom.value = "Não selecionada";
        selectedDateTitle.textContent = `Horários em ${date.split('-').reverse().join('/')}`;
        bookingPanel.style.display = "block";
        slotList.innerHTML = "Carregando horários...";

        const pessoas = Math.max(1, Number(quantidadePessoas.value) || 1);
        const duracao = Math.min(60, Math.max(30, Number(meetingDuration.value) || 30));
        try {
            const res = await api.get(`/agendamentos/disponibilidade?profissional_id=${selectProf.value}&data=${date}&pessoas=${pessoas}&duracao_minutos=${duracao}`);
            currentSlots = res.slots || [];
            renderSlots();
        } catch (error) {
            const message = error.response?.erro || "Não foi possível carregar os horários.";
            slotList.innerHTML = message;
            showBookingNotice(message);
        }
    };

    const renderSlots = () => {
        const formato = meetingFormat.value;
        const today = getBahiaToday();
        const currentTime = getBahiaCurrentTime();
        const slotsValidos = currentSlots.filter((slot) => {
            const isPastTimeToday = selectedDate === today && slot.horario <= currentTime;
            return !isPastTimeToday && slot.disponivel && (formato === 'hibrido' || slot.presencialDisponivel);
        });

        if (!slotsValidos.length) {
            slotList.innerHTML = "Nenhum horário disponível para essa combinação.";
            return;
        }

        slotList.innerHTML = slotsValidos.map((slot) => `
            <button class="secondary slot-option" data-time="${slot.horario}" style="min-width: 82px;">
                ${slot.horario}
            </button>
        `).join("");

        slotList.querySelectorAll(".slot-option").forEach((button) => {
            button.addEventListener("click", () => {
                slotList.querySelectorAll(".slot-option").forEach((item) => item.classList.remove("primary"));
                button.classList.add("primary");
                selectedSlot = currentSlots.find((slot) => slot.horario === button.dataset.time);
                selectedRoom.value = meetingFormat.value === 'presencial' && selectedSlot?.sala
                    ? `${selectedSlot.sala.nome} (${selectedSlot.sala.capacidade} pessoas)`
                    : "Não necessária";
                confirmBookingBtn.disabled = false;
            });
        });
    };

    document.getElementById("btnPrevMonth").addEventListener("click", () => {
        const today = getBahiaToday();
        const currentMonthKey = `${currentDisplayMonth.getFullYear()}-${String(currentDisplayMonth.getMonth() + 1).padStart(2, '0')}`;
        if (currentMonthKey <= today.slice(0, 7)) return;

        currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() - 1);
        loadAvailableDates();
    });

    document.getElementById("btnNextMonth").addEventListener("click", () => {
        currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() + 1);
        loadAvailableDates();
    });

    selectProf.addEventListener("change", loadAvailableDates);
    selectDia.addEventListener("change", loadAvailableDates);
    quantidadePessoas.addEventListener("change", () => {
        loadAvailableDates();
    });
    meetingFormat.addEventListener("change", () => {
        selectedSlot = null;
        selectedRoom.value = "Não selecionada";
        confirmBookingBtn.disabled = true;
        renderSlots();
    });
    meetingDuration.addEventListener("change", () => {
        const duracao = Number(meetingDuration.value) || 30;
        selectedSlot = null;
        selectedRoom.value = "Não selecionada";
        confirmBookingBtn.disabled = true;

        if (duracao > 60) {
            showBookingNotice("O agendamento pode ter no máximo 1 hora de duração, ou seja, dois horários seguidos.");
            meetingDuration.value = "60";
            return;
        }

        if (selectedDate) loadSlots(selectedDate);
    });

    confirmBookingBtn.addEventListener("click", async () => {
        if (!selectedDate || !selectedSlot) return;
        const duracao = Number(meetingDuration.value) || 30;

        if (duracao > 60) {
            showBookingNotice("O agendamento pode ter no máximo 1 hora de duração, ou seja, dois horários seguidos.");
            return;
        }

        const payload = {
            profissional_id: selectProf.value,
            data: selectedDate,
            horario: selectedSlot.horario,
            formato: meetingFormat.value,
            quantidade_pessoas: Math.max(1, Number(quantidadePessoas.value) || 1),
            duracao_minutos: duracao
        };

        try {
            confirmBookingBtn.disabled = true;
            await api.post('/agendamentos/marcar', payload);
            alert("Agendamento marcado com sucesso!");
            bookingPanel.style.display = "none";
            await loadData();
        } catch (error) {
            showBookingNotice(error.response?.erro || "Não foi possível confirmar o agendamento.");
            confirmBookingBtn.disabled = false;
        }
    });

    // Initial Load
    loadData();
});
