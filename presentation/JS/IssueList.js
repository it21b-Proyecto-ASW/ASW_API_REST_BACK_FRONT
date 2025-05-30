/* =========================================================================
   Issue List � l�gica de frontend
   ======================================================================= */

const API_BASE = "/api";

/* ------------ Utilidades r�pidas ---------------- */
const $ = sel => document.querySelector(sel);
const create = (tag, cls) => Object.assign(document.createElement(tag), { className: cls ?? "" });

/* -------- NAVBAR -------------------- */
document.addEventListener('DOMContentLoaded', function() {
    const userDropdown = document.getElementById('user-dropdown');

    // Load users from API
    async function loadUsers() {
        try {
            const response = await fetch(`${API_BASE}/users`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const users = await response.json();

            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.nombre;
                userDropdown.appendChild(option);
            });

            // Set current user if exists
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                userDropdown.value = currentUser;
            }

        } catch (error) {
            console.error('Error loading users:', error);
            userDropdown.innerHTML = '<option value="">Error loading users</option>';
        }
    }

    // Handle user selection change
    userDropdown.addEventListener('change', function() {
        const selectedUser = this.value;
        if (selectedUser) {
            localStorage.setItem('currentUser', selectedUser);
        }
    });

    // Initialize
    loadUsers();
});

/* ======================================================================
   1.  SELECTS DE FILTRO (parte superior de la lista)
   ====================================================================== */
async function loadFilterOptions() {
    try {
        const [tipos, estados, prioridades, severidades] = await Promise.all([
            fetch(`${API_BASE}/settings/tipos`).then(r => r.json()),
            fetch(`${API_BASE}/settings/estados`).then(r => r.json()),
            fetch(`${API_BASE}/settings/prioridades`).then(r => r.json()),
            fetch(`${API_BASE}/settings/severidades`).then(r => r.json()),
        ]);

        fillSelect("#filter-type", tipos, "nombre", "id");
        fillSelect("#filter-state", estados, "nombre", "id");
        fillSelect("#filter-prio", prioridades, "nombre", "id");
        fillSelect("#filter-sev", severidades, "nombre", "id");
    } catch (err) {
        console.error("Error cargando filtros:", err);
    }
}

function fillSelect(selector, data, labelKey, valueKey) {
    const selEl = $(selector);
    selEl.innerHTML = '<option value="" disabled selected hidden>Selecciona</option>';
    data.forEach(item => {
        const opt = create("option");
        opt.value = item[valueKey];
        opt.textContent = item[labelKey];
        selEl.appendChild(opt);
    });
}

/* ======================================================================
   2.  CARGAR Y RENDERIZAR ISSUES
   ====================================================================== */
async function loadIssues() {
    try {
        const params = new URLSearchParams();

        const q = $("#search-input").value.trim();
        if (q) params.append("search", q);

        appendIf(params, "tipo", $("#filter-type").value);
        appendIf(params, "estado", $("#filter-state").value);
        appendIf(params, "prioridad", $("#filter-prio").value);
        appendIf(params, "severidad", $("#filter-sev").value);

        const issues = await fetch(`${API_BASE}/issues/?${params.toString()}`).then(r => r.json());
        renderIssues(issues);
    } catch (err) {
        console.error("Error cargando issues:", err);
    }
}

const appendIf = (params, key, value) => value && params.append(key, value);

function renderIssues(issues) {
    const list = $("#issue-list");
    list.innerHTML = "";

    if (issues.length === 0) {
        list.textContent = "No se han encontrado issues.";
        return;
    }

    issues.forEach(issue => {
        const card = create("div", "issue-card");
        const title = create("h3");
        title.textContent = issue.nombre;          //  campo de tu API
        card.appendChild(title);

        const view = create("a", "btn primary");
        view.href = `Issue.html?id=${issue.id}`;
        view.textContent = "View";
        card.appendChild(view);

        list.appendChild(card);
    });
}

/* ======================================================================
   3.  MODAL "NUEVO ISSUE"
   ====================================================================== */
const modal = $("#issue-modal");
const openBtn = $("#new-issue-btn");
const closeBtn = $("#modal-close");
const form = $("#issue-form");

