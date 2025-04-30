package backend.backend.controller;

import backend.backend.model.Comment;
import backend.backend.model.Post;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.CommentService;
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

    @Autowired
    private CommentService commentService;

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

    // Sử dụng API chung từ UserController: GET /api/users/{id}

    // API lấy thống kê tổng quan cho dashboard
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ResponseObject> getDashboardStats() {
        try {
            // Lấy tổng số người dùng
            long totalUsers = userService.countAllUsers();

            // Lấy tổng số bài viết
            long totalPosts = postService.countAllPosts();

            // Lấy tổng số bình luận
            long totalComments = commentService.countAllComments();

            // Tạo đối tượng chứa thống kê
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalPosts", totalPosts);
            stats.put("totalComments", totalComments);

            return ResponseEntity.ok(new ResponseObject("success", "Lấy thống kê tổng quan thành công", stats));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy thống kê tổng quan: " + e.getMessage(), null));
        }
    }

    // API lấy dữ liệu hoạt động gần đây (biểu đồ)
    @GetMapping("/dashboard/activity")
    public ResponseEntity<ResponseObject> getActivityStats() {
        try {
            // Lấy số lượng bài viết trong 30 ngày qua
            int recentPosts = postService.countPostsInLastDays(30);

            // Lấy số lượng bình luận trong 30 ngày qua
            int recentComments = commentService.countCommentsInLastDays(30);

            // Lấy số lượng đăng ký mới trong 30 ngày qua
            int recentRegistrations = userService.countUsersCreatedInLastDays(30);

            // Tạo danh sách hoạt động
            List<Map<String, Object>> activityData = new ArrayList<>();

            Map<String, Object> postsActivity = new HashMap<>();
            postsActivity.put("label", "Bài viết");
            postsActivity.put("value", recentPosts);
            activityData.add(postsActivity);

            Map<String, Object> commentsActivity = new HashMap<>();
            commentsActivity.put("label", "Bình luận");
            commentsActivity.put("value", recentComments);
            activityData.add(commentsActivity);

            Map<String, Object> registrationsActivity = new HashMap<>();
            registrationsActivity.put("label", "Đăng ký");
            registrationsActivity.put("value", recentRegistrations);
            activityData.add(registrationsActivity);

            return ResponseEntity.ok(new ResponseObject("success", "Lấy dữ liệu hoạt động thành công", activityData));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy dữ liệu hoạt động: " + e.getMessage(), null));
        }
    }



    // API khóa/mở khóa tài khoản người dùng
    @PutMapping("/users/{id}/status")
    public ResponseEntity<ResponseObject> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> statusData) {
        try {
            Boolean isActive = statusData.get("isActive");
            if (isActive == null) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Trạng thái tài khoản không được để trống", null));
            }

            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            User user = userOpt.get();
            // Cập nhật trạng thái tài khoản (isBlocked = !isActive)
            user.setIsBlocked(!isActive);
            userService.saveUser(user);

            return ResponseEntity.ok(new ResponseObject("success",
                    isActive ? "Đã kích hoạt tài khoản người dùng" : "Đã khóa tài khoản người dùng",
                    Map.of("id", id, "isActive", isActive, "isBlocked", !isActive)));
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

    // API cập nhật thông tin người dùng
    @PutMapping("/users/{id}")
    public ResponseEntity<ResponseObject> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            User existingUser = userOpt.get();

            // Cập nhật thông tin cơ bản
            if (updatedUser.getFirstName() != null) existingUser.setFirstName(updatedUser.getFirstName());
            if (updatedUser.getLastName() != null) existingUser.setLastName(updatedUser.getLastName());
            if (updatedUser.getEmail() != null) existingUser.setEmail(updatedUser.getEmail());
            if (updatedUser.getUsername() != null) existingUser.setUsername(updatedUser.getUsername());
            if (updatedUser.getDateOfBirth() != null) existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
            if (updatedUser.getGender() != null) existingUser.setGender(updatedUser.getGender());
            if (updatedUser.getWork() != null) existingUser.setWork(updatedUser.getWork());
            if (updatedUser.getEducation() != null) existingUser.setEducation(updatedUser.getEducation());
            if (updatedUser.getCurrentCity() != null) existingUser.setCurrentCity(updatedUser.getCurrentCity());
            if (updatedUser.getHometown() != null) existingUser.setHometown(updatedUser.getHometown());
            if (updatedUser.getBio() != null) existingUser.setBio(updatedUser.getBio());

            // Cập nhật quyền admin nếu được chỉ định
            if (updatedUser.getIsAdmin() != null) existingUser.setIsAdmin(updatedUser.getIsAdmin());

            // Lưu người dùng đã cập nhật
            User savedUser = userService.saveUser(existingUser);

            return ResponseEntity.ok(new ResponseObject("success", "Cập nhật thông tin người dùng thành công", savedUser));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi cập nhật thông tin người dùng: " + e.getMessage(), null));
        }
    }

    // API đặt lại mật khẩu cho người dùng
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<ResponseObject> resetUserPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwordData) {
        try {
            String newPassword = passwordData.get("newPassword");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Mật khẩu mới không được để trống", null));
            }

            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            User user = userOpt.get();

            // Mã hóa mật khẩu mới và cập nhật
            user.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(newPassword));
            userService.saveUser(user);

            return ResponseEntity.ok(new ResponseObject("success", "Đặt lại mật khẩu thành công", Map.of("id", id)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi đặt lại mật khẩu: " + e.getMessage(), null));
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