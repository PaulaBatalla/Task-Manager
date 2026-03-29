-- ============================================================
-- Task Manager - Database Setup Script
-- Run this script in PostgreSQL before starting the backend
-- ============================================================

-- Create the database (run this as superuser if it doesn't exist)
-- CREATE DATABASE taskmanager;

-- Connect to the database and run the rest:

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

-- Sample data to test the API
INSERT INTO tasks (title, description, priority, status, due_date) VALUES
    ('Set up Spring Boot project',  'Initialize project with Maven and configure dependencies', 'HIGH',   'DONE',        '2024-01-10'),
    ('Design database schema',      'Create tables and define relationships for the task model',  'HIGH',   'DONE',        '2024-01-11'),
    ('Implement REST endpoints',    'Build CRUD endpoints for the Task entity',                   'HIGH',   'IN_PROGRESS', '2024-01-15'),
    ('Build frontend UI',           'Create the HTML/CSS/JS interface to consume the API',        'MEDIUM', 'PENDING',     '2024-01-20'),
    ('Write README documentation',  'Document how to set up and run the project',                 'LOW',    'PENDING',     '2024-01-22');
