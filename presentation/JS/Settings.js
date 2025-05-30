/* ------------ Config ---------------- */
// TODO: Sustituye por la URL base real de tu API
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

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    loadUsers();
});
/* ------------ Utilidades simples ---- */
const $ = sel => document.querySelector(sel);
const create = (tag, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
};

//llamadas api
//fetch(`${API_BASE}/url/`).then(r => r.json())

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
        const tipos = await Promise.resolve(fetch(api_getTipos).then(r => r.json()));
        console.log(tipos);
        fillSelect("#tipo_a_eliminar", tipos, "nombre", "id");
        fillSelect("#tipo_sustituto", tipos, "nombre", "id");
    } catch (err) {
        console.error("Error cargando filtros:", err);
    }
}

function fillSelect(selectSel, data, labelKey, valueKey) {
    const select = $(selectSel);
    data.forEach((item) => {
        const opt = create("option");
        opt.value = (item)[valueKey];
        opt.textContent = (item)[labelKey];
        select.appendChild(opt);
    });
}

function limpiarselects(sele1, sele2) {
    var i, L = sele1.options.length - 1, R = sele2.options.length - 1;
    for (i = L; i >= 0; i--) {
        sele1.remove(i);
    }
    for (i = R; i >= 0; i--) {
        sele2.remove(i);
    }
}

//leer estados
async function loadEstados() {
    try {
        const estados = await Promise.resolve(fetch(api_getEstados).then(r => r.json()));
        console.log(estados);
        fillSelect("#estado_a_eliminar", estados, "nombre", "id");
        fillSelect("#estado_sustituto", estados, "nombre", "id");

    } catch (err) {
        console.error("Error cargando filtros:", err);
    }
}

//leer prios
async function loadPrioridades() {
    try {

        const prioridades = await Promise.resolve(fetch(api_getPrioridades).then(r => r.json()));
        console.log(prioridades);
        fillSelect("#prioridad_a_eliminar", prioridades, "nombre", "id");
        fillSelect("#prioridad_sustituta", prioridades, "nombre", "id");

    } catch (err) {
        console.error("Error cargando filtros:", err);
    }
}

//leer sevs
async function loadSeveridades() {
    try {

        const severidades = await Promise.resolve(fetch(api_getSeveridades).then(r => r.json()));
        console.log(severidades);
        fillSelect("#severidad_a_eliminar", severidades, "nombre", "id");
        fillSelect("#severidad_sustituta", severidades, "nombre", "id");

    } catch (err) {
        console.error("Error cargando filtros:", err);
    }
}

//crear tipus
async function crearTipo() {
    try {
        var nomT = document.getElementById("nom_tipo").value;
        const res = await fetch(`${API_BASE}/settings/createtipo/`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nomT })
            }).then(res => res.json());
        document.getElementById("nom_tipo").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}
//eliminar tipus
async function eliminarTipo() {
    try {
        var tipo = document.getElementById("tipo_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("tipo_a_eliminar").options.item(tipo).value;
        if (document.getElementById("tipo_a_eliminar").options.length <= 1)
            alert("No se puede eliminar el último tipo")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deletetipo/`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }).then(res => res.json());
            alert("se ha eliminado correctamente");
            document.getElementById("tipo_a_eliminar").remove(tipo);
            document.getElementById("tipo_sustituto").remove(tipo);
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

//crear prioridad
async function crearPrioridad() {
    try {
        var nomP = document.getElementById("nom_prio").value;
        var select1 = document.getElementById("prioridad_a_eliminar");
        var select2 = document.getElementById("prioridad_sustituta");
        const res = await fetch(`${API_BASE}/settings/createprioridad/`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nomP })
            }).then(res => res.json());

        document.getElementById("nom_prio").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar prioridad
async function eliminarPrioridad() {
    try {
        var prio = document.getElementById("prioridad_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("prioridad_a_eliminar").options.item(prio).value;
        if (document.getElementById("prioridad_a_eliminar").options.length <= 1)
            alert("No se puede eliminar la última prioridad")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deleteprioridad/`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }).then(res => res.json());
            alert("Se ha eliminado correctamente");
            document.getElementById("prioridad_a_eliminar").remove(prio);
            document.getElementById("prioridad_sustituta").remove(prio);
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

//crear estatus
async function crearEstado() {
    try {
        var nomE = document.getElementById("nom_estado").value;
        var select1 = document.getElementById("estado_a_eliminar");
        var select2 = document.getElementById("estado_sustituto");
        const res = await fetch(`${API_BASE}/settings/createestado/`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nomE })
            }).then(res => res.json());
        document.getElementById("nom_estado").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar estatus
async function eliminarEstado() {
    try {
        var estado = document.getElementById("estado_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("estado_a_eliminar").options.item(estado).value;
        if (document.getElementById("estado_a_eliminar").options.length <= 1)
            alert("No se puede eliminar el último estado")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deleteestado/`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }).then(res => res.json());
            alert("se ha eliminado correctamente");
            document.getElementById("estado_a_eliminar").remove(estado);
            document.getElementById("estado_sustituto").remove(estado);
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

//crear severidad
async function crearSeveridad() {
    try {
        var nomS = document.getElementById("nom_sev").value;
        var select1 = document.getElementById("severidad_a_eliminar");
        var select2 = document.getElementById("severidad_sustituta");
        const res = await fetch(`${API_BASE}/settings/createseveridad/`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nomS })
            }).then(res => res.json());
        document.getElementById("nom_sev").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar severidad
async function eliminarSeveridad() {
    try {
        var sev = document.getElementById("severidad_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("severidad_a_eliminar").options.item(sev).value;
        if (document.getElementById("severidad_a_eliminar").options.length <= 2)
            alert("No se puede eliminar la última severidad")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deleteseveridad/`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }).then(res => res.json());

            alert("se ha eliminado correctamente");
            document.getElementById("severidad_a_eliminar").remove(sev);
            document.getElementById("severidad_sustituta").remove(sev);
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}
