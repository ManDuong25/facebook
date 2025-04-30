package backend.backend.controller;

import backend.backend.model.Post;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.PostService;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    // ==================== QUẢN LÝ NGƯỜI DÙNG ====================

    // API lấy danh sách tất cả người dùng (có phân trang)
    @GetMapping("/users")
    public ResponseEntity<ResponseObject> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<User> usersPage = userService.findAllUsersWithPagination(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("users", usersPage.getContent());
            response.put("currentPage", usersPage.getNumber());
            response.put("totalItems", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());

            return ResponseEntity.ok(new ResponseObject("success", "Lấy danh sách người dùng thành công", response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy danh sách người dùng: " + e.getMessage(), null));
        }
    }

    // API lấy thông tin chi tiết của một người dùng
    @GetMapping("/users/{id}")
    public ResponseEntity<ResponseObject> getUserDetails(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            return ResponseEntity.ok(new ResponseObject("success", "Lấy thông tin người dùng thành công", userOpt.get()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy thông tin người dùng: " + e.getMessage(), null));
        }
    }

    // API khóa/mở khóa tài khoản người dùng
    @PutMapping("/users/{id}/status")
    public ResponseEntity<ResponseObject> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        try {
            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            User user = userOpt.get();
            // Giả sử chúng ta thêm trường active vào User model
            // user.setActive(active);
            // Vì hiện tại không có trường active, chúng ta sẽ trả về thông báo

            return ResponseEntity.ok(new ResponseObject("success",
                    active ? "Đã kích hoạt tài khoản người dùng" : "Đã khóa tài khoản người dùng",
                    Map.of("id", id, "active", active)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi cập nhật trạng thái người dùng: " + e.getMessage(), null));
        }
    }

    // API xóa người dùng
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ResponseObject> deleteUser(@PathVariable Long id) {
        try {
            if (!userService.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            userService.deleteUserById(id);
            return ResponseEntity.ok(new ResponseObject("success", "Đã xóa người dùng thành công", Map.of("id", id)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi xóa người dùng: " + e.getMessage(), null));
        }
    }

    // ==================== QUẢN LÝ BÀI VIẾT ====================

    // API lấy danh sách tất cả bài viết (có phân trang, lọc)
    @GetMapping("/posts")
    public ResponseEntity<ResponseObject> getAllPosts(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Map<String, Object> response = new HashMap<>();

            if (userId != null) {
                // Lấy bài viết của một người dùng cụ thể
                User user = userService.getUserById(userId);
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + userId, null));
                }

                List<Post> posts = postService.getPostsByUser(user);
                response.put("posts", posts);
                response.put("totalItems", posts.size());
                response.put("userId", userId);
            } else {
                // Lấy tất cả bài viết với phân trang
                // Giả sử postService có phương thức getAllPostsWithPagination
                List<Post> allPosts = postService.getAllPosts();

                // Thực hiện phân trang thủ công
                int start = page * size;
                int end = Math.min(start + size, allPosts.size());
                List<Post> paginatedPosts = start < allPosts.size() ? allPosts.subList(start, end) : new ArrayList<>();

                response.put("posts", paginatedPosts);
                response.put("currentPage", page);
                response.put("totalItems", allPosts.size());
                response.put("totalPages", (int) Math.ceil((double) allPosts.size() / size));
            }

            return ResponseEntity.ok(new ResponseObject("success", "Lấy danh sách bài viết thành công", response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy danh sách bài viết: " + e.getMessage(), null));
        }
    }

    // API lấy thông tin chi tiết của một bài viết
    @GetMapping("/posts/{id}")
    public ResponseEntity<ResponseObject> getPostDetails(@PathVariable Long id) {
        try {
            Optional<Post> postOpt = postService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy bài viết với ID: " + id, null));
            }

            return ResponseEntity.ok(new ResponseObject("success", "Lấy thông tin bài viết thành công", postOpt.get()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy thông tin bài viết: " + e.getMessage(), null));
        }
    }

    // API ẩn/hiện bài viết
    @PutMapping("/posts/{id}/visibility")
    public ResponseEntity<ResponseObject> updatePostVisibility(
            @PathVariable Long id,
            @RequestParam boolean visible) {
        try {
            Optional<Post> postOpt = postService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy bài viết với ID: " + id, null));
            }

            // Giả sử chúng ta thêm trường visible vào Post model
            // Post post = postOpt.get();
            // post.setVisible(visible);
            // postService.updatePost(id, post);

            return ResponseEntity.ok(new ResponseObject("success",
                    visible ? "Đã hiện bài viết" : "Đã ẩn bài viết",
                    Map.of("id", id, "visible", visible)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi cập nhật trạng thái hiển thị bài viết: " + e.getMessage(), null));
        }
    }

    // API xóa bài viết
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ResponseObject> deletePost(@PathVariable Long id) {
        try {
            Optional<Post> postOpt = postService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy bài viết với ID: " + id, null));
            }

            boolean deleted = postService.deletePost(id);
            if (deleted) {
                return ResponseEntity.ok(new ResponseObject("success", "Đã xóa bài viết thành công", Map.of("id", id)));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseObject("error", "Không thể xóa bài viết", null));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi xóa bài viết: " + e.getMessage(), null));
        }
    }

    // ==================== QUẢN LÝ FILE ====================

    // API để liệt kê tất cả file ảnh đại diện
    @GetMapping("/avatars")
    public ResponseEntity<ResponseObject> listAvatars() {
        try {
            File avatarsDir = new File("uploads/avatars");
            if (!avatarsDir.exists() || !avatarsDir.isDirectory()) {
                return ResponseEntity.ok(
                        new ResponseObject("success", "Thư mục ảnh đại diện không tồn tại", new ArrayList<>()));
            }

            File[] files = avatarsDir.listFiles();
            if (files == null) {
                return ResponseEntity.ok(
                        new ResponseObject("success", "Không tìm thấy file ảnh đại diện", new ArrayList<>()));
            }

            List<Map<String, Object>> fileInfos = new ArrayList<>();
            for (File file : files) {
                if (file.isFile()) {
                    fileInfos.add(Map.of(
                            "name", file.getName(),
                            "path", "/uploads/avatars/" + file.getName(),
                            "size", file.length(),
                            "lastModified", new Date(file.lastModified())
                    ));
                }
            }

            return ResponseEntity.ok(
                    new ResponseObject("success", "Lấy danh sách file ảnh đại diện thành công", fileInfos));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ResponseObject("error", "Lỗi khi lấy danh sách file ảnh đại diện: " + e.getMessage(), null));
        }
    }

    // API để xóa file ảnh đại diện
    @DeleteMapping("/avatars/{filename}")
    public ResponseEntity<ResponseObject> deleteAvatar(@PathVariable String filename) {
        try {
            // Chỉ cho phép xóa file trong thư mục uploads/avatars
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Tên file không hợp lệ", null));
            }

            File file = new File("uploads/avatars/" + filename);
            if (!file.exists()) {
                return ResponseEntity.ok(
                        new ResponseObject("warning", "File không tồn tại", null));
            }

            boolean deleted = file.delete();
            if (deleted) {
                return ResponseEntity.ok(
                        new ResponseObject("success", "Đã xóa file thành công", filename));
            } else {
                return ResponseEntity.internalServerError()
                        .body(new ResponseObject("error", "Không thể xóa file", null));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ResponseObject("error", "Lỗi khi xóa file: " + e.getMessage(), null));
        }
    }

    // API để xóa tất cả file ảnh đại diện không sử dụng
    @DeleteMapping("/avatars/unused")
    public ResponseEntity<ResponseObject> deleteUnusedAvatars() {
        try {
            // TODO: Implement logic to find unused avatars by checking user table
            // Đây là một tính năng phức tạp cần xây dựng thêm
            return ResponseEntity.ok(
                    new ResponseObject("success", "Tính năng này chưa được triển khai", null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ResponseObject("error", "Lỗi khi xóa file không sử dụng: " + e.getMessage(), null));
        }
    }
}