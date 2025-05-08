package backend.backend.controller;

import backend.backend.model.Post;
import backend.backend.model.User;
import backend.backend.model.Notification;
import backend.backend.service.PostService;
import backend.backend.service.UserService;
import backend.backend.service.NotificationService;
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

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<Post> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId) throws IOException {

        // Nếu không có userId được gửi lên, báo lỗi
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
            // Thay khoảng trắng bằng dấu gạch dưới (_)
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

        // Tạo thông báo cho bài viết mới
        String notificationContent = user.getUsername() + " vừa tạo một bài viết";
        notificationService.createNotification(
                userId,
                Notification.NotificationType.CREATE_POST,
                created.getId(),
                notificationContent);

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
}