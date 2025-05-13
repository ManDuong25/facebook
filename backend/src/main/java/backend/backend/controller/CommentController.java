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
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

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
                    postService.getPostById(postId).orElse(null), null, Notification.NotificationType.COMMENT);
            webSocketController.notifyNewPost(receiver.getId(), notification);
        }

        // Gửi comment mới qua WebSocket
        webSocketController.broadcastComment(postId, new CommentMessage("NEW_COMMENT", created));

        return ResponseEntity.ok(created);
    }

    // Message mapping cho WebSocket
    @MessageMapping("/comment")
    @SendTo("/topic/comments")
    public CommentMessage handleComment(@Payload CommentMessage message) {
        return message;
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
        if (updated != null) {
            // Gửi thông báo cập nhật comment qua WebSocket
            webSocketController.broadcastComment(updated.getPost().getId(),
                    new CommentMessage("UPDATE_COMMENT", updated));
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // Xoá bình luận
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        Comment comment = commentService.getCommentById(id).orElse(null);
        boolean deleted = commentService.deleteComment(id);
        if (deleted && comment != null) {
            // Gửi thông báo xóa comment qua WebSocket
            webSocketController.broadcastComment(comment.getPost().getId(),
                    new CommentMessage("DELETE_COMMENT", id));
            return ResponseEntity.ok("Comment deleted successfully");
        }
        return ResponseEntity.notFound().build();
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

    // Inner class để đóng gói message WebSocket
    private static class CommentMessage {
        private String type;
        private Object data;

        public CommentMessage() {
        }

        public CommentMessage(String type, Object data) {
            this.type = type;
            this.data = data;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Object getData() {
            return data;
        }

        public void setData(Object data) {
            this.data = data;
        }
    }
}