package backend.backend.controller;

import backend.backend.model.Notification;
import backend.backend.model.Post;
import backend.backend.model.PostLike;
import backend.backend.model.User;
import backend.backend.service.NotificationService;
import backend.backend.service.PostLikeService;
import backend.backend.service.PostService;
import backend.backend.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
public class PostLikeController {

    @Autowired
    private PostLikeService postLikeService;

    @Autowired
    private UserService userService;

    @Autowired
    private WebSocketController webSocketController;

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private PostService postService;

    // Thêm lượt like cho bài viết
    @PostMapping
    public ResponseEntity<PostLike> likePost(@RequestParam Long postId, @RequestParam Long userId) {
        PostLike like = postLikeService.likePost(postId, userId);

        User sender = userService.getUserById(userId);
        User receiver = userService.getUserByPostId(postId);

        if (sender != null && receiver != null && sender.getId() != receiver.getId()) {
            Notification notification = new Notification();
            String contentNoti = sender.getFirstName() + " " + sender.getLastName() + " đã thích bài viết của bạn";
            notification.setContent(contentNoti);
            notification.setSender(sender);
            notification.setReceiver(receiver);
            notification.setPost(postService.getPostById(postId).orElse(null));
            notificationService.createNotification(sender.getId(), receiver.getId(), contentNoti,
                    postService.getPostById(postId).orElse(null), null, Notification.NotificationType.POST);
            webSocketController.notifyNewLike(receiver.getId(), notification);
        }
        return ResponseEntity.ok(like);
    }

    // Bỏ lượt like
    @DeleteMapping
    public ResponseEntity<?> unlikePost(@RequestParam Long postId, @RequestParam Long userId) {
        postLikeService.unlikePost(postId, userId);
        return ResponseEntity.ok("Unliked successfully");
    }

    // Lấy danh sách like theo bài viết
    @GetMapping
    public ResponseEntity<List<PostLike>> getLikesByPost(@RequestParam Long postId) {
        if (postId == null) {
            return ResponseEntity.badRequest().body(null); // Trả về lỗi nếu postId không hợp lệ
        }
        Post post = new Post();
        post.setId(postId);
        List<PostLike> likes = postLikeService.getLikesByPost(post);
        return ResponseEntity.ok(likes);
    }

    // Lấy số lượng like của bài viết
    @GetMapping("/count")
    public ResponseEntity<?> countLikesByPost(@RequestParam Long postId) {
        if (postId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            int count = postLikeService.countLikesByPostId(postId);
            return ResponseEntity.ok(java.util.Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}