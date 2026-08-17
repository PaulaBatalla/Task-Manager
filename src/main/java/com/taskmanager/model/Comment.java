package com.taskmanager.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Muchos comentarios pertenecen a una tarea
    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    public Comment() {}

    public Comment(String content, Task task) {
        this.content = content;
        this.task = task;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
}
