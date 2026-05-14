document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const telefoneInput = document.getElementById("telefone");
  const nascimentoInput = document.getElementById("data_nascimento");
  const senhaInput = document.getElementById("senha");
  const confirmSenhaInput = document.getElementById("confirmSenha");
  const fotoBase64Input = document.getElementById("fotoBase64");
  const emailValidation = document.getElementById("emailValidation");
  const telefoneValidation = document.getElementById("telefoneValidation");
  const birthValidation = document.getElementById("birthValidation");
  
  const themeToggle = document.getElementById("themeToggle");
  const errorElement = document.getElementById("registerError");
  const body = document.body;

  const updateTheme = (dark) => {
    body.classList.toggle("dark-mode", dark);
    body.setAttribute("data-theme", dark ? "dark" : "light");
  };

  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const normalizePhone = (value) => value.replace(/\D/g, "");

  const isBrazilianMobileValid = (value) => {
    let digits = normalizePhone(value);
    if (digits.startsWith("55") && digits.length === 13) digits = digits.slice(2);
    if (digits.length !== 11) return false;
    const ddd = Number(digits.slice(0, 2));
    return ddd >= 11 && ddd <= 99 && digits[2] === "9";
  };

  const calculateAge = (dateValue) => {
    if (!dateValue || dateValue.length !== 10) return null;
    const birth = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
  };

  const setFieldState = (input, element, message, success = false) => {
    element.textContent = message;
    element.classList.toggle("success", Boolean(success && message));
    input.classList.toggle("invalid-input", Boolean(message && !success));
    input.classList.toggle("valid-input", Boolean(message && success));
  };

  const validateEmailField = () => {
    const email = emailInput.value.trim();
    if (!email) {
      setFieldState(emailInput, emailValidation, "");
      return false;
    }
    if (!isEmailValid(email)) {
      setFieldState(emailInput, emailValidation, "Insira um email válido.");
      return false;
    }
    setFieldState(emailInput, emailValidation, "Email válido.", true);
    return true;
  };

  const validatePhoneField = () => {
    const telefone = telefoneInput.value.trim();
    if (!telefone) {
      setFieldState(telefoneInput, telefoneValidation, "");
      return false;
    }
    if (!isBrazilianMobileValid(telefone)) {
      setFieldState(telefoneInput, telefoneValidation, "Insira um número de celular válido.");
      return false;
    }
    setFieldState(telefoneInput, telefoneValidation, "Celular válido.", true);
    return true;
  };

  const validateBirthField = () => {
    const age = calculateAge(nascimentoInput.value);
    if (age === null) {
      setFieldState(nascimentoInput, birthValidation, "");
      return false;
    }
    if (age < 18) {
      setFieldState(nascimentoInput, birthValidation, "Plataforma valida apenas para maiores de 18 anos!");
      return false;
    }
    if (age > 100) {
      setFieldState(nascimentoInput, birthValidation, "Data inválida");
      return false;
    }
    setFieldState(nascimentoInput, birthValidation, "Data válida.", true);
    return true;
  };

  themeToggle.addEventListener("change", (event) => {
    updateTheme(event.target.checked);
  });

  emailInput.addEventListener("input", validateEmailField);
  telefoneInput.addEventListener("input", validatePhoneField);
  nascimentoInput.addEventListener("input", validateBirthField);
  nascimentoInput.addEventListener("change", validateBirthField);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorElement.textContent = "";

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const data_nascimento = nascimentoInput.value;
    const senha = senhaInput.value.trim();
    const confirmSenha = confirmSenhaInput.value.trim();
    const foto_perfil = fotoBase64Input.value;

    // Checagem Granular e Explícita (como solicitado)
    if (!foto_perfil) {
      document.getElementById("profilePicPreview").style.borderColor = "#dc2626";
      return alert("Atenção: Você precisa escolher uma Foto de Perfil!");
    } else {
      document.getElementById("profilePicPreview").style.borderColor = "#e5e7eb";
    }

    if (!nome) return alert("Atenção: Falta preencher o seu Nome Completo!");
    if (!email) return alert("Atenção: Falta preencher o seu Email!");
    if (!telefone) return alert("Atenção: Falta preencher o seu Telefone!");
    if (!data_nascimento) return alert("Atenção: Falta preencher a sua Data de Nascimento!");
    if (!senha) return alert("Atenção: Falta preencher a Senha!");
    if (!confirmSenha) return alert("Atenção: Falta Confirmar a Senha!");

    if (!validateEmailField()) return alert("Atenção: Informe um email válido.");
    if (!validatePhoneField()) return alert("Atenção: Informe um número de celular válido.");
    if (!validateBirthField()) return alert(birthValidation.textContent || "Atenção: Informe uma data de nascimento válida.");

    if (senha.length < 6) {
      return alert("Atenção: A senha deve ter pelo menos 6 caracteres.");
    }

    if (senha !== confirmSenha) {
      return alert("Atenção: As senhas não coincidem.");
    }

    try {
      const btn = event.target.querySelector('button');
      btn.disabled = true;
      btn.textContent = "Criando conta...";

      // Envia todos os campos para o servidor
      await authService.register({ nome, email, senha, telefone, data_nascimento, foto_perfil });
      
      alert("Conta criada com sucesso! Confirme seu email antes de fazer login.");
      window.location.href = "./login.html";
    } catch (error) {
      const btn = event.target.querySelector('button');
      btn.disabled = false;
      btn.textContent = "Criar conta";
      
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar: " + error.message);
    }
  });

  // Lógica de Captura e Redimensionamento da Foto de Perfil
  const fotoInput = document.getElementById("fotoInput");
  const previewImg = document.getElementById("previewImg");
  const placeholderIcon = document.getElementById("placeholderIcon");
  const profilePicPreview = document.getElementById("profilePicPreview");

  fotoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      profilePicPreview.style.borderColor = "#e5e7eb"; // Reseta a cor de erro
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
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
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          
          fotoBase64Input.value = base64;
          previewImg.src = base64;
          previewImg.style.display = "block";
          placeholderIcon.style.display = "none";
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
});
