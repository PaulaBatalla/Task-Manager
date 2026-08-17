-- ============================================================
-- Gestor de Tareas - Script de base de datos
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tasks (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    priority    VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    due_date    DATE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL
);

-- Categorías predefinidas
INSERT INTO categories (name) VALUES
    ('Personal'),
    ('Estudio'),
    ('Trabajo'),
    ('Salud'),
    ('Otro');

-- Datos de ejemplo
INSERT INTO tasks (title, description, priority, status, due_date, category_id) VALUES
    ('Estudiar para el parcial',       'Repasar los temas de base de datos', 'HIGH',   'PENDING',     '2026-04-10', 2),
    ('Hacer las compras',              null,                                  'LOW',    'PENDING',     null,         1),
    ('Entregar el TP de programación', 'Subir el proyecto a GitHub',          'HIGH',   'IN_PROGRESS', '2026-04-15', 2);
