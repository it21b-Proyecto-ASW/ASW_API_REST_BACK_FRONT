/* =========================================================================
   Issue List – lógica de frontend
   -------------------------------------------------------------------------
   - Rellena selects de filtros con datos de la API
   - Carga y renderiza issues sin recargar la página
   - Aplica búsqueda y filtros en el cliente o solicitando al backend
   ======================================================================= */

/* ------------ Config ---------------- */
// TODO: Sustituye por la URL base real de tu API
const API_BASE = "/api";

/* ------------ Utilidades simples ---- */
const $ = sel => document.querySelector(sel);
const create = (tag, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
};

/* ------------ Poblar selects -------- */
async function loadFilterOptions() {
    try {
        // Ejemplo de endpoints; cámbialos por los tuyos
        const [types, states, prios, sevs] = await Promise.all([
            fetch(`${API_BASE}/types/`).then(r => r.json()),
            fetch(`${API_BASE}/states/`).then(r => r.json()),
            fetch(`${API_BASE}/priorities/`).then(r => r.json()),
            fetch(`${API_BASE}/severities/`).then(r => r.json()),
        ]);

        fillSelect("#filter-type", types, "name", "id");
        fillSelect("#filter-state", states, "name", "id");
        fillSelect("#filter-prio", prios, "name", "id");
        fillSelect("#filter-sev", sevs, "name", "id");

    } catch (err) {
        console.error("Error cargando filtros:", err);
    }
}

function fillSelect(selectSel, data, labelKey, valueKey) {
    const select = $(selectSel);
    data.forEach(item => {
        const opt = create("option");
        opt.value = item[valueKey];
        opt.textContent = item[labelKey];
        select.appendChild(opt);
    });
}

/* ------------ Obtener issues -------- */
async function loadIssues() {
    try {
        const params = new URLSearchParams();

        // Búsqueda
        const q = $("#search-input").value.trim();
        if (q) params.append("search", q);

        // Filtros
        appendIf(params, "type", $("#filter-type").value);
        appendIf(params, "state", $("#filter-state").value);
        appendIf(params, "priority", $("#filter-prio").value);
        appendIf(params, "severity", $("#filter-sev").value);

        const url = `${API_BASE}/issues/?${params.toString()}`;
        const issues = await fetch(url).then(r => r.json());
        renderIssues(issues);

    } catch (err) {
        console.error("Error cargando issues:", err);
    }
}

function appendIf(params, key, value) {
    if (value) params.append(key, value);
}

/* ------------ Renderizar lista ------- */
function renderIssues(issues) {
    const list = $("#issue-list");
    list.innerHTML = ""; // limpia

    if (issues.length === 0) {
        list.textContent = "No se han encontrado issues.";
        return;
    }

    issues.forEach(issue => {
        const card = create("div", "issue-card");

        const title = create("h3");
        title.textContent = issue.title;
        card.appendChild(title);

        const viewBtn = create("a", "btn primary");
        viewBtn.textContent = "View";
        viewBtn.href = `Issue.html?id=${issue.id}`; // o Issue.html#1  …
        card.appendChild(viewBtn);

        list.appendChild(card);
    });
}

/* ------------ Eventos ---------------- */
$("#search-btn").addEventListener("click", loadIssues);
$("#filter-btn").addEventListener("click", loadIssues);
// Enter en el input de búsqueda
$("#search-input").addEventListener("keypress", e => {
    if (e.key === "Enter") loadIssues();
});

/* ------------ Inicialización --------- */
window.addEventListener("DOMContentLoaded", async () => {
    await loadFilterOptions();
    await loadIssues();
});


const modal = $("#issue-modal");
const openBtn = $("#new-issue-btn");
const closeBtn = $("#modal-close");
const form = $("#issue-form");

openBtn.addEventListener("click", () => modal.classList.add("show"));
closeBtn.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("show");
});

/* ---- Enviar formulario ---- */
form.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
        title: $("#subject").value.trim(),
        description: $("#description").value.trim(),
        state: $("#estado").value || null,
        type: $("#tipo").value || null,
        priority: $("#prioridad").value || null,
        severity: $("#severidad").value || null,
        deadline: $("#deadline").value || null
    };
    try {
        const res = await fetch(`${API_BASE}/issues/create/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Error al crear issue");
        modal.classList.remove("show");
        form.reset();
        await loadIssues();             // refresca la lista
    } catch (err) { alert(err.message); }
});
