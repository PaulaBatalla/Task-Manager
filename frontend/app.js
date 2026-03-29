// ============================================================
//  Gestor de Tareas - Frontend (app.js)
//  Consume la API REST de Spring Boot en /api/tasks
// ============================================================

const API_URL = "http://localhost:8080/api/tasks";

// ── Estado ───────────────────────────────────────────────────
let todasLasTareas  = [];
let filtroEstado    = "all";
let filtroPrioridad = "";
let tareaAEliminar  = null;

// ── Referencias al DOM ───────────────────────────────────────
const taskGrid      = document.getElementById("taskGrid");
const emptyState    = document.getElementById("emptyState");
const apiStatus     = document.getElementById("apiStatus");
const modalOverlay  = document.getElementById("modalOverlay");
const deleteOverlay = document.getElementById("deleteOverlay");
const formError     = document.getElementById("formError");

// ── Inicio ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    cargarTareas();
    registrarEventos();
});

// ── Cargar tareas desde la API ────────────────────────────────
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

// ── Renderizado ──────────────────────────────────────────────
function renderizarTodo() {
    actualizarEstadisticas();
    renderizarTareas();
}

function renderizarTareas() {
    let tareas = todasLasTareas;

    if (filtroEstado !== "all") {
        tareas = tareas.filter(t => t.status === filtroEstado);
    }
    if (filtroPrioridad) {
        tareas = tareas.filter(t => t.priority === filtroPrioridad);
    }

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
            <span class="badge badge-status-${tarea.status}">${etiquetaEstado[tarea.status]}</span>
            ${tarea.dueDate
                ? `<span class="due-date ${claseVencida}">📅 ${formatearFecha(tarea.dueDate)}</span>`
                : ""}
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

// ── Eventos ──────────────────────────────────────────────────
function registrarEventos() {
    // Filtro por estado
    document.querySelectorAll(".stat-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".stat-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            filtroEstado = chip.dataset.filter;
            renderizarTareas();
        });
    });

    // Filtro por prioridad
    document.getElementById("filterPriority").addEventListener("change", e => {
        filtroPrioridad = e.target.value;
        renderizarTareas();
    });

    // Abrir modal nueva tarea
    document.getElementById("btnOpenModal").addEventListener("click", abrirModalNuevo);

    // Cerrar modal
    document.getElementById("btnCloseModal").addEventListener("click", cerrarModal);
    document.getElementById("btnCancel").addEventListener("click",     cerrarModal);
    modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) cerrarModal(); });

    // Guardar tarea
    document.getElementById("btnSave").addEventListener("click", guardarTarea);

    // Modal eliminar
    document.getElementById("btnCloseDelete").addEventListener("click",  cerrarModalEliminar);
    document.getElementById("btnCancelDelete").addEventListener("click", cerrarModalEliminar);
    document.getElementById("btnConfirmDelete").addEventListener("click", confirmarEliminar);
    deleteOverlay.addEventListener("click", e => { if (e.target === deleteOverlay) cerrarModalEliminar(); });
}

// ── Modal crear / editar ─────────────────────────────────────
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
    formError.textContent = "";
}

// ── Guardar (crear o actualizar) ──────────────────────────────
async function guardarTarea() {
    const id    = document.getElementById("taskId").value;
    const titulo = document.getElementById("taskTitle").value.trim();

    if (!titulo) {
        formError.textContent = "El título es obligatorio.";
        return;
    }

    const datos = {
        title:       titulo,
        description: document.getElementById("taskDescription").value.trim(),
        priority:    document.getElementById("taskPriority").value,
        status:      document.getElementById("taskStatus").value,
        dueDate:     document.getElementById("taskDueDate").value || null,
    };

    const btnSave = document.getElementById("btnSave");
    btnSave.disabled = true;
    btnSave.textContent = "Guardando...";

    try {
        const url    = id ? `${API_URL}/${id}` : API_URL;
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

// ── Eliminar ──────────────────────────────────────────────────
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

// ── Utilidades ────────────────────────────────────────────────
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
