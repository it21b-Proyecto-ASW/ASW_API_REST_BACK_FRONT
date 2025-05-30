const API_BASE = "/api";
(function () {
    var real = window.fetch.bind(window);

    window.fetch = function (url, opts) {
        opts = opts || {};
        if (typeof url === "string" && url.indexOf(API_BASE) === 0) {
            var key = localStorage.getItem("currentUserKey");
            if (key) {
                opts.headers = opts.headers || {};
                opts.headers["X-API-Key"] = key;
            }
        }
        return real(url, opts);
    };
})();

const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status} en ${url}: ${text}`);
    }
    return res.json();
};

const $ = sel => document.querySelector(sel);
const create = (tag, cls) => Object.assign(document.createElement(tag), { className: cls ?? "" });

/* -------- NAVBAR -------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const userDropdown = document.getElementById('user-dropdown');
    const usersCache = {};

    async function loadUsers() {
        const users = await fetchJson(`${API_BASE}/users/`);

        users.forEach(u => {
            usersCache[u.id] = u.apikey;

            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.nombre;
            userDropdown.appendChild(opt);

            if (u.selected) {
                localStorage.setItem('currentUser', u.id);
                localStorage.setItem('currentUserKey', u.apikey);
            }
        });

        const saved = localStorage.getItem('currentUser');
        if (saved) {
            userDropdown.value = saved;
            localStorage.setItem('currentUserKey', usersCache[saved] || '');
        }
    }

    userDropdown.addEventListener('change', e => {
        const id = e.target.value;
        localStorage.setItem('currentUser', id);
        localStorage.setItem('currentUserKey', usersCache[id] || '');
    });

    // Initialize
    loadUsers();
});

async function loadFilterOptions() {
    try {
        const [tipos, estados, prioridades, severidades] = await Promise.all([
            fetchJson(`${API_BASE}/settings/tipos`),
            fetchJson(`${API_BASE}/settings/estados`),
            fetchJson(`${API_BASE}/settings/prioridades`),
            fetchJson(`${API_BASE}/settings/severidades`),
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
    selEl.innerHTML = '';

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

$("#search-btn").addEventListener("click", loadIssues);
$("#filter-btn").addEventListener("click", loadIssues);
$("#search-input").addEventListener("keypress", e => { if (e.key === "Enter") loadIssues(); });

window.addEventListener("DOMContentLoaded", async () => {
    await loadFilterOptions();
    await loadIssues();
});

// Función auxiliar para obtener valores múltiples de select
const multi = sel => Array.from($(sel).selectedOptions)
    .map(o => o.value)
    .filter(v => v !== "" && v !== null && v !== undefined)
    .map(Number)
    .filter(n => !isNaN(n));

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
    placeholder.value = "";
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

    const errors = [];
    const subject = $("#e-subject").value.trim();
    const description = $("#e-desc").value.trim();
    const creationDate = $("#e-created").value;

    // Validaciones básicas
    if (!subject) errors.push("El campo Subject es obligatorio.");
    if (subject.length > 20) errors.push("Subject no puede superar 20 caracteres.");
    if (!description) errors.push("El campo Description es obligatorio.");
    if (!creationDate) errors.push("Debes seleccionar la Creation Date.");

    if (errors.length) {
        alert(errors.join("\n"));
        return;
    }

    // Obtener el author del issue actual
    let currentAuthor;
    try {
        const currentIssue = await fetch(`${API_BASE}/issues/${editId}/`).then(r => r.json());
        currentAuthor = currentIssue.author;
    } catch (err) {
        alert("Error al obtener información del issue actual");
        return;
    }

    // Función para convertir valores de select
    const convertSelectValue = (value) => {
        if (!value || value === "" || value === "0") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    const payload = {
        nombre: subject,
        author: currentAuthor, // CRÍTICO: Incluir el author
        description: description,
        creationDate: creationDate,
        deadline: $("#e-deadline").value || null,
        estado: convertSelectValue($("#e-estado").value),
        tipo: convertSelectValue($("#e-tipo").value),
        prioridad: convertSelectValue($("#e-prio").value),
        severidad: convertSelectValue($("#e-sev").value),
        assignedTo: multi("#e-assigned"),
        watchers: multi("#e-watchers"),
    };

    try {
        const res = await fetch(`${API_BASE}/issues/${editId}/edit/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error response:", errorText);
            alert(`Error al guardar cambios: ${errorText}`);
            return;
        }

        $("#edit-modal").classList.remove("show");
        await loadIssues();
    } catch (err) {
        console.error("Error en saveEdit:", err);
        alert(`Error al guardar: ${err.message}`);
    }
});

