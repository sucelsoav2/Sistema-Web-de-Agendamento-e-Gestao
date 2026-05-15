(function () {
  const sidebarIcons = {
    dashboard: "layout-dashboard",
    home: "calendar-days",
    week: "calendar-days",
    agendar: "calendar-plus",
    appointments: "calendar-check",
    agendamentos: "calendar-check",
    spaces: "map-pin",
    rooms: "map-pin",
    schedule: "clock",
    blocks: "clock",
    agenda: "settings",
    reminders: "bell",
    usuarios: "users",
    perfil: "user-cog"
  };

  const buttonIcons = [
    ["logoutBtn", "log-out"],
    ["mobileNavToggle", "menu"],
    ["newSpaceBtn", "plus"],
    ["newBlockBtn", "plus"],
    ["newReminderBtn", "plus"],
    ["saveConfigBtn", "save"],
    ["saveClientConfigBtn", "save"],
    ["saveProfessionalConfigBtn", "save"],
    ["clearAppointmentFiltersBtn", "rotate-ccw"],
    ["checkRoomsBtn", "search"],
    ["connectClientGoogleCalendarBtn", "calendar-plus"],
    ["connectClientGoogleCalendarHeroBtn", "calendar-plus"],
    ["connectProfessionalGoogleCalendarBtn", "calendar-plus"],
    ["connectProfessionalGoogleCalendarHeroBtn", "calendar-plus"],
    ["disconnectClientGoogleCalendarBtn", "unlink"],
    ["disconnectClientGoogleCalendarHeroBtn", "unlink"],
    ["disconnectProfessionalGoogleCalendarBtn", "unlink"],
    ["disconnectProfessionalGoogleCalendarHeroBtn", "unlink"],
    ["dismissClientGoogleCalendarPromptBtn", "x"],
    ["dismissProfessionalGoogleCalendarPromptBtn", "x"]
  ];

  const addIcon = (element, iconName) => {
    if (!element || element.querySelector("[data-ui-icon]")) return;
    const icon = document.createElement("i");
    icon.className = "ui-icon";
    icon.dataset.uiIcon = "true";
    icon.dataset.lucide = iconName;
    element.prepend(icon);
  };

  const enhanceSidebar = () => {
    document.querySelectorAll(".sidebar li[data-view]").forEach((item) => {
      addIcon(item, sidebarIcons[item.dataset.view] || "circle");
    });
  };

  const enhanceButtons = () => {
    buttonIcons.forEach(([id, icon]) => addIcon(document.getElementById(id), icon));
  };

  const enhanceTopbar = () => {
    document.querySelectorAll(".topbar").forEach((topbar) => {
      if (topbar.querySelector(".topbar-search")) return;
      const actions = topbar.querySelector(".topbar-actions");
      if (!actions) return;

      const search = document.createElement("div");
      search.className = "topbar-search";
      search.innerHTML = '<i class="ui-icon" data-lucide="search"></i><input type="search" placeholder="Pesquisar..." aria-label="Pesquisar" />';
      actions.prepend(search);
    });
  };

  const enhanceBrand = () => {
    document.querySelectorAll(".sidebar h2").forEach((brand) => {
      if (brand.querySelector(".brand-mark")) return;
      brand.innerHTML = '<span class="brand-mark">A</span><span class="brand-copy">AgendaFlow</span>';
    });
  };

  const renderIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    enhanceBrand();
    enhanceSidebar();
    enhanceButtons();
    enhanceTopbar();
    renderIcons();
  });
})();
