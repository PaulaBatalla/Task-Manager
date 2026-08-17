# Gestor de Tareas

Proyecto fullstack para gestionar tareas personales. Desarrollado como proyecto de portfolio durante mi carrera universitaria.

## Tecnologías usadas

- **Java + Spring Boot** — API REST del backend
- **PostgreSQL** — base de datos relacional
- **JPA / Hibernate** — para conectar Java con la base de datos sin escribir SQL manual
- **HTML + CSS + JavaScript** — frontend sin frameworks, consume la API con fetch()
- **Docker + Docker Compose** — para levantar la base de datos con un solo comando

## ¿Qué hace la aplicación?

- Crear, editar y eliminar tareas
- Asignar prioridad (alta, media, baja) y estado (pendiente, en progreso, completada)
- Agregar fecha límite y categoría
- Filtrar tareas por estado, prioridad y categoría
- Ordenar tareas por prioridad, fecha límite, estado o fecha de creación

## Arquitectura

El proyecto sigue el patrón **MVC**:

- `model/` — las entidades Task y Category con sus atributos
- `repository/` — acceso a la base de datos usando JPA
- `service/` — lógica de negocio
- `controller/` — endpoints REST que reciben y responden las solicitudes HTTP

## Cómo correrlo localmente

### Requisitos
- Java 17 o superior
- Maven
- Docker y Docker Compose

### Cómo correrlo

1. Levantar la base de datos con Docker Compose:
```bash
docker-compose up -d
```

2. Configurar usuario y contraseña en `src/main/resources/application.properties` si es necesario

3. Correr el backend desde IntelliJ IDEA o con:
```bash
mvn spring-boot:run
```

4. Abrir `frontend/index.html` desde IntelliJ (con el botón de browser integrado) o desde un servidor local

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Obtener todas las tareas |
| GET | `/api/tasks?status=PENDING` | Filtrar por estado |
| GET | `/api/tasks?priority=HIGH` | Filtrar por prioridad |
| GET | `/api/tasks/{id}` | Obtener una tarea por ID |
| POST | `/api/tasks?categoryId=1` | Crear una tarea nueva |
| PUT | `/api/tasks/{id}?categoryId=1` | Actualizar una tarea |
| DELETE | `/api/tasks/{id}` | Eliminar una tarea |
| GET | `/api/categories` | Obtener todas las categorías |

## Autora

**Paula Batalla** — proyecto de portfolio
