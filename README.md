# Gestor de Tareas

Proyecto fullstack para gestionar tareas personales. Desarrollado como proyecto de portfolio durante mi carrera universitaria.

## Tecnologías usadas

- **Java + Spring Boot** — API REST del backend
- **PostgreSQL** — base de datos relacional
- **JPA / Hibernate** — para conectar Java con la base de datos sin escribir SQL manual
- **HTML + CSS + JavaScript** — frontend sin frameworks, consume la API con fetch()

## ¿Qué hace la aplicación?

- Crear, editar y eliminar tareas
- Asignar prioridad (alta, media, baja) y estado (pendiente, en progreso, completada)
- Agregar fecha límite
- Filtrar tareas por estado y prioridad

## Arquitectura

El proyecto sigue el patrón **MVC**:

- `model/` — la entidad Tarea con sus atributos
- `repository/` — acceso a la base de datos usando JPA
- `service/` — lógica de negocio
- `controller/` — endpoints REST que reciben y responden las solicitudes HTTP

## Cómo correrlo localmente

### Requisitos
- Java 17 o superior
- Maven
- PostgreSQL (o Docker)

## Cómo correrlo

1. Tener PostgreSQL corriendo con una base de datos llamada `taskmanager`
2. Configurar usuario y contraseña en `application.properties`
3. Correr el backend con `mvn spring-boot:run`
4. Abrir `frontend/index.html` en el navegador

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Obtener todas las tareas |
| GET | `/api/tasks?status=PENDING` | Filtrar por estado |
| GET | `/api/tasks?priority=HIGH` | Filtrar por prioridad |
| GET | `/api/tasks/{id}` | Obtener una tarea por ID |
| POST | `/api/tasks` | Crear una tarea nueva |
| PUT | `/api/tasks/{id}` | Actualizar una tarea |
| DELETE | `/api/tasks/{id}` | Eliminar una tarea |

## Autora

**Paula Batalla** — proyecto de portfolio