openBtn.addEventListener("click", async () => {
    await loadModalOptions();
    modal.classList.add("show");
});

closeBtn.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

/* ---- selects del modal ------------------------------------------------ */
async function loadModalOptions() {
    try {
        const [estados, tipos, prioridades, severidades, usuarios] = await Promise.all([
            fetch(`${API_BASE}/settings/estados`).then(r => r.json()),
            fetch(`${API_BASE}/settings/tipos`).then(r => r.json()),
            fetch(`${API_BASE}/settings/prioridades`).then(r => r.json()),
            fetch(`${API_BASE}/settings/severidades`).then(r => r.json()),
            fetch(`${API_BASE}/users/`).then(r => r.json()),
        ]);

        fillSelect("#estado", estados, "nombre", "id");
        fillSelect("#tipo", tipos, "nombre", "id");
        fillSelect("#prioridad", prioridades, "nombre", "id");
        fillSelect("#severidad", severidades, "nombre", "id");
        fillSelect("#assignedUser", usuarios, "nombre", "id");
        fillSelect("#watcherUser", usuarios, "nombre", "id");
    } catch (err) {
        console.error("Error cargando selects del modal:", err);
    }
}

/* ---- envio del formulario -------------------------------------------- */
form.addEventListener("submit", async e => {
    e.preventDefault();

    const multi = sel => Array.from($(sel).selectedOptions).map(o => Number(o.value));

    const payload = {
        nombre: $("#subject").value.trim(),
        description: $("#description").value.trim(),
        estado: $("#estado").value || null,
        tipo: $("#tipo").value || null,
        prioridad: $("#prioridad").value || null,
        severidad: $("#severidad").value || null,
        deadline: $("#deadline").value || null,
        assignedTo: multi("#assignedUser"),
        watchers: multi("#watcherUser"),
        // author lo pones en el backend con request.user o similar
    };

    try {
        const res = await fetch(`${API_BASE}/issues/create/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al crear issue");
        modal.classList.remove("show");
        form.reset();
        await loadIssues();
    } catch (err) {
        alert(err.message);
    }
});

/* ======================================================================
   4.  EVENTOS GENERALES / INICIALIZACION
   ====================================================================== */
$("#search-btn").addEventListener("click", loadIssues);
$("#filter-btn").addEventListener("click", loadIssues);
$("#search-input").addEventListener("keypress", e => { if (e.key === "Enter") loadIssues(); });

window.addEventListener("DOMContentLoaded", async () => {
    await loadFilterOptions();
    await loadIssues();
});



async function createIssue() {


    const errors = [];

    const subject = $("#subject").value.trim();
    const description = $("#description").value.trim();
    const creationDate = $("#creationDate").value; 

    if (!subject) errors.push("El campo �Subject� es obligatorio.");
    if (subject.length > 20) errors.push("�Subject� no puede superar 20 caracteres.");

    if (!description) errors.push("El campo �Description� es obligatorio.");
    if (!creationDate) errors.push("Debes seleccionar la �Creation Date�.");

    if (errors.length) {
        alert(errors.join("\n"));
        return; 
    }


    const multi = sel => Array.from($(sel).selectedOptions).map(o => Number(o.value));

    const payload = {
        nombre: subject,
        description: description,
        creationDate: creationDate,                                   // NUEVO
        estado: $("#estado").value ? Number($("#estado").value) : null,
        tipo: $("#tipo").value ? Number($("#tipo").value) : null,
        prioridad: $("#prioridad").value ? Number($("#prioridad").value) : null,
        severidad: $("#severidad").value ? Number($("#severidad").value) : null,
        assignedTo: multi("#assignedUser"),
        watchers: multi("#watcherUser"),
        deadline: $("#deadline").value || null,
    };


    try {
        const res = await fetch(`${API_BASE}/issues/create/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || JSON.stringify(err));
        }

        modal.classList.remove("show");
        $("#issue-form").reset();
        await loadIssues();

    } catch (err) {
        alert(`No se pudo crear el issue:\n${err.message}`);
        console.error(err);
    }
}

$("#createBtn").addEventListener("click", createIssue);


