//  Gestor de Tareas - Frontend (app.js)
//  Consume la API REST de Spring Boot en /api/tasks

const API_URL        = "http://localhost:8080/api/tasks";
const CATEGORY_URL   = "http://localhost:8080/api/categories";

// Estado
let todasLasTareas   = [];
let todasLasCategorias = [];
let filtroEstado     = "all";
let filtroPrioridad  = "";
let filtroCategoria  = "";
let criterioOrden    = "";
let tareaAEliminar   = null;

// Referencias al DOM
const taskGrid      = document.getElementById("taskGrid");
const emptyState    = document.getElementById("emptyState");
const apiStatus     = document.getElementById("apiStatus");
const modalOverlay  = document.getElementById("modalOverlay");
const deleteOverlay = document.getElementById("deleteOverlay");
const formError     = document.getElementById("formError");

// Inicio
document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarTareas();
    registrarEventos();
});

// Cargar categorías desde la API y poblar los selectores
async function cargarCategorias() {
    try {
        const respuesta = await fetch(CATEGORY_URL);
        if (!respuesta.ok) throw new Error("Error cargando categorías");

        todasLasCategorias = await respuesta.json();
        poblarSelectoresCategorias();
    } catch (error) {
        console.error("No se pudieron cargar las categorías:", error);
    }
}

function poblarSelectoresCategorias() {
    const selectFiltro = document.getElementById("filterCategory");
    const selectModal  = document.getElementById("taskCategory");

    // Limpiar opciones previas (menos la primera)
    selectFiltro.innerHTML = '<option value="">todas las categorías</option>';
    selectModal.innerHTML  = '<option value="">Sin categoría</option>';

    todasLasCategorias.forEach(cat => {
        selectFiltro.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        selectModal.innerHTML  += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

// Cargar tareas desde la API
async function cargarTareas() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Error en la API");

        todasLasTareas = await respuesta.json();
        setEstadoAPI(true);
        renderizarTodo();
    } catch (error) {
        setEstadoAPI(false);
        console.error("No se pudo conectar con la API:", error);
    }
}

// Renderizado
function renderizarTodo() {
    actualizarEstadisticas();
    renderizarTareas();
}

function ordenarTareas(tareas) {
    const ordenPrioridad = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    const ordenEstado    = { PENDING: 1, IN_PROGRESS: 2, DONE: 3 };
    const copia = [...tareas];

    switch (criterioOrden) {
        case "priority":
            return copia.sort((a, b) => ordenPrioridad[a.priority] - ordenPrioridad[b.priority]);
        case "dueDate":
            return copia.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        case "status":
            return copia.sort((a, b) => ordenEstado[a.status] - ordenEstado[b.status]);
        case "recent":
            return copia.sort((a, b) => b.id - a.id);
        default:
            return copia;
    }
}

function renderizarTareas() {
    let tareas = todasLasTareas;

    if (filtroEstado !== "all") {
        tareas = tareas.filter(t => t.status === filtroEstado);
    }
    if (filtroPrioridad) {
        tareas = tareas.filter(t => t.priority === filtroPrioridad);
    }
    if (filtroCategoria) {
        tareas = tareas.filter(t => t.category && String(t.category.id) === filtroCategoria);
    }

    tareas = ordenarTareas(tareas);

    taskGrid.querySelectorAll(".task-card").forEach(el => el.remove());

    if (tareas.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    tareas.forEach(tarea => taskGrid.appendChild(crearTarjeta(tarea)));
}

function crearTarjeta(tarea) {
    const card = document.createElement("div");
    card.className = `task-card priority-${tarea.priority} status-${tarea.status}`;
    card.dataset.id = tarea.id;

    const etiquetaEstado = {
        PENDING:     "Pendiente",
        IN_PROGRESS: "En progreso",
        DONE:        "Completada"
    };

    const claseVencida = esVencida(tarea.dueDate) && tarea.status !== "DONE" ? "overdue" : "";

    card.innerHTML = `
        <div class="card-header">
            <span class="task-title">${escaparHtml(tarea.title)}</span>
            <div class="card-actions">
                <button class="btn-icon edit" title="Editar" data-id="${tarea.id}">✎</button>
                <button class="btn-icon del"  title="Eliminar" data-id="${tarea.id}">✕</button>
            </div>
        </div>
        ${tarea.description ? `<p class="task-desc">${escaparHtml(tarea.description)}</p>` : ""}
        <div class="card-footer">
            <div class="footer-left">
                <span class="badge badge-status-${tarea.status}">${etiquetaEstado[tarea.status]}</span>
                ${tarea.category ? `<span class="badge badge-category">🏷️ ${escaparHtml(tarea.category.name)}</span>` : ""}
            </div>
            ${tarea.dueDate ? `<span class="due-date ${claseVencida}">📅 ${formatearFecha(tarea.dueDate)}</span>` : ""}
        </div>
    `;

    card.querySelector(".edit").addEventListener("click", () => abrirModalEditar(tarea));
    card.querySelector(".del").addEventListener("click",  () => abrirModalEliminar(tarea.id));

    return card;
}

function actualizarEstadisticas() {
    document.getElementById("countAll").textContent        = todasLasTareas.length;
    document.getElementById("countPending").textContent    = todasLasTareas.filter(t => t.status === "PENDING").length;
    document.getElementById("countInProgress").textContent = todasLasTareas.filter(t => t.status === "IN_PROGRESS").length;
    document.getElementById("countDone").textContent       = todasLasTareas.filter(t => t.status === "DONE").length;
}

// Eventos
function registrarEventos() {
    document.querySelectorAll(".stat-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".stat-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            filtroEstado = chip.dataset.filter;
            renderizarTareas();
        });
    });

    document.getElementById("filterPriority").addEventListener("change", e => {
        filtroPrioridad = e.target.value;
        renderizarTareas();
    });

    document.getElementById("filterCategory").addEventListener("change", e => {
        filtroCategoria = e.target.value;
        renderizarTareas();
    });

    document.getElementById("sortOrder").addEventListener("change", e => {
        criterioOrden = e.target.value;
        renderizarTareas();
    });

    document.getElementById("btnOpenModal").addEventListener("click", abrirModalNuevo);
    document.getElementById("btnCloseModal").addEventListener("click", cerrarModal);
    document.getElementById("btnCancel").addEventListener("click",     cerrarModal);
    modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) cerrarModal(); });
    document.getElementById("btnSave").addEventListener("click", guardarTarea);

    document.getElementById("btnCloseDelete").addEventListener("click",  cerrarModalEliminar);
    document.getElementById("btnCancelDelete").addEventListener("click", cerrarModalEliminar);
    document.getElementById("btnConfirmDelete").addEventListener("click", confirmarEliminar);
    deleteOverlay.addEventListener("click", e => { if (e.target === deleteOverlay) cerrarModalEliminar(); });
}

