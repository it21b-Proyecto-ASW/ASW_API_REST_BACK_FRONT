/* ------------ Config ---------------- */
// TODO: Sustituye por la URL base real de tu API
const API_BASE = "http://127.0.0.1:8000/api/settings/";
const api_getTipos = "http://127.0.0.1:8000/api/settings/tipos"
const api_getEstados = "http://127.0.0.1:8000/api/settings/estados"
const api_getPrioridades = "http://127.0.0.1:8000/api/settings/prioridades"
const api_getSeveridades = "http://127.0.0.1:8000/api/settings/severidades"


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

function addToSelect(selectSel, name)
{
    const select = $(selectSel);
    const opt = create("option");
    opt.textContent = name;
    select.appendChild(opt);
}

function limpiarselects(sele1, sele2)
{
    var i, L = sele1.options.length - 1, R = sele2.options.length - 1;
    for(i = L; i >= 0; i--)
    {
        sele1.remove(i);
    }
    for(i = R; i >= 0; i--)
    {
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
async function crearTipo()
{
    try{
        var nomT = document.getElementById("nom_tipo").value;
        var select1 = document.getElementById("tipo_a_eliminar");
        var select2 = document.getElementById("tipo_sustituto");
        const res = await fetch("http://127.0.0.1:8000/api/settings/createtipo/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomT})
        }).then(res => res.json);
        //limpiarselects(select1, select2);
        //loadTipos();
        document.getElementById("nom_tipo").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}
//eliminar tipus
async function eliminarTipo()
{
    try
    {
        var tipo = document.getElementById("tipo_a_eliminar").selectedIndex;
        var setting_id = document.getElementsByTagName("option")[tipo].value;
        if (document.getElementById("tipo_a_eliminar").options.length <= 2)
            alert("No se puede eliminar el último tipo")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deletetipo/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);
            alert("se ha eliminado correctamente");
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}


//crear prioridad
async function crearPrioridad()
{
    try{
        var nomP = document.getElementById("nom_prio").value;
        var select1 = document.getElementById("prioridad_a_eliminar");
        var select2 = document.getElementById("prioridad_sustituta");
        const res = await fetch("http://127.0.0.1:8000/api/settings/createprioridad/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomP})
        }).then(res => res.json);
        //limpiarselects(select1, select2);
        //loadTipos();
        document.getElementById("nom_prio").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar prioridad
async function eliminarPrioridad()
{
    try
    {
        var prio = document.getElementById("prioridad_a_eliminar").selectedIndex;
        var setting_id = document.getElementsByTagName("option")[prio].value;
        if (document.getElementById("prioridad_a_eliminar").options.length <= 2)
            alert("No se puede eliminar la última prioridad")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deleteprioridad/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);
            alert("se ha eliminado correctamente");
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

//crear estatus
async function crearEstado()
{
    try{
        var nomE = document.getElementById("nom_estado").value;
        var select1 = document.getElementById("estado_a_eliminar");
        var select2 = document.getElementById("estado_sustituto");
        const res = await fetch("http://127.0.0.1:8000/api/settings/createestado/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomE})
        }).then(res => res.json);
        //limpiarselects(select1, select2);
        //loadTipos();
        document.getElementById("nom_estado").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar estatus
async function eliminarEstado()
{
    try
    {
        var estado = document.getElementById("estado_a_eliminar").selectedIndex;
        var setting_id = document.getElementsByTagName("option")[prio].value;
        if (document.getElementById("estado_a_eliminar").options.length <= 2)
            alert("No se puede eliminar el último estado")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deleteestado/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);
            alert("se ha eliminado correctamente");
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}


//crear severidad
async function crearSeveridad()
{
    try{
        var nomS = document.getElementById("nom_sev").value;
        var select1 = document.getElementById("severidad_a_eliminar");
        var select2 = document.getElementById("severidad_sustituta");
        const res = await fetch("http://127.0.0.1:8000/api/settings/createseveridad/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({nombre: nomS})
        }).then(res => res.json);
        //limpiarselects(select1, select2);
        //loadTipos();
        document.getElementById("nom_sev").value = "";
        alert("se ha creado correctamente");
    } catch (err) {
        console.error("Error al crear:", err);
    }
}

//eliminar severidad
async function eliminarSeveridad()
{
    try
    {
        var sev = document.getElementById("severidad_a_eliminar").selectedIndex;
        var setting_id = document.getElementsByTagName("option")[prio].value;
        if (document.getElementById("severidad_a_eliminar").options.length <= 2)
            alert("No se puede eliminar la última severidad")
        else {
            const res = await fetch(`${API_BASE}${setting_id.toString()}/deleteseveridad/`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then(res => res.json);
            alert("se ha eliminado correctamente");
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}
