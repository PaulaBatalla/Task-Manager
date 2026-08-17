package com.taskmanager.service;

import com.taskmanager.model.Comment;
import com.taskmanager.model.Task;
import com.taskmanager.repository.CommentRepository;
import com.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;

    public CommentService(CommentRepository commentRepository, TaskRepository taskRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
    }

    // Trae todos los comentarios de una tarea
    public List<Comment> getCommentsByTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    // Crea un comentario nuevo para una tarea
    public Optional<Comment> createComment(Long taskId, String content) {
        return taskRepository.findById(taskId).map(task -> {
            Comment comment = new Comment(content, task);
            return commentRepository.save(comment);
        });
    }

    // Elimina un comentario por ID
    public boolean deleteComment(Long id) {
        if (commentRepository.existsById(id)) {
            commentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
