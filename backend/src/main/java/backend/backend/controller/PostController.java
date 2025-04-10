package backend.backend.controller;

import backend.backend.model.Post;
import backend.backend.model.User;
import backend.backend.service.PostService;
import backend.backend.service.UserService;
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

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<Post> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        Long userId = 1L;
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
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
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(postService.getPostsByUser(user));
    }

    @GetMapping("/user/{userId}/shares")
    public ResponseEntity<List<Post>> getSharedPostsByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(postService.getSharedPostsByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        Optional<Post> postOpt = postService.getPostById(id);
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