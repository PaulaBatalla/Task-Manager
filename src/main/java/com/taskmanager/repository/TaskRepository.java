package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Filtra por usuario
    List<Task> findByUserEmail(String email);
    List<Task> findByStatusAndUserEmail(Task.Status status, String email);
    List<Task> findByPriorityAndUserEmail(Task.Priority priority, String email);
    List<Task> findByStatusAndPriorityAndUserEmail(Task.Status status, Task.Priority priority, String email);
}
