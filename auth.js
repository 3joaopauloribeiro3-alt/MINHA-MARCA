/* =========================================================
   NOME STREETWEAR — AUTENTICAÇÃO
   Login / Cadastro / Sessão / Logout
   ========================================================= */

const USERS_KEY = "nome_streetwear_users";
const SESSION_KEY = "nome_streetwear_session";


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function getUsers() {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error("Erro ao carregar sessão:", error);
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    })
  );
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function generateUserId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}

function authMessage(elementId, message, type = "error") {
  const element = document.getElementById(elementId);

  if (!element) return;

  element.textContent = message;
  element.className = `auth-message ${type}`;
  element.style.display = "block";
}


/* =========================================================
   CADASTRO
   ========================================================= */

function registerUser(event) {
  event.preventDefault();

  const nameInput = document.getElementById("registerName");
  const emailInput = document.getElementById("registerEmail");
  const passwordInput = document.getElementById("registerPassword");
  const confirmInput = document.getElementById("registerPasswordConfirm");

  if (
    !nameInput ||
    !emailInput ||
    !passwordInput ||
    !confirmInput
  ) {
    return;
  }

  const name = nameInput.value.trim();
  const email = normalizeEmail(emailInput.value);
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  /* -----------------------------------------
     VALIDAÇÕES
     ----------------------------------------- */

  if (name.length < 2) {
    authMessage(
      "registerMessage",
      "Digite seu nome completo."
    );
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    authMessage(
      "registerMessage",
      "Digite um e-mail válido."
    );
    return;
  }

  if (password.length < 6) {
    authMessage(
      "registerMessage",
      "A senha precisa ter pelo menos 6 caracteres."
    );
    return;
  }

  if (password !== confirmPassword) {
    authMessage(
      "registerMessage",
      "As senhas não coincidem."
    );
    return;
  }

  /* -----------------------------------------
     VERIFICA SE E-MAIL JÁ EXISTE
     ----------------------------------------- */

  const users = getUsers();

  const existingUser = users.find(
    user => user.email === email
  );

  if (existingUser) {
    authMessage(
      "registerMessage",
      "Já existe uma conta com este e-mail."
    );
    return;
  }

  /* -----------------------------------------
     CRIA USUÁRIO
     ----------------------------------------- */

  const newUser = {
    id: generateUserId(),
    name: name,
    email: email,

    /*
      IMPORTANTE:
      Isto é apenas para demonstração local.
      Não use armazenamento de senha assim em produção.
    */
    password: password,

    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  saveUsers(users);

  /* -----------------------------------------
     LOGIN AUTOMÁTICO APÓS CADASTRO
     ----------------------------------------- */

  saveSession(newUser);

  authMessage(
    "registerMessage",
    "Conta criada com sucesso! Redirecionando...",
    "success"
  );

  setTimeout(() => {
    window.location.href = "conta.html";
  }, 700);
}


/* =========================================================
   LOGIN
   ========================================================= */

function loginUser(event) {
  event.preventDefault();

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) {
    return;
  }

  const email = normalizeEmail(emailInput.value);
  const password = passwordInput.value;

  if (!email || !password) {
    authMessage(
      "loginMessage",
      "Preencha todos os campos."
    );
    return;
  }

  const users = getUsers();

  const user = users.find(
    item =>
      item.email === email &&
      item.password === password
  );

  if (!user) {
    authMessage(
      "loginMessage",
      "E-mail ou senha incorretos."
    );
    return;
  }

  /* -----------------------------------------
     CRIA SESSÃO
     ----------------------------------------- */

  saveSession(user);

  authMessage(
    "loginMessage",
    "Login realizado com sucesso! Redirecionando...",
    "success"
  );

  setTimeout(() => {
    const redirect =
      new URLSearchParams(window.location.search)
        .get("redirect");

    if (redirect) {
      window.location.href = redirect;
    } else {
      window.location.href = "conta.html";
    }
  }, 500);
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {
  clearSession();

  window.location.href = "index.html";
}


/* =========================================================
   PROTEGER PÁGINAS
   ========================================================= */

function requireLogin() {
  const user = getCurrentUser();

  if (user) {
    return user;
  }

  const currentPage =
    window.location.pathname.split("/").pop();

  window.location.href =
    `login.html?redirect=${encodeURIComponent(currentPage)}`;

  return null;
}


/* =========================================================
   REDIRECIONAR USUÁRIO JÁ LOGADO
   ========================================================= */

function redirectIfLoggedIn() {
  const user = getCurrentUser();

  if (!user) return;

  const page =
    window.location.pathname.split("/").pop();

  if (
    page === "login.html" ||
    page === "cadastro.html"
  ) {
    window.location.href = "conta.html";
  }
}


/* =========================================================
   PREENCHER DADOS DA CONTA
   ========================================================= */

function loadAccountData() {
  const user = getCurrentUser();

  if (!user) return;

  const nameElements =
    document.querySelectorAll("[data-user-name]");

  const emailElements =
    document.querySelectorAll("[data-user-email]");

  nameElements.forEach(element => {
    element.textContent = user.name;
  });

  emailElements.forEach(element => {
    element.textContent = user.email;
  });
}


/* =========================================================
   ATUALIZAR MENU / HEADER
   ========================================================= */

function updateAuthUI() {
  const user = getCurrentUser();

  const accountLinks =
    document.querySelectorAll("[data-account-link]");

  accountLinks.forEach(link => {

    if (user) {
      link.textContent = "Minha conta";
      link.href = "conta.html";
    } else {
      link.textContent = "Entrar";
      link.href = "login.html";
    }

  });
}


/* =========================================================
   EDITAR DADOS BÁSICOS
   ========================================================= */

function updateAccountData(event) {
  event.preventDefault();

  const user = getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const nameInput =
    document.getElementById("accountName");

  if (!nameInput) return;

  const newName = nameInput.value.trim();

  if (newName.length < 2) {
    authMessage(
      "accountMessage",
      "Digite um nome válido."
    );
    return;
  }

  const users = getUsers();

  const userIndex = users.findIndex(
    item => item.id === user.id
  );

  if (userIndex === -1) {
    return;
  }

  users[userIndex].name = newName;

  saveUsers(users);

  saveSession(users[userIndex]);

  authMessage(
    "accountMessage",
    "Dados atualizados com sucesso.",
    "success"
  );

  loadAccountData();
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  redirectIfLoggedIn();

  updateAuthUI();

  loadAccountData();

});
