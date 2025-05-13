package backend.backend.controller;

import backend.backend.model.Comment;
import backend.backend.model.Notification;
import backend.backend.model.User;
import backend.backend.service.CommentService;
import backend.backend.service.NotificationService;
import backend.backend.service.PostService;
import backend.backend.service.UserService;

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

    @Autowired
    private UserService userService;

    @Autowired
    private WebSocketController webSocketController;

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private PostService postService;

    // Tạo bình luận mới
    @PostMapping
    public ResponseEntity<Comment> addComment(
            @RequestParam Long postId,
            @RequestParam Long userId,
            @RequestParam String content) {
        Comment created = commentService.addComment(postId, userId, content);

        // Gửi thông báo realtime
        User sender = userService.getUserById(userId);
        User receiver = userService.getUserByPostId(postId);

        if (sender != null && receiver != null && sender.getId() != receiver.getId()) {
            Notification notification = new Notification();
            String contentNoti = sender.getFirstName() + " " + sender.getLastName() + " đã bình luận bài viết của bạn";
            notification.setContent(contentNoti);
            notification.setSender(sender);
            notification.setReceiver(receiver);
            notification.setPost(postService.getPostById(postId).orElse(null));
            notificationService.createNotification(sender.getId(), receiver.getId(), contentNoti,
                    postService.getPostById(postId).orElse(null), null);
            webSocketController.notifyNewComment(receiver.getId(), notification);
        }

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