# Gestor de Tareas

Proyecto fullstack para gestionar tareas personales. Desarrollado como proyecto de portfolio durante mi carrera universitaria.

## Tecnologías usadas

- **Java + Spring Boot** — API REST del backend
- **Spring Security + JWT** — autenticación y autorización
- **PostgreSQL** — base de datos relacional
- **JPA / Hibernate** — para conectar Java con la base de datos sin escribir SQL manual
- **HTML + CSS + JavaScript** — frontend sin frameworks, consume la API con fetch()
- **Docker + Docker Compose** — para levantar la base de datos con un solo comando

## ¿Qué hace la aplicación?

- Registro e inicio de sesión con email y contraseña
- Cada usuario ve únicamente sus propias tareas
- Crear, editar y eliminar tareas
- Asignar prioridad (alta, media, baja), estado (pendiente, en progreso, completada) y categoría
- Agregar fecha límite
- Agregar y eliminar comentarios en cada tarea
- Filtrar tareas por estado, prioridad y categoría
- Ordenar tareas por prioridad, fecha límite, estado o fecha de creación

## Arquitectura

El proyecto sigue el patrón **MVC**:

- `model/` — entidades: Task, Category, Comment, User
- `repository/` — acceso a la base de datos usando JPA
- `service/` — lógica de negocio
- `controller/` — endpoints REST que reciben y responden las solicitudes HTTP
- `security/` — configuración de Spring Security, filtro JWT y generación de tokens

## Cómo correrlo localmente

### Requisitos
- Java 17 o superior
- Maven
- Docker y Docker Compose

### Pasos

1. Levantar la base de datos:
```bash
docker-compose up -d
```

2. Configurar usuario y contraseña en `src/main/resources/application.properties` si es necesario

3. Correr el backend desde IntelliJ IDEA o con:
```bash
mvn spring-boot:run
```

4. Abrir `frontend/login.html` desde IntelliJ con el botón de browser integrado

## Endpoints de la API

### Autenticación (públicos)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar un usuario nuevo |
| POST | `/api/auth/login` | Iniciar sesión y obtener token |

### Tareas (requieren token JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Obtener las tareas del usuario |
| GET | `/api/tasks?status=PENDING` | Filtrar por estado |
| GET | `/api/tasks?priority=HIGH` | Filtrar por prioridad |
| GET | `/api/tasks/{id}` | Obtener una tarea por ID |
| POST | `/api/tasks?categoryId=1` | Crear una tarea nueva |
| PUT | `/api/tasks/{id}?categoryId=1` | Actualizar una tarea |
| DELETE | `/api/tasks/{id}` | Eliminar una tarea |

### Comentarios (requieren token JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks/{id}/comments` | Ver comentarios de una tarea |
| POST | `/api/tasks/{id}/comments` | Agregar un comentario |
| DELETE | `/api/tasks/{taskId}/comments/{id}` | Eliminar un comentario |

### Categorías (requieren token JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categories` | Obtener todas las categorías |

## Autora

**Paula Batalla** — proyecto de portfolio
