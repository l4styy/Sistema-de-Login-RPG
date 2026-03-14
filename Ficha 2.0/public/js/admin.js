console.log("admin.js carregado");

// ----- ELEMENTOS -----
const menuBtn = document.getElementById("menuBtn");
const profileMenu = document.getElementById("profileMenu");
const profilePic = document.getElementById("profilePic");

// ============================
// 🔥 1. MENU SUPERIOR
// ============================
menuBtn.addEventListener("click", () => {
    profileMenu.classList.toggle("active");
});

// ============================
// 🔥 2. LOGOUT
// ============================
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "./index.html";
});

// ============================
// 🔥 3. CHECAR USUÁRIO + ADMIN
// ============================
async function verifyAdmin() {
    try {
        const res = await fetch("/auth/me", { credentials: "include" });
        if (!res.ok) {
            window.location.href = "./index.html";
            return;
        }

        const data = await res.json();
        const user = data.user;

        // coloca foto
        profilePic.src = user.profilePic || "./img/default.png";

        if (user.isAdmin !== 1) {
            alert("Acesso negado (não é admin)");
            window.location.href = "./home.html";
            return;
        }

        // admin ok → carregar conteúdo
        loadUsers();
        loadFichas();
    } catch (err) {
        console.error(err);
        window.location.href = "./index.html";
    }
}

// ============================
// 🔥 4. CARREGAR LISTA DE USUÁRIOS
// ============================
async function loadUsers() {
    try {
        const res = await fetch("/admin/users", { credentials: "include" });
        if (!res.ok) {
            document.getElementById("userList").innerHTML =
                "<p>Erro ao carregar usuários.</p>";
            return;
        }

        const data = await res.json();
        const users = data.users;

        let html = "";

        users.forEach(user => {
            html += `
                <div style="
                    background: rgba(255,255,255,0.07);
                    padding: 15px;
                    border-radius: 14px;
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <strong>${user.username || "Sem nome"}</strong> <br>
                        <span style="opacity:0.7;">${user.email}</span><br>
                        <span style="font-size:13px; opacity:0.6;">
                            Admin: ${user.isAdmin ? "Sim" : "Não"}
                        </span>
                    </div>

                    <button style="
                        padding: 8px 14px;
                        border-radius: 10px;
                        border: none;
                        background: rgba(255,255,255,0.2);
                        color: white;
                        cursor: pointer;
                    ">Gerenciar</button>
                </div>
            `;
        });

        document.getElementById("userList").innerHTML += html;

    } catch (err) {
        console.error(err);
        document.getElementById("userList").innerHTML =
            "<p>Erro ao carregar usuários.</p>";
    }
}

// ============================
// 🔥 5. CARREGAR FICHAS
// ============================
async function loadFichas() {
    let fichasContainer = document.createElement("div");
    fichasContainer.style.marginTop = "30px";

    let titulo = document.createElement("h3");
    titulo.innerText = "Fichas cadastradas";

    fichasContainer.appendChild(titulo);

    try {
        const res = await fetch("/admin/fichas", { credentials: "include" });
        if (!res.ok) {
            fichasContainer.innerHTML += "<p>Erro ao carregar fichas.</p>";
            document.getElementById("adminContent").appendChild(fichasContainer);
            return;
        }

        const data = await res.json();
        const fichas = data.fichas;

        if (fichas.length === 0) {
            fichasContainer.innerHTML += "<p>Nenhuma ficha cadastrada.</p>";
        } else {
            fichas.forEach(f => {
                fichasContainer.innerHTML += `
                    <div style="
                        background: rgba(255,255,255,0.07);
                        padding: 12px;
                        border-radius: 14px;
                        margin-bottom: 10px;
                    ">
                        <strong>${f.nome || "Sem nome"}</strong><br>
                        <span style="opacity:0.7;">ID do usuário: ${f.user_id}</span>
                    </div>
                `;
            });
        }

    } catch (err) {
        console.error(err);
        fichasContainer.innerHTML += "<p>Erro ao carregar fichas.</p>";
    }

    document.getElementById("adminContent").appendChild(fichasContainer);
}

// inicia tudo
verifyAdmin();
