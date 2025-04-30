package backend.backend.service;

import backend.backend.model.User;
import backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Lưu user mới hoặc cập nhật user đã tồn tại
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Kiểm tra xem email đã tồn tại chưa
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Kiểm tra xem username đã tồn tại chưa
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    // Lấy user bằng ID, trả về null nếu không tìm thấy
    public User getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        return userOpt.orElse(null);
    }

    // Tìm user bằng ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Tìm user bằng username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Tìm user bằng email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Lấy tất cả user
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // Tìm kiếm người dùng theo tên, username, hoặc email
    public List<User> searchUsers(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            throw new IllegalArgumentException("Search term cannot be empty");
        }

        // Log để debug
        System.out.println("Searching users with term: " + searchTerm);

        List<User> results = new ArrayList<>();
        String trimmedTerm = searchTerm.trim();

        // Tìm kiếm chính xác trước
        List<User> exactMatches = userRepository.findByExactFullName(trimmedTerm);
        if (!exactMatches.isEmpty()) {
            results.addAll(exactMatches);
            System.out.println("Found " + exactMatches.size() + " exact matches");
        }

        // Nếu không có kết quả chính xác, tìm với cách thông thường
        if (results.isEmpty()) {
            List<User> normalMatches = userRepository.searchUsers(trimmedTerm);
            results.addAll(normalMatches);
            System.out.println("Found " + normalMatches.size() + " normal matches");

            // Nếu vẫn không có kết quả, thử tìm theo từng từ trong cụm từ tìm kiếm
            if (results.isEmpty() && trimmedTerm.contains(" ")) {
                String[] words = trimmedTerm.split("\\s+");
                Set<User> wordMatches = new HashSet<>();

                for (String word : words) {
                    if (word.length() > 1) { // Chỉ tìm kiếm từ có ít nhất 2 ký tự
                        wordMatches.addAll(userRepository.searchUsersByWord(word));
                    }
                }

                results.addAll(wordMatches);
                System.out.println("Found " + wordMatches.size() + " word-based matches");
            }
        }

        // Loại bỏ trùng lặp nếu có
        results = results.stream().distinct().collect(Collectors.toList());

        System.out.println("Total unique results: " + results.size());
        return results;
    }

    // Xóa user theo ID
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    // Kiểm tra xem user có tồn tại không
    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    // Lấy danh sách user có phân trang
    public Page<User> findAllUsersWithPagination(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    // Đếm tổng số người dùng
    public long countAllUsers() {
        return userRepository.count();
    }

    // Đếm số người dùng được tạo trong n ngày qua
    public int countUsersCreatedInLastDays(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return userRepository.countByCreatedAtAfter(startDate);
    }



    // Xử lý lưu ảnh đại diện (nếu có)
    public String saveAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {  // Kiểm tra null để tránh lỗi
            System.out.println("Avatar file is null or empty");
            return null;
        }
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                System.out.println("Original filename is null or empty");
                throw new RuntimeException("File name is missing");
            }

            // In thông tin chi tiết để debug
            System.out.println("Original filename: " + originalFilename);
            System.out.println("Content type: " + file.getContentType());
            System.out.println("Size: " + file.getSize() + " bytes");

            // Tạo tên file duy nhất với UUID
            String fileName = UUID.randomUUID().toString() + "_" + originalFilename;

            // Tạo đường dẫn tuyệt đối (không dùng đường dẫn tương đối)
            String rootDir = System.getProperty("user.dir");
            String uploadDir = rootDir + File.separator + "uploads" + File.separator + "avatars" + File.separator;

            // In ra để debug
            System.out.println("Root directory: " + rootDir);
            System.out.println("Upload directory: " + uploadDir);

            // Đảm bảo thư mục tồn tại
            File directory = new File(uploadDir);
            System.out.println("Absolute directory path: " + directory.getAbsolutePath());

            if (!directory.exists()) {
                if (directory.mkdirs()) {
                    System.out.println("Created directory: " + directory.getAbsolutePath());
                } else {
                    System.out.println("Failed to create directory: " + directory.getAbsolutePath());
                    throw new RuntimeException("Failed to create directory: " + directory.getAbsolutePath());
                }
            }

            // Kiểm tra quyền ghi
            if (!directory.canWrite()) {
                System.out.println("ERROR: No write permission to directory: " + directory.getAbsolutePath());
                throw new RuntimeException("No write permission to upload directory");
            }

            // Tạo file path đầy đủ
            String filePath = uploadDir + fileName;
            File destFile = new File(filePath);

            // Lưu file với 2 phương pháp để đảm bảo
            System.out.println("Attempting to save file to: " + destFile.getAbsolutePath());
            try {
                // Phương pháp 1: Sử dụng transferTo
                file.transferTo(destFile);
                System.out.println("File transfer completed using transferTo()");
            } catch (IOException e) {
                System.out.println("Error during file transfer with transferTo(): " + e.getMessage());
                e.printStackTrace();

                // Phương pháp 2: Sử dụng streams
                try (java.io.InputStream inputStream = file.getInputStream();
                     java.io.FileOutputStream outputStream = new java.io.FileOutputStream(destFile)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                    System.out.println("File transfer completed using streams");
                } catch (IOException ex) {
                    System.out.println("Error during file transfer with streams: " + ex.getMessage());
                    ex.printStackTrace();
                    throw new RuntimeException("Error transferring file: " + ex.getMessage());
                }
            }

            // Kiểm tra file đã lưu thành công chưa
            if (destFile.exists()) {
                System.out.println("File saved successfully at: " + destFile.getAbsolutePath());

                // URL relative path - this will be used by the frontend
                String avatarUrlPath = "/uploads/avatars/" + fileName;
                System.out.println("Avatar URL path: " + avatarUrlPath);
                return avatarUrlPath;
            } else {
                System.out.println("File was not created properly at: " + destFile.getAbsolutePath());
                throw new RuntimeException("File was not created properly");
            }
        } catch (Exception e) {
            System.out.println("Exception in saveAvatar: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save avatar: " + e.getMessage());
        }
    }

    // Cập nhật ảnh đại diện cho user
    public String updateAvatar(Long userId, MultipartFile avatar) {
        // Tìm user theo ID
        User user = findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        System.out.println("Starting avatar update for user: " + user.getUsername() + " (ID: " + userId + ")");

        try {
            // Xóa ảnh cũ nếu có
            String oldAvatarUrl = user.getAvatar();
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
                // Lấy tên file từ URL
                String oldFilename = oldAvatarUrl.substring(oldAvatarUrl.lastIndexOf("/") + 1);
                String rootDir = System.getProperty("user.dir");
                File oldFile = new File(rootDir + File.separator + "uploads" + File.separator + "avatars" + File.separator + oldFilename);

                if (oldFile.exists()) {
                    boolean deleted = oldFile.delete();
                    System.out.println("Deleting old avatar file: " + oldFile.getAbsolutePath() + " - Success: " + deleted);
                } else {
                    System.out.println("Old avatar file not found: " + oldFile.getAbsolutePath());
                }
            }

            // Lưu ảnh mới
            System.out.println("Saving new avatar...");
            String avatarUrl = saveAvatar(avatar);

            if (avatarUrl == null) {
                throw new RuntimeException("Failed to save avatar file");
            }

            // Cập nhật user với URL ảnh mới
            System.out.println("Updating user with new avatar URL: " + avatarUrl);
            user.setAvatar(avatarUrl);
            userRepository.save(user);

            System.out.println("Avatar updated successfully");
            return avatarUrl;
        } catch (Exception e) {
            System.out.println("Error updating avatar: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update avatar: " + e.getMessage());
        }
    }

    // Xử lý lưu ảnh bìa
    public String saveCoverPhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            System.out.println("Cover photo file is null or empty");
            return null;
        }
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                System.out.println("Original filename is null or empty");
                throw new RuntimeException("File name is missing");
            }

            // In thông tin chi tiết để debug
            System.out.println("Original filename: " + originalFilename);
            System.out.println("Content type: " + file.getContentType());
            System.out.println("Size: " + file.getSize() + " bytes");

            // Tạo tên file duy nhất với UUID
            String fileName = UUID.randomUUID().toString() + "_" + originalFilename;

            // Tạo đường dẫn tuyệt đối (không dùng đường dẫn tương đối)
            String rootDir = System.getProperty("user.dir");
            String uploadDir = rootDir + File.separator + "uploads" + File.separator + "covers" + File.separator;

            // In ra để debug
            System.out.println("Root directory: " + rootDir);
            System.out.println("Upload directory: " + uploadDir);

            // Đảm bảo thư mục tồn tại
            File directory = new File(uploadDir);
            System.out.println("Absolute directory path: " + directory.getAbsolutePath());

            if (!directory.exists()) {
                if (directory.mkdirs()) {
                    System.out.println("Created directory: " + directory.getAbsolutePath());
                } else {
                    System.out.println("Failed to create directory: " + directory.getAbsolutePath());
                    throw new RuntimeException("Failed to create directory: " + directory.getAbsolutePath());
                }
            }

            // Kiểm tra quyền ghi
            if (!directory.canWrite()) {
                System.out.println("ERROR: No write permission to directory: " + directory.getAbsolutePath());
                throw new RuntimeException("No write permission to upload directory");
            }

            // Tạo file path đầy đủ
            String filePath = uploadDir + fileName;
            File destFile = new File(filePath);

            // Lưu file với 2 phương pháp để đảm bảo
            System.out.println("Attempting to save file to: " + destFile.getAbsolutePath());
            try {
                // Phương pháp 1: Sử dụng transferTo
                file.transferTo(destFile);
                System.out.println("File transfer completed using transferTo()");
            } catch (IOException e) {
                System.out.println("Error during file transfer with transferTo(): " + e.getMessage());
                e.printStackTrace();

                // Phương pháp 2: Sử dụng streams
                try (java.io.InputStream inputStream = file.getInputStream();
                     java.io.FileOutputStream outputStream = new java.io.FileOutputStream(destFile)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                    System.out.println("File transfer completed using streams");
                } catch (IOException ex) {
                    System.out.println("Error during file transfer with streams: " + ex.getMessage());
                    ex.printStackTrace();
                    throw new RuntimeException("Error transferring file: " + ex.getMessage());
                }
            }

            // Kiểm tra file đã lưu thành công chưa
            if (destFile.exists()) {
                System.out.println("File saved successfully at: " + destFile.getAbsolutePath());

                // URL relative path - this will be used by the frontend
                String coverUrlPath = "/uploads/covers/" + fileName;
                System.out.println("Cover URL path: " + coverUrlPath);
                return coverUrlPath;
            } else {
                System.out.println("File was not created properly at: " + destFile.getAbsolutePath());
                throw new RuntimeException("File was not created properly");
            }
        } catch (Exception e) {
            System.out.println("Exception in saveCoverPhoto: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save cover photo: " + e.getMessage());
        }
    }

    // Cập nhật ảnh bìa cho user
    public String updateCoverPhoto(Long userId, MultipartFile coverPhoto) {
        // Tìm user theo ID
        User user = findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        System.out.println("Starting cover photo update for user: " + user.getUsername() + " (ID: " + userId + ")");

        try {
            // Xóa ảnh bìa cũ nếu có
            String oldCoverUrl = user.getCoverPhoto();
            if (oldCoverUrl != null && !oldCoverUrl.isEmpty()) {
                // Lấy tên file từ URL
                String oldFilename = oldCoverUrl.substring(oldCoverUrl.lastIndexOf("/") + 1);
                String rootDir = System.getProperty("user.dir");
                File oldFile = new File(rootDir + File.separator + "uploads" + File.separator + "covers" + File.separator + oldFilename);

                if (oldFile.exists()) {
                    boolean deleted = oldFile.delete();
                    System.out.println("Deleting old cover file: " + oldFile.getAbsolutePath() + " - Success: " + deleted);
                } else {
                    System.out.println("Old cover file not found: " + oldFile.getAbsolutePath());
                }
            }

            // Lưu ảnh mới
            System.out.println("Saving new cover photo...");
            String coverUrl = saveCoverPhoto(coverPhoto);

            if (coverUrl == null) {
                throw new RuntimeException("Failed to save cover photo file");
            }

            // Cập nhật user với URL ảnh bìa mới
            System.out.println("Updating user with new cover URL: " + coverUrl);
            user.setCoverPhoto(coverUrl);
            userRepository.save(user);

            System.out.println("Cover photo updated successfully");
            return coverUrl;
        } catch (Exception e) {
            System.out.println("Error updating cover photo: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update cover photo: " + e.getMessage());
        }
    }
}