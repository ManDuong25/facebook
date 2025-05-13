package backend.backend.controller;

import backend.backend.model.Post;
import backend.backend.model.User;
import backend.backend.model.Notification;
import backend.backend.service.PostService;
import backend.backend.service.UserService;
import backend.backend.service.NotificationService;
import backend.backend.service.FriendService;
import backend.backend.controller.WebSocketController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FriendService friendService;

    @Autowired
    private WebSocketController webSocketController;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<Post> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId) throws IOException {

        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().body(null);
        }

        String fileUrl = null;
        String imageUrl = null;
        String videoUrl = null;

        if (file != null && !file.isEmpty()) {
            String originalFileName = file.getOriginalFilename();
            String safeFileName = originalFileName.replaceAll("\\s+", "_");
            String fileName = System.currentTimeMillis() + "_" + safeFileName;
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());
            fileUrl = "/uploads/" + fileName;

            if (file.getContentType().startsWith("image/")) {
                imageUrl = fileUrl;
            } else if (file.getContentType().startsWith("video/")) {
                videoUrl = fileUrl;
            }
        }

        Post post = new Post();
        post.setContent(content);
        post.setImageUrl(imageUrl);
        post.setVideoUrl(videoUrl);
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        Post created = postService.createPost(post);

        // Lấy danh sách bạn bè của người đăng bài
        List<User> friends = friendService.getFriendsByUserId(userId);

        // Gửi thông báo đến tất cả bạn bè
        String notificationContent = "vừa đăng một bài viết mới";
        for (User friend : friends) {
            Notification notification = notificationService.createNotification(
                    userId, // sender
                    friend.getId(), // receiver
                    notificationContent,
                    created, // post
                    null, // share
                    Notification.NotificationType.POST);

            // Gửi thông báo realtime qua WebSocket
            if (notification != null) {
                webSocketController.notifyNewPost(friend.getId(), notification);
            }
        }

        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        // Sử dụng getAllVisiblePosts() để chỉ lấy bài viết có visible=true và chưa bị
        // xóa
        return ResponseEntity.ok(postService.getAllVisiblePosts());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        // Sử dụng getVisiblePostsByUser() để chỉ lấy bài viết có visible=true và chưa
        // bị xóa
        return ResponseEntity.ok(postService.getVisiblePostsByUser(user));
    }

    @GetMapping("/user/{userId}/shares")
    public ResponseEntity<List<Post>> getSharedPostsByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        // Sử dụng getVisibleSharedPostsByUser() để chỉ lấy bài viết có visible=true và
        // chưa bị xóa
        return ResponseEntity.ok(postService.getVisibleSharedPostsByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        // Sử dụng getNotDeletedPostById() để chỉ lấy bài viết chưa bị xóa
        Optional<Post> postOpt = postService.getNotDeletedPostById(id);

        // Kiểm tra thêm điều kiện visible=true
        if (postOpt.isPresent() && (postOpt.get().getVisible() == null || !postOpt.get().getVisible())) {
            return ResponseEntity.notFound().build();
        }

        return postOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post postUpdate) {
        Post updated = postService.updatePost(id, postUpdate);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        boolean deleted = postService.deletePost(id);
        return deleted ? ResponseEntity.ok("Post deleted successfully") : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}/feed")
    public ResponseEntity<List<Post>> getUserFeed(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        // Lấy danh sách bạn bè của người dùng
        List<User> friends = friendService.getFriendsByUserId(userId);
        // Thêm người dùng hiện tại vào danh sách để lấy cả bài viết của họ
        friends.add(user);
        // Lấy tất cả bài viết của người dùng và bạn bè
        return ResponseEntity.ok(postService.getPostsByUsers(friends));
    }

}