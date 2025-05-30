/* ------------ Config ---------------- */
const API_BASE = "/api";
const api_getTipos = `${API_BASE}/settings/tipos`
const api_getEstados = `${API_BASE}/settings/estados`
const api_getPrioridades = `${API_BASE}/settings/prioridades`
const api_getSeveridades = `${API_BASE}/settings/severidades`


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

/* ------------ Utilidades simples ---- */
const $ = sel => document.querySelector(sel);
const create = (tag, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
};

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

// Recarga los tipos en los dropdowns
async function refrescarTipos() {
    try {
        const response = await fetch('/api/settings/tipos');
        const tipos = await response.json();
        const selectEliminar = document.getElementById('tipo_a_eliminar');
        const selectSustituto = document.getElementById('tipo_sustituto');
        selectEliminar.innerHTML = '<option value="">Selecciona un tipo a eliminar</option>';
        selectSustituto.innerHTML = '<option value="">Selecciona un tipo de reemplazo</option>';
        tipos.forEach(tipo => {
            selectEliminar.innerHTML += `<option value="${tipo.id}">${tipo.nombre}</option>`;
            selectSustituto.innerHTML += `<option value="${tipo.id}">${tipo.nombre}</option>`;
        });
    } catch (err) {
        console.error('Error cargando tipos:', err);
    }
}

