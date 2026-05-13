document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    let currentUser = null;
    let profissionais = [];
    let meusAgendamentos = [];

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
            const [resMe, resProf, resAgend] = await Promise.all([
                api.get('/usuarios/me'),
                api.get('/usuarios/profissionais').catch(() => ({ profissionais: [] })),
                api.get('/agendamentos/meus').catch(() => ({ agendamentos: [] }))
            ]);

            currentUser = resMe.usuario;
            profissionais = resProf.profissionais || [];
            meusAgendamentos = resAgend.agendamentos || [];

            updateProfileUI();
            populateProfissionaisDropdown();
            renderWeeklyCalendar();
            renderMonthlyCalendar();
        } catch (error) {
            alert("Erro ao carregar os dados. Faça login novamente.");
            window.location.href = "login.html";
        }
    };

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

        // Simulação de calendário: 1 semana a partir de hoje (2026 por exemplo)
        // O prompt pediu "calendario de 2026", vamos fixar uma data ou apenas pegar a data atual.
        const today = new Date();
        // Se quisermos fixar em 2026 para fins visuais:
        const currentYear = today.getFullYear() === 2026 ? 2026 : 2026;
        const currentMonth = today.getFullYear() === 2026 ? today.getMonth() : 0; // Janeiro 2026
        const startDate = new Date(currentYear, currentMonth, today.getDate() - today.getDay());

        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

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

    // --- VIEW: AGENDAR (MENSAL) ---
    const selectProf = document.getElementById("selectProfissional");
    const selectDia = document.getElementById("selectDiaSemana");
    let currentDisplayMonth = new Date(2026, 0, 1);

    const populateProfissionaisDropdown = () => {
        selectProf.innerHTML = '<option value="">Selecione um Profissional</option>';
        profissionais.forEach(p => {
            selectProf.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
        });
    };

    const renderMonthlyCalendar = () => {
        const grid = document.getElementById("monthlyCalendar");
        const monthTitle = document.getElementById("monthTitle");

        const year = currentDisplayMonth.getFullYear();
        const month = currentDisplayMonth.getMonth();

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

            let isAvailable = false;

            // Lógica: se ele selecionou o profissional e o dia da semana bate, é available
            if (profSelecionado && diaSelecionado && parseInt(diaSelecionado) === dayOfWeek) {
                isAvailable = true;
            }

            // Exemplo visual: bloqueia fds
            if (dayOfWeek === 0 || dayOfWeek === 6) isAvailable = false;

            grid.innerHTML += `
                <div class="calendar-day ${isAvailable ? 'available' : 'disabled'}" style="min-height:80px; display:flex; align-items:center; justify-content:center;">
                    ${day}
                </div>
            `;
        }
    };

    document.getElementById("btnPrevMonth").addEventListener("click", () => {
        currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() - 1);
        renderMonthlyCalendar();
    });

    document.getElementById("btnNextMonth").addEventListener("click", () => {
        currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() + 1);
        renderMonthlyCalendar();
    });

    selectProf.addEventListener("change", renderMonthlyCalendar);
    selectDia.addEventListener("change", renderMonthlyCalendar);

    // Initial Load
    loadData();
});
