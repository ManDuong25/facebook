package backend.backend.controller;

import backend.backend.model.ResponseObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // API để liệt kê tất cả file ảnh đại diện
    @GetMapping("/avatars")
    public ResponseEntity<ResponseObject> listAvatars() {
        try {
            File avatarsDir = new File("uploads/avatars");
            if (!avatarsDir.exists() || !avatarsDir.isDirectory()) {
                return ResponseEntity.ok(
                        new ResponseObject("success", "Avatars directory doesn't exist", new ArrayList<>()));
            }

            File[] files = avatarsDir.listFiles();
            if (files == null) {
                return ResponseEntity.ok(
                        new ResponseObject("success", "No avatar files found", new ArrayList<>()));
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
                    new ResponseObject("success", "Avatar files retrieved successfully", fileInfos));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ResponseObject("error", "Failed to list avatar files: " + e.getMessage(), null));
        }
    }

    // API để xóa file ảnh đại diện
    @DeleteMapping("/avatars/{filename}")
    public ResponseEntity<ResponseObject> deleteAvatar(@PathVariable String filename) {
        try {
            // Chỉ cho phép xóa file trong thư mục uploads/avatars
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("error", "Invalid filename", null));
            }

            File file = new File("uploads/avatars/" + filename);
            if (!file.exists()) {
                return ResponseEntity.ok(
                        new ResponseObject("warning", "File does not exist", null));
            }

            boolean deleted = file.delete();
            if (deleted) {
                return ResponseEntity.ok(
                        new ResponseObject("success", "File deleted successfully", filename));
            } else {
                return ResponseEntity.internalServerError()
                        .body(new ResponseObject("error", "Failed to delete file", null));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ResponseObject("error", "Error deleting file: " + e.getMessage(), null));
        }
    }

    // API để xóa tất cả file ảnh đại diện không sử dụng
    @DeleteMapping("/avatars/unused")
    public ResponseEntity<ResponseObject> deleteUnusedAvatars() {
        try {
            // TODO: Implement logic to find unused avatars by checking user table
            // Đây là một tính năng phức tạp cần xây dựng thêm
            return ResponseEntity.ok(
                    new ResponseObject("success", "This feature is not implemented yet", null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ResponseObject("error", "Error deleting unused files: " + e.getMessage(), null));
        }
    }
} 