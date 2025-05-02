package backend.backend.controller;

import backend.backend.model.Post;
import backend.backend.model.ResponseObject;
import backend.backend.model.Share;
import backend.backend.model.User;
import backend.backend.service.ShareService;
import backend.backend.service.UserService;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/api/shares")
public class ShareController {

    @Autowired
    private ShareService shareService;

    // Thêm lượt chia sẻ cho bài viết
    @PostMapping
    public ResponseEntity<Share> addShare(@RequestBody Share share) {
        Share created = shareService.addShare(share);
        return ResponseEntity.ok(created);
    }

    // Lấy danh sách share theo bài viết
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Share>> getSharesByPost(@PathVariable Long postId) {
        Post post = new Post();
        post.setId(postId);
        return ResponseEntity.ok(shareService.getSharesByPost(post));
    }

    // Lấy số lượng share của bài viết
    @GetMapping("/count/{postId}")
    public ResponseEntity<?> countSharesByPost(@PathVariable Long postId) {
        if (postId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            int count = shareService.countSharesByPostId(postId);
            return ResponseEntity.ok(java.util.Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
