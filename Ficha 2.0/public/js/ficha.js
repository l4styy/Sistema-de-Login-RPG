// =========================
// CONFIGURAÇÃO DOS DADOS
// =========================

const CLASSES = [
    "Investigador", "Engenheiro", "Analista de Sistemas", "Cientista",
    "Médico", "Paramédico", "Militar", "Policial",
    "Detetive Particular", "Jornalista", "Escritor",
    "Historiador", "Professor", "Psicólogo", "Pesquisador"
];

const ORIGENS = [
    { nome: "Cientista", bonus: "Lógica, medicina e análise" },
    { nome: "Militar", bonus: "Combate, mira e disciplina" },
    { nome: "Acadêmico", bonus: "Tecnologia e investigação" }
];

const ATRIBUTOS = ["Corpo", "Inteligência", "Presença", "Vitalidade", "Mental"];

const PERICIAS = [
    "Agilidade", "Reflexo", "Força", "Atletismo",
    "Coragem", "Intuição", "Intimidação", "Manipulação",
    "Lábia", "Pilotagem", "Primeiros Socorros",
    "Medicina", "Tecnologia", "Atualidades",
    "Crime", "Mira", "Armas de Fogo", "Mecânica"
];

// =========================
// RENDER
// =========================

document.addEventListener("DOMContentLoaded", () => {
    renderClasses();
    renderOrigens();
    renderAtributos();
    renderPericias();

    setupSteps();
    setupFotoPreview();
    setupSalvar();
});

// -------------------------
// CARDS
// -------------------------

function renderClasses() {
    const div = document.getElementById("classes-list");
    CLASSES.forEach(cl => {
        div.innerHTML += `
            <div class="card-select selectable" data-value="${cl}">
                <h4>${cl}</h4>
            </div>
        `;
    });
    makeSelectable(div);
}

function renderOrigens() {
    const div = document.getElementById("origens-list");
    ORIGENS.forEach(o => {
        div.innerHTML += `
            <div class="card-select selectable" data-value="${o.nome}">
                <h4>${o.nome}</h4>
                <p>${o.bonus}</p>
            </div>
        `;
    });
    makeSelectable(div);
}

// -------------------------
// ATRIBUTOS
// -------------------------

function renderAtributos() {
    const div = document.getElementById("atributos-list");

    ATRIBUTOS.forEach(a => {
        div.innerHTML += `
            <div class="atributo-item">
                <label>${a}</label>
                <input type="number" class="attr-input" min="0" max="3" value="0" data-attr="${a}">
            </div>
        `;
    });
}

// -------------------------
// PERÍCIAS
// -------------------------

function renderPericias() {
    const div = document.getElementById("pericias-list");

    PERICIAS.forEach(p => {
        div.innerHTML += `
            <label class="checkbox-item">
                <input type="checkbox" class="pericia-check" value="${p}">
                ${p}
            </label>
        `;
    });
}

// =========================
// SELEÇÃO DE CARDS
// =========================

function makeSelectable(container) {
    container.addEventListener("click", e => {
        const card = e.target.closest(".selectable");
        if (!card) return;

        [...container.children].forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
    });
}

// =========================
// SISTEMA DE STEPS
// =========================

function setupSteps() {
    const circles = document.querySelectorAll(".step-circle");

    document.querySelectorAll(".next-step").forEach(btn => {
        btn.addEventListener("click", () => {
            const next = Number(btn.dataset.next);

            changeStep(next);
            updateStepCircles(next);
        });
    });

    document.querySelectorAll(".prev-step").forEach(btn => {
        btn.addEventListener("click", () => {
            const prev = Number(btn.dataset.prev);

            changeStep(prev);
            updateStepCircles(prev);
        });
    });

    function changeStep(step) {
        document.querySelectorAll(".step-panel").forEach(s => s.classList.add("hidden"));
        document.getElementById(`step-${step}`).classList.remove("hidden");
    }

    function updateStepCircles(step) {
        circles.forEach(c => c.classList.remove("active"));
        for (let i = 0; i < step; i++) {
            circles[i].classList.add("active");
        }
    }
}

// =========================
// FOTO - PREVIEW
// =========================

function setupFotoPreview() {
    const input = document.getElementById("foto");
    const preview = document.getElementById("previewFoto");

    input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;

        if (file.type !== "image/png") {
            alert("Somente PNG!");
            input.value = "";
            return;
        }

        preview.src = URL.createObjectURL(file);
        preview.classList.remove("hidden");
    });
}

// =========================
// SALVAR
// =========================

function setupSalvar() {
    document.getElementById("btnSalvar").addEventListener("click", async () => {

        const classe = document.querySelector("#classes-list .selected")?.dataset.value;
        const origem = document.querySelector("#origens-list .selected")?.dataset.value;

        if (!classe || !origem) return alert("Escolha classe e origem!");

        // atributos
        const inputs = [...document.querySelectorAll(".attr-input")];
        const atributos = {};
        let soma = 0;

        inputs.forEach(i => {
            const v = Number(i.value);
            atributos[i.dataset.attr] = v;
            soma += v;
        });

        if (soma !== 4) return alert("A soma dos atributos deve ser 4!");

        // perícias
        const pericias = [...document.querySelectorAll(".pericia-check:checked")]
            .map(e => e.value);

        if (pericias.length !== 6)
            return alert("Escolha 6 perícias!");

        // detalhes
        const nome = document.getElementById("nome").value;
        const historia = document.getElementById("historia").value;
        const medos = document.getElementById("medos").value;
        const aparencia = document.getElementById("aparencia").value;

        if (!nome) return alert("Dê um nome ao personagem.");

        // imagem base64
        let fotoBase64 = null;
        const file = document.getElementById("foto").files[0];
        if (file) fotoBase64 = await fileToBase64(file);

        // envio
        const payload = {
            classe, origem, atributos, pericias,
            nome, historia, medos, aparencia,
            foto: fotoBase64
        };

        const res = await fetch("/fichas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            alert("Ficha criada!");
            window.location.href = "home.html";
        } else {
            alert("Erro ao salvar ficha.");
        }
    });
}

function fileToBase64(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}
