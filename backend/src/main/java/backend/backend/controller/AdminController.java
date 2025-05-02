package backend.backend.controller;

import backend.backend.model.Post;
import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.CommentService;
import backend.backend.service.PostService;
import backend.backend.service.UserService;
import backend.backend.service.UserStatsService;
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

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserStatsService userStatsService;

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

    // API tạo người dùng mới (dành cho admin)
    @PostMapping("/users")
    public ResponseEntity<ResponseObject> createUser(@RequestBody User newUser) {
        try {
            // Kiểm tra email đã tồn tại chưa
            if (userService.existsByEmail(newUser.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Email đã tồn tại trong hệ thống", null));
            }

            // Kiểm tra username đã tồn tại chưa
            if (userService.existsByUsername(newUser.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Tên đăng nhập đã tồn tại", null));
            }

            // Kiểm tra các trường bắt buộc
            if (newUser.getUsername() == null || newUser.getUsername().trim().isEmpty() ||
                newUser.getEmail() == null || newUser.getEmail().trim().isEmpty() ||
                newUser.getPassword() == null || newUser.getPassword().trim().isEmpty() ||
                newUser.getFirstName() == null || newUser.getFirstName().trim().isEmpty() ||
                newUser.getLastName() == null || newUser.getLastName().trim().isEmpty() ||
                newUser.getDateOfBirth() == null ||
                newUser.getGender() == null || newUser.getGender().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Vui lòng điền đầy đủ thông tin bắt buộc", null));
            }

            // Mã hóa mật khẩu
            newUser.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(newUser.getPassword()));

            // Đặt thời gian tạo
            newUser.setCreatedAt(java.time.LocalDateTime.now());

            // Lưu người dùng mới
            User savedUser = userService.saveUser(newUser);

            return ResponseEntity.ok(new ResponseObject("success", "Tạo người dùng mới thành công", savedUser));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi tạo người dùng mới: " + e.getMessage(), null));
        }
    }

    // Sử dụng API chung từ UserController: GET /api/users/{id}

    // API lấy thống kê tổng quan cho dashboard
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ResponseObject> getDashboardStats() {
        try {
            // Lấy tổng số người dùng
            long totalUsers = userService.countAllUsers();

            // Lấy tổng số bài viết (chỉ đếm bài viết chưa bị xóa)
            long totalPosts = postService.countAllNotDeletedPosts();

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
            Boolean isBlocked = statusData.get("isBlocked");
            if (isBlocked == null) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Trạng thái tài khoản không được để trống", null));
            }

            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            User user = userOpt.get();
            // Cập nhật trạng thái tài khoản
            user.setIsBlocked(isBlocked);
            userService.saveUser(user);

            return ResponseEntity.ok(new ResponseObject("success",
                    isBlocked ? "Đã khóa tài khoản người dùng" : "Đã kích hoạt tài khoản người dùng",
                    Map.of("id", id, "isBlocked", isBlocked)));
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

    /**
     * API lấy thông tin chi tiết của người dùng bao gồm các thống kê hoạt động
     */
    @GetMapping("/users/{id}/detail")
    public ResponseEntity<ResponseObject> getUserDetail(@PathVariable Long id) {
        try {
            // Kiểm tra xem người dùng có tồn tại không
            if (!userService.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy người dùng với ID: " + id, null));
            }

            // Lấy thông tin chi tiết người dùng từ UserStatsService
            Map<String, Object> userDetail = userStatsService.getUserDetailWithStats(id);

            return ResponseEntity.ok(new ResponseObject("success", "Lấy thông tin chi tiết người dùng thành công", userDetail));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy thông tin chi tiết người dùng: " + e.getMessage(), null));
        }
    }

    // ==================== QUẢN LÝ BÀI VIẾT ====================

    // API lấy danh sách tất cả bài viết (có phân trang, tìm kiếm) - chỉ lấy bài viết chưa bị xóa
    @GetMapping("/posts")
    public ResponseEntity<ResponseObject> getPosts(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        try {
            // Chỉ lấy bài viết chưa bị xóa mềm
            Page<Post> postsPage = postService.getNotDeletedPosts(userId, searchTerm, page, size, sortBy, sortDir);

            Map<String, Object> response = new HashMap<>();
            response.put("posts", postsPage.getContent());
            response.put("currentPage", postsPage.getNumber());
            response.put("totalItems", postsPage.getTotalElements());
            response.put("totalPages", postsPage.getTotalPages());

            if (userId != null) {
                response.put("userId", userId);
            }

            return ResponseEntity.ok(new ResponseObject("success", "Lấy danh sách bài viết thành công", response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy danh sách bài viết: " + e.getMessage(), null));
        }
    }

    // API lấy danh sách bài viết đã xóa (có phân trang)
    @GetMapping("/posts/deleted")
    public ResponseEntity<ResponseObject> getDeletedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // Tạo Pageable với sắp xếp theo thời gian xóa giảm dần
            Pageable pageable = PageRequest.of(page, size, Sort.by("deletedAt").descending());

            // Lấy danh sách bài viết đã xóa
            Page<Post> postsPage = postService.getDeletedPosts(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("posts", postsPage.getContent());
            response.put("currentPage", postsPage.getNumber());
            response.put("totalItems", postsPage.getTotalElements());
            response.put("totalPages", postsPage.getTotalPages());

            return ResponseEntity.ok(new ResponseObject("success", "Lấy danh sách bài viết đã xóa thành công", response));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy danh sách bài viết đã xóa: " + e.getMessage(), null));
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

            Post post = postOpt.get();

            // Thêm thông tin về trạng thái xóa
            Map<String, Object> postData = new HashMap<>();
            postData.put("post", post);
            postData.put("isDeleted", post.isDeleted());
            if (post.getDeletedAt() != null) {
                postData.put("deletedAt", post.getDeletedAt());
            }

            return ResponseEntity.ok(new ResponseObject("success", "Lấy thông tin bài viết thành công", postData));
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
            @RequestBody Map<String, Boolean> visibilityData) {
        try {
            Boolean visible = visibilityData.get("visible");
            if (visible == null) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Trạng thái hiển thị không được để trống", null));
            }

            Optional<Post> postOpt = postService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy bài viết với ID: " + id, null));
            }

            Post updatedPost = postService.updatePostVisibility(id, visible);

            return ResponseEntity.ok(new ResponseObject("success",
                    visible ? "Đã hiện bài viết" : "Đã ẩn bài viết",
                    Map.of("id", updatedPost.getId(), "visible", updatedPost.getVisible())));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi cập nhật trạng thái hiển thị bài viết: " + e.getMessage(), null));
        }
    }

    // API xóa mềm bài viết
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

    // API khôi phục bài viết đã xóa
    @PutMapping("/posts/{id}/restore")
    public ResponseEntity<ResponseObject> restorePost(@PathVariable Long id) {
        try {
            Optional<Post> postOpt = postService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy bài viết với ID: " + id, null));
            }

            if (postOpt.get().getDeletedAt() == null) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Bài viết này chưa bị xóa", null));
            }

            boolean restored = postService.restorePost(id);
            if (restored) {
                return ResponseEntity.ok(new ResponseObject("success", "Đã khôi phục bài viết thành công", Map.of("id", id)));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseObject("error", "Không thể khôi phục bài viết", null));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi khôi phục bài viết: " + e.getMessage(), null));
        }
    }

    // API xóa vĩnh viễn bài viết (hard delete)
    @DeleteMapping("/posts/{id}/permanent")
    public ResponseEntity<ResponseObject> permanentDeletePost(@PathVariable Long id) {
        try {
            Optional<Post> postOpt = postService.getPostById(id);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("error", "Không tìm thấy bài viết với ID: " + id, null));
            }

            boolean deleted = postService.permanentDeletePost(id);
            if (deleted) {
                return ResponseEntity.ok(new ResponseObject("success", "Đã xóa vĩnh viễn bài viết thành công", Map.of("id", id)));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseObject("error", "Không thể xóa vĩnh viễn bài viết", null));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi xóa vĩnh viễn bài viết: " + e.getMessage(), null));
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

    // API lấy danh sách người dùng cho dropdown
    @GetMapping("/users/list")
    public ResponseEntity<ResponseObject> getUsersList() {
        try {
            List<User> users = userService.findAllUsers();

            // Chỉ lấy thông tin cần thiết
            List<Map<String, Object>> simplifiedUsers = new ArrayList<>();
            for (User user : users) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                userMap.put("firstName", user.getFirstName());
                userMap.put("lastName", user.getLastName());
                simplifiedUsers.add(userMap);
            }

            return ResponseEntity.ok(new ResponseObject("success", "Lấy danh sách người dùng thành công", simplifiedUsers));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("error", "Lỗi khi lấy danh sách người dùng: " + e.getMessage(), null));
        }
    }
}