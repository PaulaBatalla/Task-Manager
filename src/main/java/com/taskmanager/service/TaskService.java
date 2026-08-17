package com.taskmanager.service;

import com.taskmanager.model.Category;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.CategoryRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       CategoryRepository categoryRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    // Devuelve solo las tareas del usuario autenticado
    public List<Task> getAllTasks(String email) {
        return taskRepository.findByUserEmail(email);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> getTasksByStatus(Task.Status status, String email) {
        return taskRepository.findByStatusAndUserEmail(status, email);
    }

    public List<Task> getTasksByPriority(Task.Priority priority, String email) {
        return taskRepository.findByPriorityAndUserEmail(priority, email);
    }

    public List<Task> getTasksByStatusAndPriority(Task.Status status, Task.Priority priority, String email) {
        return taskRepository.findByStatusAndPriorityAndUserEmail(status, priority, email);
    }

    public Task createTask(Task task, Long categoryId, String email) {
        asignarCategoria(task, categoryId);
        asignarUsuario(task, email);
        return taskRepository.save(task);
    }

    public Optional<Task> updateTask(Long id, Task updatedTask, Long categoryId) {
        return taskRepository.findById(id).map(existingTask -> {
            existingTask.setTitle(updatedTask.getTitle());
            existingTask.setDescription(updatedTask.getDescription());
            existingTask.setPriority(updatedTask.getPriority());
            existingTask.setStatus(updatedTask.getStatus());
            existingTask.setDueDate(updatedTask.getDueDate());
            asignarCategoria(existingTask, categoryId);
            return taskRepository.save(existingTask);
        });
    }

    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private void asignarCategoria(Task task, Long categoryId) {
        if (categoryId != null) {
            categoryRepository.findById(categoryId).ifPresent(task::setCategory);
        } else {
            task.setCategory(null);
        }
    }

    private void asignarUsuario(Task task, String email) {
        userRepository.findByEmail(email).ifPresent(task::setUser);
    }
}
