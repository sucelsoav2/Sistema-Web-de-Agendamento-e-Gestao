document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorElement = document.getElementById("erro");
  const loginMessageElement = document.getElementById("loginMessage");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const submitButton = form.querySelector('button[type="submit"]');
  const resendConfirmationBtn = document.getElementById("resendConfirmationBtn");
  const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

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

  const showLoginMessage = (message) => {
    loginMessageElement.textContent = message;
    loginMessageElement.style.display = message ? "block" : "none";
  };

  const toggleResendConfirmation = (visible) => {
    resendConfirmationBtn.style.display = visible ? "block" : "none";
  };

  const pendingLoginMessage = sessionStorage.getItem("loginMessage");
  if (pendingLoginMessage) {
    showLoginMessage(pendingLoginMessage);
    sessionStorage.removeItem("loginMessage");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    showLoginMessage("");
    toggleResendConfirmation(false);
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
      toggleResendConfirmation(error.codigo === "EMAIL_NAO_CONFIRMADO");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
    }
  });

  resendConfirmationBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!isEmailValid(email)) {
      showError("Informe um email válido para reenviar a confirmação.");
      return;
    }

    try {
      resendConfirmationBtn.disabled = true;
      resendConfirmationBtn.textContent = "Reenviando...";
      const res = await authService.resendConfirmation(email);
      showError(res.mensagem || "Enviamos um novo link de confirmação para seu email.");
    } catch (error) {
      showError(error.message || "Não foi possível reenviar a confirmação.");
    } finally {
      resendConfirmationBtn.disabled = false;
      resendConfirmationBtn.textContent = "Reenviar confirmação";
    }
  });

  forgotPasswordBtn.addEventListener("click", async () => {
    showError("");
    const email = emailInput.value.trim();
    if (!isEmailValid(email)) {
      showError("Digite seu email no campo acima para recuperar a senha.");
      return;
    }

    try {
      forgotPasswordBtn.disabled = true;
      forgotPasswordBtn.textContent = "Enviando...";
      const res = await authService.requestPasswordReset(email);
      showLoginMessage(res.mensagem || "Enviamos um link de redefinição de senha para seu email.");
    } catch (error) {
      showError(error.message || "Não foi possível enviar a recuperação de senha.");
    } finally {
      forgotPasswordBtn.disabled = false;
      forgotPasswordBtn.textContent = "Esqueceu sua senha?";
    }
  });
});
