/* ------------ Config ---------------- */
const API_BASE = "/api";
const api_getTipos = `${API_BASE}/settings/tipos`
const api_getEstados = `${API_BASE}/settings/estados`
const api_getPrioridades = `${API_BASE}/settings/prioridades`
const api_getSeveridades = `${API_BASE}/settings/severidades`;

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

async function fetchJson(url, opts = {}) {
    const res = await fetch(url, opts);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status} en ${url}: ${text}`);
    }
    return res.status === 204 ? null : await res.json();
}

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

    loadUsers();
});

/* ------------ Utilidades simples ---- */
const $ = sel => document.querySelector(sel);
const create = (tag, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
};

// Función mejorada para llenar selects con opción por defecto
function fillSelect(selectSel, data, labelKey, valueKey, defaultText = "") {
    const select = $(selectSel);
    // Limpiar el select
    select.innerHTML = "";

    // Añadir opción por defecto si se proporciona
    if (defaultText) {
        const defaultOpt = create("option");
        defaultOpt.value = "";
        defaultOpt.textContent = defaultText;
        select.appendChild(defaultOpt);
    }

    // Añadir las opciones de datos
    data.forEach((item) => {
        const opt = create("option");
        opt.value = item[valueKey];
        opt.textContent = item[labelKey];
        select.appendChild(opt);
    });
}

//inicio
window.addEventListener("DOMContentLoaded", async () => {
    await loadTipos();
    await loadEstados();
    await loadPrioridades();
    await loadSeveridades();
});

//leer tipos
async function loadTipos() {
    try {
        const tipos = await fetchJson(api_getTipos);
        console.log(tipos);
        fillSelect("#tipo_a_eliminar", tipos, "nombre", "id", "Selecciona un tipo a eliminar");
        fillSelect("#tipo_sustituto", tipos, "nombre", "id", "Selecciona un tipo de reemplazo");
    } catch (err) {
        console.error("Error cargando tipos:", err);
    }
}

//leer estados
async function loadEstados() {
    try {
        const estados = await fetchJson(api_getEstados);
        console.log(estados);
        fillSelect("#estado_a_eliminar", estados, "nombre", "id", "Selecciona un estado a eliminar");
        fillSelect("#estado_sustituto", estados, "nombre", "id", "Selecciona un estado de reemplazo");
    } catch (err) {
        console.error("Error cargando estados:", err);
    }
}

//leer prioridades
async function loadPrioridades() {
    try {
        const prioridades = await fetchJson(api_getPrioridades);
        console.log(prioridades);
        fillSelect("#prioridad_a_eliminar", prioridades, "nombre", "id", "Selecciona una prioridad a eliminar");
        fillSelect("#prioridad_sustituta", prioridades, "nombre", "id", "Selecciona una prioridad de reemplazo");
    } catch (err) {
        console.error("Error cargando prioridades:", err);
    }
}

//leer severidades
async function loadSeveridades() {
    try {
        const severidades = await fetchJson(api_getSeveridades);
        console.log(severidades);
        fillSelect("#severidad_a_eliminar", severidades, "nombre", "id", "Selecciona una severidad a eliminar");
        fillSelect("#severidad_sustituta", severidades, "nombre", "id", "Selecciona una severidad de reemplazo");
    } catch (err) {
        console.error("Error cargando severidades:", err);
    }
}

// ============= TIPOS =============

// Refrescar tipos (ahora usa la función consistente)
async function refrescarTipos() {
    await loadTipos();
}

//crear tipo
async function crearTipo() {
    try {
        var nomT = document.getElementById("nom_tipo").value;
        if (!nomT.trim()) {
            alert("Por favor, ingresa un nombre para el tipo");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/createtipo/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomT})
        });

        document.getElementById("nom_tipo").value = "";
        alert("Se ha creado correctamente");
        await refrescarTipos();
    } catch (err) {
        console.error("Error al crear:", err);
        alert("Error al crear el tipo: " + err.message);
    }
}

//eliminar tipo
async function eliminarTipo() {
    try {
        var selectEliminar = document.getElementById("tipo_a_eliminar");
        var setting_id = selectEliminar.value;

        if (!setting_id) {
            alert("Por favor, selecciona un tipo a eliminar");
            return;
        }

        if (selectEliminar.options.length <= 2) { // 2 porque incluye la opción por defecto
            alert("No se puede eliminar el último tipo");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/${setting_id}/deletetipo/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        alert("Se ha eliminado correctamente");
        await refrescarTipos();
    } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar el tipo: " + err.message);
    }
}

// ============= PRIORIDADES =============

// Refrescar prioridades (ahora usa la función consistente)
async function refrescarPrioridades() {
    await loadPrioridades();
}

//crear prioridad
async function crearPrioridad() {
    try {
        var nomP = document.getElementById("nom_prio").value;
        if (!nomP.trim()) {
            alert("Por favor, ingresa un nombre para la prioridad");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/createprioridad/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomP})
        });

        document.getElementById("nom_prio").value = "";
        alert("Se ha creado correctamente");
        await refrescarPrioridades();
    } catch (err) {
        console.error("Error al crear:", err);
        alert("Error al crear la prioridad: " + err.message);
    }
}

//eliminar prioridad
async function eliminarPrioridad() {
    try {
        var selectEliminar = document.getElementById("prioridad_a_eliminar");
        var setting_id = selectEliminar.value;

        if (!setting_id) {
            alert("Por favor, selecciona una prioridad a eliminar");
            return;
        }

        if (selectEliminar.options.length <= 2) { // 2 porque incluye la opción por defecto
            alert("No se puede eliminar la última prioridad");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/${setting_id}/deleteprioridad/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        alert("Se ha eliminado correctamente");
        await refrescarPrioridades();
    } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar la prioridad: " + err.message);
    }
}

// ============= ESTADOS =============

// Refrescar estados (ahora usa la función consistente)
async function refrescarEstados() {
    await loadEstados();
}

//crear estado
async function crearEstado() {
    try {
        var nomE = document.getElementById("nom_estado").value;
        if (!nomE.trim()) {
            alert("Por favor, ingresa un nombre para el estado");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/createestado/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomE})
        });

        document.getElementById("nom_estado").value = "";
        alert("Se ha creado correctamente");
        await refrescarEstados();
    } catch (err) {
        console.error("Error al crear:", err);
        alert("Error al crear el estado: " + err.message);
    }
}

//eliminar estado
async function eliminarEstado() {
    try {
        var selectEliminar = document.getElementById("estado_a_eliminar");
        var setting_id = selectEliminar.value;

        if (!setting_id) {
            alert("Por favor, selecciona un estado a eliminar");
            return;
        }

        if (selectEliminar.options.length <= 2) { // 2 porque incluye la opción por defecto
            alert("No se puede eliminar el último estado");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/${setting_id}/deleteestado/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        alert("Se ha eliminado correctamente");
        await refrescarEstados();
    } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar el estado: " + err.message);
    }
}

// ============= SEVERIDADES =============

// Refrescar severidades (ahora usa la función consistente)
async function refrescarSeveridades() {
    await loadSeveridades();
}

//crear severidad
async function crearSeveridad() {
    try {
        var nomS = document.getElementById("nom_sev").value;
        if (!nomS.trim()) {
            alert("Por favor, ingresa un nombre para la severidad");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/createseveridad/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomS})
        });

        document.getElementById("nom_sev").value = "";
        alert("Se ha creado correctamente");
        await refrescarSeveridades();
    } catch (err) {
        console.error("Error al crear:", err);
        alert("Error al crear la severidad: " + err.message);
    }
}

//eliminar severidad
async function eliminarSeveridad() {
    try {
        var selectEliminar = document.getElementById("severidad_a_eliminar");
        var setting_id = selectEliminar.value;

        if (!setting_id) {
            alert("Por favor, selecciona una severidad a eliminar");
            return;
        }

        if (selectEliminar.options.length <= 2) { // 2 porque incluye la opción por defecto
            alert("No se puede eliminar la última severidad");
            return;
        }

        const res = await fetchJson(`${API_BASE}/settings/${setting_id}/deleteseveridad/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        alert("Se ha eliminado correctamente");
        await refrescarSeveridades();
    } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar la severidad: " + err.message);
    }
}