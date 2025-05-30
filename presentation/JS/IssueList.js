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

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

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

function fillSelect(selector, data, labelKey, valueKey, selected = null) {
    const selEl = $(selector);
    selEl.innerHTML = '';                          // vaciar siempre

 
    const ph = document.createElement('option');   
    ph.textContent = 'Selecciona';
    ph.value = '';
    ph.disabled = true;
    ph.hidden = true;
    ph.selected = !selected;                     
    selEl.appendChild(ph);                       

    // opciones reales
    data.forEach(item => {
        const opt = create("option");
        opt.value = item[valueKey];
        opt.textContent = item[labelKey];
        if (+item[valueKey] === +selected) opt.selected = true;
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


    const multi = sel => Array.from($(sel).selectedOptions)
        .map(o => o.value)
        .filter(v => v !== "")
        .map(Number);

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
/* ===== helpers reutilizables ========================================= */
const multi = sel => Array.from($(sel).selectedOptions)
    .map(o => +o.value).filter(Boolean);

function setMulti(sel, values = []) {
    Array.from($(sel).options).forEach(o => {
        o.selected = values.includes(+o.value);
    });
}

async function lookups() {
    return Promise.all([
        fetch(`${API_BASE}/settings/estados`).then(r => r.json()),
        fetch(`${API_BASE}/settings/tipos`).then(r => r.json()),
        fetch(`${API_BASE}/settings/prioridades`).then(r => r.json()),
        fetch(`${API_BASE}/settings/severidades`).then(r => r.json()),
        fetch(`${API_BASE}/users/`).then(r => r.json())
    ]);
}

function fill(sel, data, selected) {
    sel.innerHTML = "";

    const placeholder = create("option");
    placeholder.textContent = "Selecciona";
    placeholder.disabled = true;
    placeholder.hidden = true;
    placeholder.selected = selected === null || selected === undefined;
    sel.appendChild(placeholder);

    data.forEach(it => {
        const opt = create("option");
        opt.value = it.id;
        opt.textContent = it.nombre;
        if (+it.id === +selected) opt.selected = true;
        sel.appendChild(opt);
    });
}

/* ===== View =========================================================== */
async function openView(id) {
    const data = await fetch(`${API_BASE}/issues/${id}/`).then(r => r.json());
    const [estados, tipos, prio, sev, users] = await lookups();

    $("#v-subject").value = data.nombre;
    $("#v-desc").value = data.description;
    $("#v-created").value = data.creationDate ?? "";
    $("#v-deadline").value = data.deadline ?? "";

    fill($("#v-estado"), estados, data.estado);
    fill($("#v-tipo"), tipos, data.tipo);
    fill($("#v-prio"), prio, data.prioridad);
    fill($("#v-sev"), sev, data.severidad);

    fill($("#v-assigned"), users);
    fill($("#v-watchers"), users);
    setMulti("#v-assigned", data.assignedTo || []);
    setMulti("#v-watchers", data.watchers || []);

    $("#view-modal").classList.add("show");
}

/* ===== Edit =========================================================== */
let editId = null;

async function openEdit(id) {
    editId = id;
    const data = await fetch(`${API_BASE}/issues/${id}/`).then(r => r.json());
    const [estados, tipos, prio, sev, users] = await lookups();

    $("#e-subject").value = data.nombre;
    $("#e-desc").value = data.description;
    $("#e-created").value = data.creationDate ?? "";
    $("#e-deadline").value = data.deadline ?? "";

    fill($("#e-estado"), estados, data.estado);
    fill($("#e-tipo"), tipos, data.tipo);
    fill($("#e-prio"), prio, data.prioridad);
    fill($("#e-sev"), sev, data.severidad);

    fill($("#e-assigned"), users);
    fill($("#e-watchers"), users);
    setMulti("#e-assigned", data.assignedTo || []);
    setMulti("#e-watchers", data.watchers || []);

    $("#edit-modal").classList.add("show");
}

$("#saveEditBtn").addEventListener("click", async () => {
    if (!editId) return;

    const payload = {
        nombre: $("#e-subject").value.trim(),
        description: $("#e-desc").value.trim(),
        creationDate: $("#e-created").value || null,
        deadline: $("#e-deadline").value || null,
        estado: $("#e-estado").value || null,
        tipo: $("#e-tipo").value || null,
        prioridad: $("#e-prio").value || null,
        severidad: $("#e-sev").value || null,
        assignedTo: multi("#e-assigned"),
        watchers: multi("#e-watchers"),
    };

    const res = await fetch(`${API_BASE}/issues/${editId}/edit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) { alert("Error al guardar cambios"); return; }
    $("#edit-modal").classList.remove("show");
    await loadIssues();
});

/* ===== Tarjetas con botones View / Edit ============================== */
function renderIssues(issues) {
    const list = $("#issue-list"); list.innerHTML = "";
    if (!issues.length) { list.textContent = "No se han encontrado issues."; return; }

    issues.forEach(it => {
        const card = create("div", "issue-card");
        card.appendChild(Object.assign(create("h3"), { textContent: it.nombre }));

        const bEdit = create("button", "btn warn"); bEdit.textContent = "Edit";
        bEdit.onclick = () => openEdit(it.id); card.appendChild(bEdit);

        const bView = create("button", "btn primary"); bView.textContent = "View";
        bView.onclick = () => openView(it.id); card.appendChild(bView);

        list.appendChild(card);
    });
}


document.querySelectorAll("[data-close]").forEach(b => {
    b.addEventListener("click", () => $("#" + b.dataset.close + "-modal").classList.remove("show"));
});
window.addEventListener("click", e => {
    if (e.target.classList.contains("modal")) e.target.classList.remove("show");
});

const drafts = [];              

function readForm() {          
    const required = $("#subject").value.trim();
    if (!required) return null;  
    const errors = [];

    if (required.length > 20) errors.push("«Subject» supera 20 caracteres.");
    if (!$("#description").value.trim()) errors.push("Description es obligatoria.");
    if (!$("#creationDate").value) errors.push("Creation Date es obligatoria.");

    if (errors.length) { alert(errors.join("\n")); return null; }

    const multi = sel => Array.from($(sel).selectedOptions).map(o => +o.value).filter(Boolean);

    return {
        nombre: required,
        description: $("#description").value.trim(),
        creationDate: $("#creationDate").value,
        deadline: $("#deadline").value || null,
        estado: $("#estado").value || null,
        tipo: $("#tipo").value || null,
        prioridad: $("#prioridad").value || null,
        severidad: $("#severidad").value || null,
        assignedTo: multi("#assignedUser"),
        watchers: multi("#watcherUser")
    };
}

$("#addIssueBtn").addEventListener("click", () => {
    const payload = readForm();
    if (!payload) return;

    drafts.push(payload);
    renderDrafts();      
    form.reset();


    form.querySelectorAll("select").forEach(s => s.selectedIndex = 0);
});

async function createIssue() {
    const last = readForm();                 // lee lo que esté visible
    if (last) drafts.push(last);

    if (!drafts.length) { alert("No hay ningún issue para crear."); return; }

    let res = await fetch(`${API_BASE}/issues/bulk_insert/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drafts)
    });

    // 
    if (res.status === 404) {
        const results = await Promise.allSettled(
            drafts.map(d => fetch(`${API_BASE}/issues/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(d)
            }))
        );
        if (results.some(r => r.status === "rejected" || !r.value.ok)) {
            alert("Alguno de los issues no se creó correctamente"); return;
        }
    } else if (!res.ok) {
        alert("Error al crear issues"); return;
    }

    drafts.length = 0;
    renderDrafts();               // limpia la lista comprimida
    modal.classList.remove("show");
    form.reset();
    await loadIssues();
}

                  

function renderDrafts() {
    const list = $("#draftsList");
    list.innerHTML = "";
    drafts.forEach((d, i) => {
        const li = document.createElement("li");
        li.innerHTML =
            `<span title="${d.nombre}">${d.nombre}</span>
             <button aria-label="Eliminar" onclick="removeDraft(${i})">&times;</button>`;
        list.appendChild(li);
    });
}

function removeDraft(idx) {
    drafts.splice(idx, 1);
    renderDrafts();
}