//  Gestor de Tareas - Frontend (app.js)
//  Consume la API REST de Spring Boot en /api/tasks

const API_URL      = "http://localhost:8080/api/tasks";
const CATEGORY_URL = "http://localhost:8080/api/categories";

// Estado
let todasLasTareas     = [];
let todasLasCategorias = [];
let filtroEstado       = "all";
let filtroPrioridad    = "";
let filtroCategoria    = "";
let criterioOrden      = "";
let tareaAEliminar     = null;
let tareaActivaId      = null;  // ID de la tarea cuyo modal de comentarios está abierto

// Referencias al DOM
const taskGrid       = document.getElementById("taskGrid");
const emptyState     = document.getElementById("emptyState");
const apiStatus      = document.getElementById("apiStatus");
const modalOverlay   = document.getElementById("modalOverlay");
const deleteOverlay  = document.getElementById("deleteOverlay");
const commentsOverlay = document.getElementById("commentsOverlay");
const formError      = document.getElementById("formError");

// Inicio
document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarTareas();
    registrarEventos();
});

// ── Categorías ────────────────────────────────────────────────
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

    selectFiltro.innerHTML = '<option value="">todas las categorías</option>';
    selectModal.innerHTML  = '<option value="">Sin categoría</option>';

    todasLasCategorias.forEach(cat => {
        selectFiltro.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        selectModal.innerHTML  += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

// ── Tareas ────────────────────────────────────────────────────
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

    if (filtroEstado !== "all") tareas = tareas.filter(t => t.status === filtroEstado);
    if (filtroPrioridad)        tareas = tareas.filter(t => t.priority === filtroPrioridad);
    if (filtroCategoria)        tareas = tareas.filter(t => t.category && String(t.category.id) === filtroCategoria);

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
                <button class="btn-icon comments" title="Comentarios" data-id="${tarea.id}">💬</button>
                <button class="btn-icon edit" title="Editar" data-id="${tarea.id}">✎</button>
                <button class="btn-icon del" title="Eliminar" data-id="${tarea.id}">✕</button>
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

    card.querySelector(".comments").addEventListener("click", () => abrirModalComentarios(tarea));
    card.querySelector(".edit").addEventListener("click",     () => abrirModalEditar(tarea));
    card.querySelector(".del").addEventListener("click",      () => abrirModalEliminar(tarea.id));

    return card;
}

function actualizarEstadisticas() {
    document.getElementById("countAll").textContent        = todasLasTareas.length;
    document.getElementById("countPending").textContent    = todasLasTareas.filter(t => t.status === "PENDING").length;
    document.getElementById("countInProgress").textContent = todasLasTareas.filter(t => t.status === "IN_PROGRESS").length;
    document.getElementById("countDone").textContent       = todasLasTareas.filter(t => t.status === "DONE").length;
}

// ── Comentarios ───────────────────────────────────────────────
async function abrirModalComentarios(tarea) {
    tareaActivaId = tarea.id;
    document.getElementById("commentModalTitle").textContent = `💬 ${tarea.title}`;
    document.getElementById("newCommentContent").value = "";
    commentsOverlay.classList.add("open");
    await cargarComentarios();
}

async function cargarComentarios() {
    const lista = document.getElementById("commentsList");
    lista.innerHTML = '<p class="no-comments">Cargando...</p>';

    try {
        const respuesta = await fetch(`${API_URL}/${tareaActivaId}/comments`);
        const comentarios = await respuesta.json();

        if (comentarios.length === 0) {
            lista.innerHTML = '<p class="no-comments">No hay comentarios todavía.</p>';
            return;
        }

        lista.innerHTML = comentarios.map(c => `
            <div class="comment-item">
                <p class="comment-content">${escaparHtml(c.content)}</p>
                <div class="comment-footer">
                    <span class="comment-date">${formatearFechaHora(c.createdAt)}</span>
                    <button class="btn-comment-delete" data-id="${c.id}">✕</button>
                </div>
            </div>
        `).join("");

        lista.querySelectorAll(".btn-comment-delete").forEach(btn => {
            btn.addEventListener("click", () => eliminarComentario(btn.dataset.id));
        });

    } catch (error) {
        lista.innerHTML = '<p class="no-comments">Error al cargar comentarios.</p>';
        console.error(error);
    }
}

async function agregarComentario() {
    const content = document.getElementById("newCommentContent").value.trim();
    if (!content) return;

    try {
        const respuesta = await fetch(`${API_URL}/${tareaActivaId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        });

        if (!respuesta.ok) throw new Error("Error al agregar comentario");

        document.getElementById("newCommentContent").value = "";
        await cargarComentarios();
    } catch (error) {
        console.error(error);
    }
}

async function eliminarComentario(commentId) {
    try {
        const respuesta = await fetch(`${API_URL}/${tareaActivaId}/comments/${commentId}`, {
            method: "DELETE"
        });
        if (!respuesta.ok) throw new Error("Error al eliminar comentario");
        await cargarComentarios();
    } catch (error) {
        console.error(error);
    }
}

function cerrarModalComentarios() {
    commentsOverlay.classList.remove("open");
    tareaActivaId = null;
}

// ── Eventos ───────────────────────────────────────────────────
function registrarEventos() {
    document.querySelectorAll(".stat-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".stat-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            filtroEstado = chip.dataset.filter;
            renderizarTareas();
        });
    });

    document.getElementById("filterPriority").addEventListener("change", e => { filtroPrioridad = e.target.value; renderizarTareas(); });
    document.getElementById("filterCategory").addEventListener("change", e => { filtroCategoria = e.target.value; renderizarTareas(); });
    document.getElementById("sortOrder").addEventListener("change",      e => { criterioOrden = e.target.value; renderizarTareas(); });

    document.getElementById("btnOpenModal").addEventListener("click", abrirModalNuevo);
    document.getElementById("btnCloseModal").addEventListener("click", cerrarModal);
    document.getElementById("btnCancel").addEventListener("click",     cerrarModal);
    modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) cerrarModal(); });
    document.getElementById("btnSave").addEventListener("click", guardarTarea);

    document.getElementById("btnCloseComments").addEventListener("click", cerrarModalComentarios);
    commentsOverlay.addEventListener("click", e => { if (e.target === commentsOverlay) cerrarModalComentarios(); });
    document.getElementById("btnAddComment").addEventListener("click", agregarComentario);

    document.getElementById("btnCloseDelete").addEventListener("click",  cerrarModalEliminar);
    document.getElementById("btnCancelDelete").addEventListener("click", cerrarModalEliminar);
    document.getElementById("btnConfirmDelete").addEventListener("click", confirmarEliminar);
    deleteOverlay.addEventListener("click", e => { if (e.target === deleteOverlay) cerrarModalEliminar(); });
}

// ── Modal crear/editar ────────────────────────────────────────
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

// ── Guardar tarea ─────────────────────────────────────────────
async function guardarTarea() {
    const id     = document.getElementById("taskId").value;
    const titulo = document.getElementById("taskTitle").value.trim();

    if (!titulo) {
        formError.textContent = "El título es obligatorio.";
        return;
    }

    const categoryId = document.getElementById("taskCategory").value;
    const params     = categoryId ? `?categoryId=${categoryId}` : "";

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

// ── Eliminar tarea ────────────────────────────────────────────
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

function formatearFechaHora(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-AR") + " " + fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function escaparHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
