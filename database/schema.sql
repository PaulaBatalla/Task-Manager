/* Script de la database */

CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

CREATE TABLE IF NOT EXISTS tasks (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    priority    VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    due_date    DATE
);

-- Datos para testear la API
INSERT INTO tasks (title, description, priority, status, due_date) VALUES
    ('Estudiar para el parcial', 'Repasar los temas de base de datos', 'HIGH', 'PENDING', '2026-04-10'),
    ('Hacer las compras', null, 'LOW', 'PENDING', null),
    ('Entregar el TP de programación', 'Subir el proyecto a GitHub', 'HIGH', 'IN_PROGRESS', '2026-04-15'),
