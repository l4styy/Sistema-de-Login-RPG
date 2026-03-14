const API = "http://localhost:3000";

// ------------------- REGISTER -------------------
async function registerUser() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        alert("Conta criada com sucesso!");
        window.location.href = "home.html";   // REDIRECIONA APÓS REGISTRO
    } else {
        alert(data.error || "Erro ao registrar");
    }
}

// ------------------- LOGIN -------------------
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        // LOGIN FUNCIONOU → REDIRECIONA PARA A HOME
        window.location.href = "home.html";
    } else {
        alert(data.error || "Erro ao fazer login");
    }
}

// ------------------- GET USER (home.html) -------------------
async function getUser() {
    const res = await fetch(`${API}/auth/me`, {
        method: "GET",
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
        window.location.href = "login.html";
        return;
    }

    // Corrigido:
    const user = data.user;

    document.getElementById("welcome").innerText =
        `Olá, ${user.username}!`;

    // 🔥 SE FOR ADMIN, APARECE O BOTÃO DO PAINEL
    if (user.isAdmin === 1) {
        document.getElementById("adminPanel").style.display = "block";
    }
}

// ------------------- LOGOUT -------------------
async function logout() {
    await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "login.html"; // volta para o login
}
