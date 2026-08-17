package com.taskmanager.service;

import com.taskmanager.model.Category;
import com.taskmanager.model.Task;
import com.taskmanager.repository.CategoryRepository;
import com.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;

    public TaskService(TaskRepository taskRepository, CategoryRepository categoryRepository) {
        this.taskRepository = taskRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> getTasksByStatus(Task.Status status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> getTasksByPriority(Task.Priority priority) {
        return taskRepository.findByPriority(priority);
    }

    public List<Task> getTasksByStatusAndPriority(Task.Status status, Task.Priority priority) {
        return taskRepository.findByStatusAndPriority(status, priority);
    }

    public Task createTask(Task task, Long categoryId) {
        asignarCategoria(task, categoryId);
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

    // Busca la categoría por ID y la asigna a la tarea
    // Si no se manda categoryId (null), la tarea queda sin categoría
    private void asignarCategoria(Task task, Long categoryId) {
        if (categoryId != null) {
            Optional<Category> category = categoryRepository.findById(categoryId);
            category.ifPresent(task::setCategory);
        } else {
            task.setCategory(null);
        }
    }
}
