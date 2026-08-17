package com.taskmanager.repository;

import com.taskmanager.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Trae todos los comentarios de una tarea ordenados por fecha
    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
}
