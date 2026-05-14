document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorElement = document.getElementById("erro");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const submitButton = form.querySelector('button[type="submit"]');

  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (authService.isAuthenticated()) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role_id === 1) {
        window.location.href = "./client-dashboard.html";
    } else if (user && user.role_id === 2) {
        window.location.href = "./professional-dashboard.html";
    } else {
        window.location.href = "./dashboard.html";
    }
    return;
  }

  const showError = (message) => {
    errorElement.textContent = message;
    emailInput.classList.toggle("error-input", Boolean(message));
    senhaInput.classList.toggle("error-input", Boolean(message));
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    submitButton.disabled = true;
    submitButton.textContent = "Entrando...";

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
      showError("Por favor, preencha email e senha.");
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
      return;
    }

    if (!isEmailValid(email)) {
      showError("Por favor, informe um email válido.");
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
      return;
    }

    if (senha.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres.");
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
      return;
    }

    try {
      await authService.login(email, senha);
      
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role_id === 1) {
          window.location.href = "./client-dashboard.html";
      } else if (user && user.role_id === 2) {
          window.location.href = "./professional-dashboard.html";
      } else {
          window.location.href = "./dashboard.html";
      }
    } catch (error) {
      showError(error.message || "Erro ao autenticar");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
    }
  });
});
