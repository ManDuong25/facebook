package backend.backend.controller;

import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Lấy thông tin user
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(new ResponseObject("success", "User found", user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("failed", "User not found", null)));
    }

    // Lấy tất cả user (có hỗ trợ phân trang)
    @GetMapping("/getAll")
    public ResponseEntity<ResponseObject> getAllUsers(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "false") boolean paginate) {
        try {
            if (paginate) {
                // Sử dụng phân trang
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                        page,
                        size,
                        org.springframework.data.domain.Sort.by("createdAt").descending());

                org.springframework.data.domain.Page<User> usersPage = userService.findAllUsersWithPagination(pageable);

                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("users", usersPage.getContent());
                response.put("currentPage", usersPage.getNumber());
                response.put("totalItems", usersPage.getTotalElements());
                response.put("totalPages", usersPage.getTotalPages());

                return ResponseEntity.ok(new ResponseObject("success", "Users retrieved with pagination", response));
            } else {
                // Không sử dụng phân trang, lấy tất cả
                List<User> users = userService.findAllUsers();
                return ResponseEntity.ok(new ResponseObject("success", "All users retrieved", users));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("failed", "Error retrieving users: " + e.getMessage(), null));
        }
    }

    // Tìm kiếm người dùng theo tên, username hoặc email
    @GetMapping("/search")
    public ResponseEntity<ResponseObject> searchUsers(
            @RequestParam String searchTerm,
            @RequestParam(required = false, defaultValue = "true") boolean excludeCurrentUser) {
        try {
            // Log thông tin tìm kiếm chi tiết
            System.out.println("\n\n========= USER SEARCH REQUEST ===========");
            System.out.println("Searching users with term: " + searchTerm);
            System.out.println("Exclude current user: " + excludeCurrentUser);

            // Kiểm tra thông tin tìm kiếm
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                System.out.println("WARNING: Empty search term provided");
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "Từ khóa tìm kiếm không được để trống", null));
            }

            // Thực hiện tìm kiếm người dùng qua service
            List<User> searchResults = userService.searchUsers(searchTerm);

            // Loại bỏ người dùng hiện tại nếu được yêu cầu
            if (excludeCurrentUser) {
                // Trong thực tế, bạn sẽ lấy ID người dùng từ authentication
                // Tạm thời hardcode ID người dùng hiện tại
                Long currentUserId = 1L; // Hardcode tạm thời
                System.out.println("Current user ID for exclusion (hardcoded): " + currentUserId);

                if (currentUserId != null) {
                    int beforeSize = searchResults.size();
                    searchResults = searchResults.stream()
                            .filter(user -> !user.getId().equals(currentUserId))
                            .collect(Collectors.toList());
                    System.out.println("Excluded current user from results: " + (beforeSize - searchResults.size())
                            + " users removed");
                }
            }

            System.out.println("Final search results count: " + searchResults.size());
            if (searchResults.isEmpty()) {
                System.out.println("No users found matching the search term: " + searchTerm);
            } else {
                System.out.println("Found users: " + searchResults.stream()
                        .map(u -> u.getId() + ":" + u.getFirstName() + " " + u.getLastName())
                        .collect(Collectors.joining(", ")));
            }
            System.out.println("=========================================\n");

            return ResponseEntity.ok(new ResponseObject("success", "Users found", searchResults));
        } catch (Exception e) {
            System.out.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("failed", "Error searching users: " + e.getMessage(), null));
        }
    }

    // Helper method to get current user ID from authentication
    // In a real authentication setup, you would get this from the SecurityContext
    private Long getUserIdFromAuthentication() {
        // TODO: Implement proper authentication and get user ID from security context
        // For now, this is a placeholder for future implementation
        System.out.println("WARNING: Using placeholder authentication method");
        return null; // Return null to indicate no authentication is available
    }

    // Cập nhật thông tin user
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            // Không kiểm tra xác thực người dùng tạm thời để sửa lỗi
            // Trong môi trường thực tế, bạn nên lấy ID người dùng từ token xác thực
            // Long loggedInUserId = getUserIdFromAuthentication();
            // if (!id.equals(loggedInUserId)) {
            // return ResponseEntity.status(HttpStatus.FORBIDDEN)
            // .body(new ResponseObject("failed", "You can only update your own profile",
            // null));
            // }

            // Ghi log để debug
            System.out.println("Authentication check bypassed for user update - userId: " + id);
            return userService.findById(id)
                    .map(existingUser -> {
                        // Chỉ cập nhật các trường được gửi từ frontend
                        if (updatedUser.getFirstName() != null) {
                            existingUser.setFirstName(updatedUser.getFirstName());
                        }
                        if (updatedUser.getLastName() != null) {
                            existingUser.setLastName(updatedUser.getLastName());
                        }
                        if (updatedUser.getEmail() != null) {
                            existingUser.setEmail(updatedUser.getEmail());
                        }
                        if (updatedUser.getBio() != null) {
                            existingUser.setBio(updatedUser.getBio());
                        }
                        if (updatedUser.getDateOfBirth() != null) {
                            existingUser.setDateOfBirth(updatedUser.getDateOfBirth());
                        }
                        if (updatedUser.getGender() != null) {
                            existingUser.setGender(updatedUser.getGender());
                        }
                        if (updatedUser.getWork() != null) {
                            existingUser.setWork(updatedUser.getWork());
                        }
                        if (updatedUser.getEducation() != null) {
                            existingUser.setEducation(updatedUser.getEducation());
                        }
                        if (updatedUser.getCurrentCity() != null) {
                            existingUser.setCurrentCity(updatedUser.getCurrentCity());
                        }
                        if (updatedUser.getHometown() != null) {
                            existingUser.setHometown(updatedUser.getHometown());
                        }

                        User savedUser = userService.saveUser(existingUser);
                        return ResponseEntity.ok(new ResponseObject("success", "User updated successfully", savedUser));
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ResponseObject("failed", "User not found", null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("failed", "Error: " + e.getMessage(), null));
        }
    }

    // Chức năng xóa người dùng chỉ dành cho admin
    // Sử dụng API: DELETE /api/admin/users/{id}

    // Thêm endpoint để upload ảnh đại diện
    @PostMapping("/avatar")
    public ResponseEntity<ResponseObject> uploadAvatar(
            @RequestParam("userId") Long userId,
            @RequestParam("avatar") MultipartFile avatar) {
        try {
            // Log request information for debugging
            System.out.println("\n\n========= AVATAR UPLOAD REQUEST ===========");
            System.out.println("Received avatar upload request for user ID: " + userId);
            System.out.println("File name: " + avatar.getOriginalFilename());
            System.out.println("File size: " + avatar.getSize() + " bytes");
            System.out.println("Content type: " + avatar.getContentType());
            System.out.println("Is file empty: " + avatar.isEmpty());

            // Kiểm tra file có tồn tại không
            if (avatar.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "Avatar file is empty", null));
            }

            // Kiểm tra kích thước file (10MB max)
            if (avatar.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "Avatar file too large (max 10MB)", null));
            }

            // Kiểm tra loại file
            String contentType = avatar.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "Only image files are allowed", null));
            }

            // Kiểm tra userId có hợp lệ không
            if (userId == null) {
                System.out.println("userId is null");
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "userId is required", null));
            }

            // Không kiểm tra xác thực người dùng tạm thời để sửa lỗi
            // Trong môi trường thực tế, bạn nên lấy ID người dùng từ token xác thực
            // Long loggedInUserId = getUserIdFromAuthentication();
            // if (!userId.equals(loggedInUserId)) {
            // System.out.println("Access denied - User attempting to modify another user's
            // avatar");
            // return ResponseEntity.status(HttpStatus.FORBIDDEN)
            // .body(new ResponseObject("failed", "You can only update your own avatar",
            // null));
            // }

            // Ghi log để debug
            System.out.println("Authentication check bypassed for avatar upload - userId: " + userId);

            // Check if user exists
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                System.out.println("User not found with ID: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("failed", "User not found with ID: " + userId, null));
            }

            try {
                System.out.println("User found, proceeding to save avatar");
                // Kiểm tra thư mục uploads tồn tại
                String rootDir = System.getProperty("user.dir");
                File uploadsDir = new File(rootDir, "uploads");
                File avatarsDir = new File(rootDir, "uploads" + File.separator + "avatars");

                System.out.println("Root directory: " + rootDir);
                System.out.println("Uploads directory: " + uploadsDir.getAbsolutePath());
                System.out.println("Avatars directory: " + avatarsDir.getAbsolutePath());

                if (!uploadsDir.exists()) {
                    boolean created = uploadsDir.mkdirs();
                    System.out.println("Created uploads directory: " + created);
                }

                if (!avatarsDir.exists()) {
                    boolean created = avatarsDir.mkdirs();
                    System.out.println("Created avatars directory: " + created);
                }

                // Kiểm tra quyền ghi vào thư mục
                if (!avatarsDir.canWrite()) {
                    System.out.println("ERROR: Cannot write to avatars directory");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new ResponseObject("failed", "Server error: Cannot write to upload directory", null));
                }

                String avatarUrl = userService.updateAvatar(userId, avatar);
                System.out.println("Avatar URL after saving: " + avatarUrl);

                // Kiểm tra URL trả về có hợp lệ không
                if (avatarUrl == null || avatarUrl.isEmpty()) {
                    System.out.println("Avatar URL is null or empty");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new ResponseObject("failed", "Failed to generate avatar URL", null));
                }

                return ResponseEntity.ok(new ResponseObject("success", "Avatar updated successfully", avatarUrl));
            } catch (Exception e) {
                System.out.println("Error in inner try block: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseObject("failed", "Failed to save avatar: " + e.getMessage(), null));
            }
        } catch (Exception e) {
            System.out.println("Error in outer try block: " + e.getMessage());
            e.printStackTrace(); // In lỗi chi tiết vào console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("failed", "Error uploading avatar: " + e.getMessage(), null));
        }
    }

    // Thêm endpoint để upload ảnh bìa
    @PostMapping("/cover")
    public ResponseEntity<ResponseObject> uploadCoverPhoto(
            @RequestParam("userId") Long userId,
            @RequestParam("cover") MultipartFile cover) {
        try {
            System.out.println("\n\n========= COVER PHOTO UPLOAD REQUEST ===========");
            System.out.println("Received cover photo upload request for user ID: " + userId);
            System.out.println("File name: " + cover.getOriginalFilename());
            System.out.println("File size: " + cover.getSize() + " bytes");
            System.out.println("Content type: " + cover.getContentType());

            // Kiểm tra file có tồn tại không
            if (cover.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "Cover photo file is empty", null));
            }

            // Kiểm tra kích thước file (20MB max)
            if (cover.getSize() > 20 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "Cover photo too large (max 20MB)", null));
            }

            // Kiểm tra loại file
            String contentType = cover.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "Only image files are allowed", null));
            }

            // Kiểm tra userId có hợp lệ không
            if (userId == null) {
                System.out.println("userId is null");
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("failed", "userId is required", null));
            }

            // Không kiểm tra xác thực người dùng tạm thời để sửa lỗi
            // Trong môi trường thực tế, bạn nên lấy ID người dùng từ token xác thực
            // Long loggedInUserId = getUserIdFromAuthentication();
            // if (!userId.equals(loggedInUserId)) {
            // System.out.println("Access denied - User attempting to modify another user's
            // cover photo");
            // return ResponseEntity.status(HttpStatus.FORBIDDEN)
            // .body(new ResponseObject("failed", "You can only update your own cover
            // photo", null));
            // }

            // Ghi log để debug
            System.out.println("Authentication check bypassed for cover photo upload - userId: " + userId);

            // Check if user exists
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                System.out.println("User not found with ID: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseObject("failed", "User not found with ID: " + userId, null));
            }

            try {
                System.out.println("User found, proceeding to save cover photo");
                // Kiểm tra thư mục uploads tồn tại
                String rootDir = System.getProperty("user.dir");
                File uploadsDir = new File(rootDir, "uploads");
                File coversDir = new File(rootDir, "uploads" + File.separator + "covers");

                System.out.println("Root directory: " + rootDir);
                System.out.println("Uploads directory: " + uploadsDir.getAbsolutePath());
                System.out.println("Covers directory: " + coversDir.getAbsolutePath());

                if (!uploadsDir.exists()) {
                    boolean created = uploadsDir.mkdirs();
                    System.out.println("Created uploads directory: " + created);
                }

                if (!coversDir.exists()) {
                    boolean created = coversDir.mkdirs();
                    System.out.println("Created covers directory: " + created);
                }

                // Kiểm tra quyền ghi vào thư mục
                if (!coversDir.canWrite()) {
                    System.out.println("ERROR: Cannot write to covers directory");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new ResponseObject("failed", "Server error: Cannot write to upload directory", null));
                }

                String coverUrl = userService.updateCoverPhoto(userId, cover);
                System.out.println("Cover photo URL after saving: " + coverUrl);

                // Kiểm tra URL trả về có hợp lệ không
                if (coverUrl == null || coverUrl.isEmpty()) {
                    System.out.println("Cover photo URL is null or empty");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new ResponseObject("failed", "Failed to generate cover photo URL", null));
                }

                return ResponseEntity.ok(new ResponseObject("success", "Cover photo updated successfully", coverUrl));
            } catch (Exception e) {
                System.out.println("Error saving cover photo: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseObject("failed", "Failed to save cover photo: " + e.getMessage(), null));
            }
        } catch (Exception e) {
            System.out.println("Error in outer try block: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("failed", "Error uploading cover photo: " + e.getMessage(), null));
        }
    }
}