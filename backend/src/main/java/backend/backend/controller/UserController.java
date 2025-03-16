package backend.backend.controller;

import backend.backend.model.ResponseObject;
import backend.backend.model.User;
import backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseObject registerUser(@RequestBody(required = false) User user,
                                       @RequestParam(required = false) String username,
                                       @RequestParam(required = false) String email,
                                       @RequestParam(required = false) String password,
                                       @RequestParam(required = false) MultipartFile avatar) {
        // Nếu dữ liệu được gửi dưới dạng form-data
        if (user == null && username != null && email != null && password != null) {
            user = new User(null, username, email, password, null, LocalDateTime.now());
        }

        if (user == null || user.getEmail() == null) {
            return new ResponseObject("failed", "Invalid request data", null);
        }

        if (userService.existsByEmail(user.getEmail())) {
            return new ResponseObject("failed", "Email already exists", null);
        }

        // Xử lý lưu ảnh đại diện (nếu có)
        if (avatar != null && !avatar.isEmpty()) {
            String avatarPath = saveAvatar(avatar); 
            user.setAvatar(avatarPath);
        }

        User savedUser = userService.saveUser(user);
        return new ResponseObject("success", "User registered successfully", savedUser);
    }

    private String saveAvatar(MultipartFile file) {
        if (file.isEmpty()) {
            return null;
        }
        try {
            // Tạo tên file ngẫu nhiên để tránh trùng lặp
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            // Đường dẫn folder bạn muốn lưu ảnh (ví dụ: "uploads/")
            String uploadDir = "uploads/";
            
            // Tạo thư mục nếu chưa tồn tại
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Lưu file vào thư mục
            String filePath = uploadDir + fileName;
            File destinationFile = new File(filePath);
            file.transferTo(destinationFile);

            // Trả về đường dẫn để lưu vào cơ sở dữ liệu
            return filePath;
            
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/{id}")
    public ResponseObject getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        return user.map(value -> new ResponseObject("success", "User found", value))
                   .orElseGet(() -> new ResponseObject("failed", "User not found", null));
    }

    @GetMapping("/getAll")
    public ResponseObject getAllUsers() {
        List<User> users = userService.findAllUsers();
        return new ResponseObject("success", "All users retrieved", users);
    }

    @PutMapping("/{id}")
    public ResponseObject updateUser(@PathVariable Long id, @RequestBody User user) {
        Optional<User> existingUser = userService.findById(id);
        if (existingUser.isPresent()) {
            user.setId(id);
            User updatedUser = userService.saveUser(user);
            return new ResponseObject("success", "User updated successfully", updatedUser);
        }
        return new ResponseObject("failed", "User not found", null);
    }

    @DeleteMapping("/{id}")
    public ResponseObject deleteUser(@PathVariable Long id) {
        if (userService.findById(id).isPresent()) {
            userService.deleteUserById(id);
            return new ResponseObject("success", "User deleted successfully", null);
        }
        return new ResponseObject("failed", "User not found", null);
    }
    @PostMapping("/login")
    public ResponseObject loginUser(
            @RequestBody(required = false) User loginRequest,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String password) {
    
        // Nếu nhận qua JSON (application/json)
        if (loginRequest != null && loginRequest.getEmail() != null && loginRequest.getPassword() != null) {
            email = loginRequest.getEmail();
            password = loginRequest.getPassword();
        }
    
        // Kiểm tra nếu email hoặc password bị thiếu
        if (email == null || password == null) {
            return new ResponseObject("failed", "Email or Password is missing", null);
        }
    
        Optional<User> user = userService.findByEmail(email);
    
        if (user.isPresent()) {
            if (user.get().getPassword().equals(password)) {
                return new ResponseObject("success", "Login successful", user.get());
            } else {
                return new ResponseObject("failed", "Incorrect password", null);
            }
        } else {
            return new ResponseObject("failed", "User not found", null);
        }
    }
    

}
