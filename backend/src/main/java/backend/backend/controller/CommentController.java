package backend.backend.controller;

import backend.backend.model.Comment;
import backend.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Tạo bình luận mới
    @PostMapping
    public ResponseEntity<Comment> addComment(
            @RequestParam Long postId,
            @RequestParam Long userId,
            @RequestParam String content) {
        Comment created = commentService.addComment(postId, userId, content);
        return ResponseEntity.ok(created);
    }

    // Lấy bình luận theo bài viết
    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsByPost(@RequestParam Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    // Lấy bình luận theo id
    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(@PathVariable Long id) {
        Optional<Comment> commentOpt = commentService.getCommentById(id);
        return commentOpt.map(ResponseEntity::ok)
                         .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cập nhật bình luận
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody Comment commentUpdate) {
        Comment updated = commentService.updateComment(id, commentUpdate);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Xoá bình luận
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        boolean deleted = commentService.deleteComment(id);
        return deleted ? ResponseEntity.ok("Comment deleted successfully") : ResponseEntity.notFound().build();
    }

    // Lấy số lượng comment của bài viết
    @GetMapping("/count")
    public ResponseEntity<?> countCommentsByPost(@RequestParam Long postId) {
        if (postId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            int count = commentService.countCommentsByPostId(postId);
            return ResponseEntity.ok(java.util.Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}