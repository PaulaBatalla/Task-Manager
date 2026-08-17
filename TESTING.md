# Plan de Pruebas — Gestor de Tareas

## Introducción

Este documento describe el plan de pruebas para la API REST del Gestor de Tareas. Las pruebas fueron ejecutadas con Postman y cubren los flujos principales de la aplicación.

## Alcance

Se prueban los siguientes módulos:
- Autenticación (registro e inicio de sesión)
- Gestión de tareas (CRUD completo)
- Casos de error y validaciones

## Entorno de pruebas

| Item | Detalle |
|------|---------|
| Backend | Java 17 + Spring Boot 3.2 |
| Base de datos | PostgreSQL 16 (Docker) |
| Herramienta de testing | Postman 11.70 |
| URL base | http://localhost:8080 |

---

## Casos de prueba

### Autenticación

| ID | Caso | Método | Endpoint | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|------|--------|----------|-----------------|-------------------|-------------------|--------|
| TC-01 | Registro exitoso | POST | /api/auth/register | email y password válidos | 201 + token JWT | 201 + token JWT | ✅ PASSED |
| TC-02 | Login exitoso | POST | /api/auth/login | email y password correctos | 200 + token JWT | 200 + token JWT | ✅ PASSED |
| TC-03 | Login con contraseña incorrecta | POST | /api/auth/login | password incorrecto | 401 Unauthorized | 401 + mensaje de error | ✅ PASSED |

### Tareas

| ID | Caso | Método | Endpoint | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|----|------|--------|----------|-----------------|-------------------|-------------------|--------|
| TC-04 | Obtener tareas del usuario | GET | /api/tasks | token válido | 200 + array de tareas | 200 + array | ✅ PASSED |
| TC-05 | Crear tarea exitosamente | POST | /api/tasks | token + datos válidos | 201 + tarea creada | 201 + tarea con ID | ✅ PASSED |
| TC-06 | Actualizar tarea | PUT | /api/tasks/{id} | token + datos nuevos | 200 + tarea actualizada | 200 + datos actualizados | ✅ PASSED |
| TC-07 | Obtener tarea por ID | GET | /api/tasks/{id} | token + ID válido | 200 + tarea | 200 + tarea | ✅ PASSED |
| TC-08 | Eliminar tarea | DELETE | /api/tasks/{id} | token + ID válido | 204 No Content | 204 sin body | ✅ PASSED |
| TC-09 | Crear tarea sin título | POST | /api/tasks | token + sin title | 400 Bad Request | 403 Forbidden | ⚠️ BUG |
| TC-10 | Obtener tarea inexistente | GET | /api/tasks/99999 | token + ID inválido | 404 Not Found | 404 Not Found | ✅ PASSED |

---

## Bugs encontrados

### BUG-01 — Validación de título devuelve 403 en lugar de 400

| Campo | Detalle |
|-------|---------|
| ID | BUG-01 |
| Severidad | Baja |
| Endpoint | POST /api/tasks |
| Pasos para reproducir | 1. Autenticarse y obtener token. 2. Enviar POST /api/tasks sin el campo "title". 3. Observar el código de respuesta. |
| Resultado esperado | 400 Bad Request — los datos enviados son inválidos |
| Resultado obtenido | 403 Forbidden — indica falta de permisos |
| Posible causa | Spring Security intercepta el request antes de que llegue a la validación del controller |

---

## Cobertura

| Módulo | Total casos | Passed | Failed | Bugs |
|--------|------------|--------|--------|------|
| Autenticación | 3 | 3 | 0 | 0 |
| Tareas | 7 | 6 | 0 | 1 |
| **Total** | **10** | **9** | **0** | **1** |