// Modal crear / editar
function abrirModalNuevo() {
    resetearFormulario();
    document.getElementById("modalTitle").textContent = "Nueva tarea";
    modalOverlay.classList.add("open");
}

function abrirModalEditar(tarea) {
    resetearFormulario();
    document.getElementById("modalTitle").textContent    = "Editar tarea";
    document.getElementById("taskId").value              = tarea.id;
    document.getElementById("taskTitle").value           = tarea.title;
    document.getElementById("taskDescription").value     = tarea.description || "";
    document.getElementById("taskPriority").value        = tarea.priority;
    document.getElementById("taskStatus").value          = tarea.status;
    document.getElementById("taskDueDate").value         = tarea.dueDate || "";
    document.getElementById("taskCategory").value        = tarea.category ? tarea.category.id : "";
    modalOverlay.classList.add("open");
}

function cerrarModal() {
    modalOverlay.classList.remove("open");
    resetearFormulario();
}

function resetearFormulario() {
    document.getElementById("taskId").value          = "";
    document.getElementById("taskTitle").value       = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskPriority").value    = "MEDIUM";
    document.getElementById("taskStatus").value      = "PENDING";
    document.getElementById("taskDueDate").value     = "";
    document.getElementById("taskCategory").value    = "";
    formError.textContent = "";
}

// Guardar (crear o actualizar)
async function guardarTarea() {
    const id     = document.getElementById("taskId").value;
    const titulo = document.getElementById("taskTitle").value.trim();

    if (!titulo) {
        formError.textContent = "El título es obligatorio.";
        return;
    }

    const categoryId = document.getElementById("taskCategory").value;

    const datos = {
        title:       titulo,
        description: document.getElementById("taskDescription").value.trim(),
        priority:    document.getElementById("taskPriority").value,
        status:      document.getElementById("taskStatus").value,
        dueDate:     document.getElementById("taskDueDate").value || null,
    };

    // El categoryId se manda como parámetro en la URL
    const params = categoryId ? `?categoryId=${categoryId}` : "";

    const btnSave = document.getElementById("btnSave");
    btnSave.disabled = true;
    btnSave.textContent = "Guardando...";

    try {
        const url    = id ? `${API_URL}/${id}${params}` : `${API_URL}${params}`;
        const metodo = id ? "PUT" : "POST";

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });

        if (!respuesta.ok) throw new Error("Error al guardar");

        cerrarModal();
        await cargarTareas();
    } catch (error) {
        formError.textContent = "Error al guardar. Verificá que el backend esté corriendo.";
        console.error(error);
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Guardar tarea";
    }
}

// Eliminar
function abrirModalEliminar(id) {
    tareaAEliminar = id;
    deleteOverlay.classList.add("open");
}

function cerrarModalEliminar() {
    tareaAEliminar = null;
    deleteOverlay.classList.remove("open");
}

async function confirmarEliminar() {
    if (!tareaAEliminar) return;
    try {
        const respuesta = await fetch(`${API_URL}/${tareaAEliminar}`, { method: "DELETE" });
        if (!respuesta.ok) throw new Error("Error al eliminar");
        cerrarModalEliminar();
        await cargarTareas();
    } catch (error) {
        console.error(error);
    }
}

// Utilidades
function setEstadoAPI(online) {
    apiStatus.textContent = online ? "● conectado" : "● sin conexión";
    apiStatus.className   = `api-status ${online ? "online" : "offline"}`;
}

function esVencida(fechaStr) {
    if (!fechaStr) return false;
    return new Date(fechaStr) < new Date(new Date().toDateString());
}

function formatearFecha(fechaStr) {
    const [y, m, d] = fechaStr.split("-");
    return `${d}/${m}/${y}`;
}

function escaparHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
