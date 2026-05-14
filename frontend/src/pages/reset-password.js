document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetPasswordForm");
  const senhaInput = document.getElementById("novaSenha");
  const confirmarSenhaInput = document.getElementById("confirmarNovaSenha");
  const messageElement = document.getElementById("resetMessage");
  const errorElement = document.getElementById("resetError");
  const submitButton = form.querySelector('button[type="submit"]');

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  const showMessage = (message) => {
    messageElement.textContent = message;
    messageElement.style.display = message ? "block" : "none";
  };

  const showError = (message) => {
    errorElement.textContent = message;
    senhaInput.classList.toggle("error-input", Boolean(message));
    confirmarSenhaInput.classList.toggle("error-input", Boolean(message));
  };

  if (!accessToken || !refreshToken) {
    showError("Link de redefinição inválido ou expirado. Solicite um novo link na tela de login.");
    submitButton.disabled = true;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    showMessage("");

    const novaSenha = senhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();

    if (novaSenha.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      showError("As senhas não coincidem.");
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = "Salvando...";
      const res = await authService.resetPassword({
        access_token: accessToken,
        refresh_token: refreshToken,
        nova_senha: novaSenha
      });

      showMessage(res.mensagem || "Senha redefinida com sucesso.");
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1800);
    } catch (error) {
      showError(error.message || "Não foi possível redefinir a senha.");
      submitButton.disabled = false;
      submitButton.textContent = "Salvar nova senha";
    }
  });
});
