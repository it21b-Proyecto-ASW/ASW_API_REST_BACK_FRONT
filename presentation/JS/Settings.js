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

//llamadas api
//fetch(`${API_BASE}/url/`).then(r => r.json())


//leer tipos
async function loadTipos() {
    try {
        // Ejemplo de endpoints; c�mbialos por los tuyos
        const [tipos] = await Promise.all([
            fetch("http://127.0.0.1:8000/api/settings/tipos").then(r => r.json()),
        ]);

        fillSelect("#tipo_a_eliminar", tipos, "nombre", "id");

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

//leer estados

//leer prios

//leer sevs

//crear tipus
function crearTipus()
{

}

//eliminar tipus

//crear prioridad

//eliminar prioridad

//crear estatus

//eliminar estatus

//crear severidad

//eliminar severidad