package com.taskmanager.controller;

import com.taskmanager.model.Comment;
import com.taskmanager.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // GET /api/tasks/{taskId}/comments
    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId));
    }

    // POST /api/tasks/{taskId}/comments
    @PostMapping
    public ResponseEntity<Comment> createComment(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body) {

        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return commentService.createComment(taskId, content.trim())
                .map(comment -> ResponseEntity.status(HttpStatus.CREATED).body(comment))
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/tasks/{taskId}/comments/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long taskId, @PathVariable Long id) {
        if (commentService.deleteComment(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