async function createIssue() {
    const errors = [];
    const subject = $("#subject").value.trim();
    const description = $("#description").value.trim();
    const creationDate = $("#creationDate").value;

    if (!subject) errors.push("El campo Subject es obligatorio.");
    if (subject.length > 20) errors.push("Subject no puede superar 20 caracteres.");
    if (!description) errors.push("El campo Description es obligatorio.");
    if (!creationDate) errors.push("Debes seleccionar la Creation Date.");

    if (errors.length) {
        alert(errors.join("\n"));
        return;
    }

    // Obtener el usuario actual
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert("Debes seleccionar un usuario antes de crear un issue.");
        return;
    }

    // Función para convertir valores de select
    const convertSelectValue = (value) => {
        if (!value || value === "" || value === "0") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    const payload = {
        nombre: subject,
        author: Number(currentUser), // CRÍTICO: Incluir el author
        description: description,
        creationDate: creationDate,
        estado: convertSelectValue($("#estado").value),
        tipo: convertSelectValue($("#tipo").value),
        prioridad: convertSelectValue($("#prioridad").value),
        severidad: convertSelectValue($("#severidad").value),
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
            const errorText = await res.text();
            console.error("Error response:", errorText);
            throw new Error(errorText);
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

function renderIssues(issues) {
    const list = $("#issue-list"); 
    list.innerHTML = "";
    
    if (!issues.length) { 
        list.textContent = "No se han encontrado issues."; 
        return; 
    }

    issues.forEach(it => {
        const card = create("div", "issue-card");
        card.appendChild(Object.assign(create("h3"), { textContent: it.nombre }));

        const bEdit = create("button", "btn warn"); 
        bEdit.textContent = "Edit";
        bEdit.onclick = () => openEdit(it.id); 
        card.appendChild(bEdit);

        const bView = create("button", "btn primary"); 
        bView.textContent = "View";
        bView.onclick = () => openView(it.id); 
        card.appendChild(bView);

        list.appendChild(card);
    });
}

// Event listeners para cerrar modales
document.querySelectorAll("[data-close]").forEach(b => {
    b.addEventListener("click", () => $("#" + b.dataset.close + "-modal").classList.remove("show"));
});

window.addEventListener("click", e => {
    if (e.target.classList.contains("modal")) e.target.classList.remove("show");
});

// Sistema de drafts mejorado
const drafts = [];

function readForm() {
    const required = $("#subject").value.trim();
    if (!required) return null;
    
    const errors = [];
    if (required.length > 20) errors.push("«Subject» supera 20 caracteres.");
    if (!$("#description").value.trim()) errors.push("Description es obligatoria.");
    if (!$("#creationDate").value) errors.push("Creation Date es obligatoria.");

    if (errors.length) { 
        alert(errors.join("\n")); 
        return null; 
    }

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert("Debes seleccionar un usuario.");
        return null;
    }

    const convertSelectValue = (value) => {
        if (!value || value === "" || value === "0") return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    return {
        nombre: required,
        author: Number(currentUser), // CRÍTICO: Incluir el author
        description: $("#description").value.trim(),
        creationDate: $("#creationDate").value,
        deadline: $("#deadline").value || null,
        estado: convertSelectValue($("#estado").value),
        tipo: convertSelectValue($("#tipo").value),
        prioridad: convertSelectValue($("#prioridad").value),
        severidad: convertSelectValue($("#severidad").value),
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

async function createMultipleIssues() {
    const last = readForm();
    if (last) drafts.push(last);

    if (!drafts.length) { 
        alert("No hay ningún issue para crear."); 
        return; 
    }

    try {
        let res = await fetch(`${API_BASE}/issues/bulk-insert/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(drafts)
        });

        // Fallback si bulk-insert no existe
        if (res.status === 404) {
            const results = await Promise.allSettled(
                drafts.map(d => fetch(`${API_BASE}/issues/create/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(d)
                }))
            );
            
            const failed = results.filter(r => r.status === "rejected" || !r.value.ok);
            if (failed.length > 0) {
                console.error("Failed requests:", failed);
                alert("Alguno de los issues no se creó correctamente");
                return;
            }
        } else if (!res.ok) {
            const errorText = await res.text();
            console.error("Bulk insert error:", errorText);
            alert(`Error al crear issues: ${errorText}`);
            return;
        }

        drafts.length = 0;
        renderDrafts();
        modal.classList.remove("show");
        form.reset();
        await loadIssues();
        
    } catch (err) {
        console.error("Error creating multiple issues:", err);
        alert(`Error al crear issues: ${err.message}`);
    }
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