//crear tipus
async function crearTipo()
{
    try{
        var nomT = document.getElementById("nom_tipo").value;
        const res = await fetch(`${API_BASE}/settings/createtipo/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomT})
        }).then(res => res.json);
        document.getElementById("nom_tipo").value = "";
        alert("se ha creado correctamente");
        refrescarTipos();
    } catch (err) {
        console.error("Error al crear:", err);
    }
}
//eliminar tipus
async function eliminarTipo()
{
    try
    {
        var tipo = document.getElementById("tipo_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("tipo_a_eliminar").options.item(tipo).value;
        if (document.getElementById("tipo_a_eliminar").options.length <= 1)
            alert("No se puede eliminar el último tipo")
        else {
            const res = await fetch(`${API_BASE}/settings/${setting_id.toString()}/deletetipo/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);
            alert("se ha eliminado correctamente");
            document.getElementById("tipo_a_eliminar").remove(tipo);
            document.getElementById("tipo_sustituto").remove(tipo);
            refrescarTipos();
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

// Recarga las prioridades en los dropdowns
async function refrescarPrioridades() {
    try {
        const response = await fetch('/api/settings/prioridades');
        const prioridades = await response.json();
        const selectEliminar = document.getElementById('prioridad_a_eliminar');
        const selectSustituta = document.getElementById('prioridad_sustituta');
        selectEliminar.innerHTML = '<option value="">Selecciona una prioridad a eliminar</option>';
        selectSustituta.innerHTML = '<option value="">Selecciona una prioridad de reemplazo</option>';
        prioridades.forEach(prio => {
            selectEliminar.innerHTML += `<option value="${prio.id}">${prio.nombre}</option>`;
            selectSustituta.innerHTML += `<option value="${prio.id}">${prio.nombre}</option>`;
        });
    } catch (err) {
        console.error('Error cargando prioridades:', err);
    }
}

//crear prioridad
async function crearPrioridad()
{
    try{
        var nomP = document.getElementById("nom_prio").value;
        var select1 = document.getElementById("prioridad_a_eliminar");
        var select2 = document.getElementById("prioridad_sustituta");
        const res = await fetch(`${API_BASE}/settings/createprioridad/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomP})
        }).then(res => res.json);

        document.getElementById("nom_prio").value = "";
        alert("se ha creado correctamente");
        refrescarPrioridades();
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar prioridad
async function eliminarPrioridad()
{
    try
    {
        var prio = document.getElementById("prioridad_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("prioridad_a_eliminar").options.item(prio).value;
        if (document.getElementById("prioridad_a_eliminar").options.length <= 1)
            alert("No se puede eliminar la última prioridad")
        else {
            const res = await fetch(`${API_BASE}/settings/${setting_id.toString()}/deleteprioridad/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);
            alert("Se ha eliminado correctamente");
            document.getElementById("prioridad_a_eliminar").remove(prio);
            document.getElementById("prioridad_sustituta").remove(prio);
            refrescarPrioridades();
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

// Recarga los estados en los dropdowns
async function refrescarEstados() {
    try {
        const response = await fetch('/api/settings/estados');
        const estados = await response.json();
        const selectEliminar = document.getElementById('estado_a_eliminar');
        const selectSustituto = document.getElementById('estado_sustituto');
        selectEliminar.innerHTML = '<option value="">Selecciona un estado a eliminar</option>';
        selectSustituto.innerHTML = '<option value="">Selecciona un estado de reemplazo</option>';
        estados.forEach(estado => {
            selectEliminar.innerHTML += `<option value="${estado.id}">${estado.nombre}</option>`;
            selectSustituto.innerHTML += `<option value="${estado.id}">${estado.nombre}</option>`;
        });
    } catch (err) {
        console.error('Error cargando estados:', err);
    }
}

//crear estatus
async function crearEstado()
{
    try{
        var nomE = document.getElementById("nom_estado").value;
        var select1 = document.getElementById("estado_a_eliminar");
        var select2 = document.getElementById("estado_sustituto");
        const res = await fetch(`${API_BASE}/settings/createestado/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomE})
        }).then(res => res.json);
        document.getElementById("nom_estado").value = "";
        alert("se ha creado correctamente");
        refrescarEstados();
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar estatus
async function eliminarEstado()
{
    try
    {
        var estado = document.getElementById("estado_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("estado_a_eliminar").options.item(estado).value;
        if (document.getElementById("estado_a_eliminar").options.length <= 1)
            alert("No se puede eliminar el último estado")
        else {
            const res = await fetch(`${API_BASE}/settings/${setting_id.toString()}/deleteestado/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);
            alert("se ha eliminado correctamente");
            document.getElementById("estado_a_eliminar").remove(estado);
            document.getElementById("estado_sustituto").remove(estado);
            refrescarEstados();
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

// Cargar severidades al crear o eliminar
function refrescarSeveridades() {
    fetch('/api/settings/severidades')
        .then(response => response.json())
        .then(data => {
            const selectEliminar = document.getElementById('severidad_a_eliminar');
            const selectSustituta = document.getElementById('severidad_sustituta');
            // Limpia las opciones actuales
            selectEliminar.innerHTML = '<option value="">Selecciona una severitat a eliminar</option>';
            selectSustituta.innerHTML = '<option value="">Selecciona una severitat de reemplaçament</option>';
            // Añade las nuevas opciones
            data.forEach(sev => {
                selectEliminar.innerHTML += `<option value="${sev.id}">${sev.nombre}</option>`;
                selectSustituta.innerHTML += `<option value="${sev.id}">${sev.nombre}</option>`;
            });
        });
}

//crear severidad
async function crearSeveridad()
{
    try{
        var nomS = document.getElementById("nom_sev").value;
        var select1 = document.getElementById("severidad_a_eliminar");
        var select2 = document.getElementById("severidad_sustituta");
        const res = await fetch(`${API_BASE}/settings/createseveridad/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomS})
        }).then(res => res.json);
        document.getElementById("nom_sev").value = "";
        alert("se ha creado correctamente");
        refrescarSeveridades();
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar severidad
async function eliminarSeveridad()
{
    try
    {
        var sev = document.getElementById("severidad_a_eliminar").options.selectedIndex;
        var setting_id = document.getElementById("severidad_a_eliminar").options.item(sev).value;
        if (document.getElementById("severidad_a_eliminar").options.length <= 2)
            alert("No se puede eliminar la última severidad")
        else {
            const res = await fetch(`${API_BASE}/settings/${setting_id.toString()}/deleteseveridad/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);

            alert("se ha eliminado correctamente");
            document.getElementById("severidad_a_eliminar").remove(sev);
            document.getElementById("severidad_sustituta").remove(sev);
            refrescarSeveridades();
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}
